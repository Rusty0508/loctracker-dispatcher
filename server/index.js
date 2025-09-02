import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { LocTrackerService } from './services/loctracker.js';
import { EventEmitter } from 'events';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Инициализация сервиса LocTracker
const locTrackerService = new LocTrackerService(
  process.env.VITE_LOCTRACKER_API_URL,
  process.env.VITE_LOCTRACKER_USERNAME,
  process.env.VITE_LOCTRACKER_PASSWORD
);

// Хранилище данных в памяти
const cache = {
  devices: [],
  positions: [],
  activities: [],
  tasks: new Map(),
  fleetState: null,
  lastActivityId: -1,
  alerts: []
};

// Event emitter для системных событий
const systemEvents = new EventEmitter();

// Функция обновления данных устройств
async function updateDevices() {
  try {
    const devices = await locTrackerService.getDevices();
    cache.devices = devices;
    io.emit('devices:update', devices);
    console.log(`✅ Обновлено ${devices.length} устройств`);
  } catch (error) {
    console.error('❌ Ошибка обновления устройств:', error.message);
  }
}

// Функция обновления позиций
async function updatePositions() {
  try {
    const positions = await locTrackerService.getPositions();
    cache.positions = positions;
    
    // Проверка на критические события
    positions.forEach(pos => {
      // Проверка на превышение скорости
      if (pos.speed > 90) {
        const alert = {
          id: Date.now(),
          type: 'SPEED_VIOLATION',
          deviceNumber: pos.deviceNumber,
          message: `Превышение скорости: ${pos.speed} км/ч`,
          timestamp: new Date().toISOString(),
          severity: 'warning'
        };
        cache.alerts.push(alert);
        io.emit('alert:new', alert);
      }
      
      // Проверка на длительную остановку с включенным зажиганием
      if (pos.speed === 0 && pos.ignitionState === 'ON') {
        const lastPos = cache.positions.find(p => p.deviceNumber === pos.deviceNumber);
        if (lastPos && lastPos.speed === 0 && (Date.now() - pos.time) > 1800000) { // 30 минут
          const alert = {
            id: Date.now(),
            type: 'LONG_IDLE',
            deviceNumber: pos.deviceNumber,
            message: 'Длительная остановка с включенным двигателем',
            timestamp: new Date().toISOString(),
            severity: 'info'
          };
          cache.alerts.push(alert);
          io.emit('alert:new', alert);
        }
      }
    });
    
    io.emit('positions:update', positions);
    console.log(`📍 Обновлено ${positions.length} позиций`);
  } catch (error) {
    console.error('❌ Ошибка обновления позиций:', error.message);
  }
}

// Функция обновления активностей
async function updateActivities() {
  try {
    const activities = await locTrackerService.getActivities(cache.lastActivityId);
    if (activities && activities.length > 0) {
      cache.activities = [...activities, ...cache.activities].slice(0, 100); // Храним последние 100
      cache.lastActivityId = Math.max(...activities.map(a => a.id));
      
      // Отправляем новые активности клиентам
      activities.forEach(activity => {
        io.emit('activity:new', activity);
        
        // Создаем алерты для важных событий
        if (activity.type === 'TASK_VISIT') {
          const device = cache.devices.find(d => d.number === activity.deviceNumber);
          const alert = {
            id: Date.now(),
            type: 'TASK_COMPLETED',
            deviceNumber: activity.deviceNumber,
            message: `${device?.name || activity.deviceNumber} прибыл на точку`,
            timestamp: new Date().toISOString(),
            severity: 'success'
          };
          cache.alerts.push(alert);
          io.emit('alert:new', alert);
        }
      });
      
      console.log(`📊 Получено ${activities.length} новых активностей`);
    }
  } catch (error) {
    console.error('❌ Ошибка обновления активностей:', error.message);
  }
}

// Функция обновления состояния автопарка
async function updateFleetState() {
  try {
    const fleetState = await locTrackerService.getFleetState();
    cache.fleetState = fleetState;
    
    // Вычисляем статистику
    const stats = {
      total: cache.devices.length,
      online: cache.positions.filter(p => Date.now() - p.time < 300000).length, // Онлайн - обновление за последние 5 минут
      moving: cache.positions.filter(p => p.speed > 5).length,
      idle: cache.positions.filter(p => p.speed <= 5 && p.ignitionState === 'ON').length,
      stopped: cache.positions.filter(p => p.ignitionState === 'OFF').length
    };
    
    io.emit('fleet:stats', stats);
    console.log(`🚛 Статистика автопарка обновлена`);
  } catch (error) {
    console.error('❌ Ошибка обновления состояния автопарка:', error.message);
  }
}

// API эндпоинты
app.get('/api/devices', (req, res) => {
  res.json(cache.devices);
});

app.get('/api/positions', (req, res) => {
  res.json(cache.positions);
});

app.get('/api/activities', (req, res) => {
  res.json(cache.activities);
});

app.get('/api/fleet/stats', (req, res) => {
  const stats = {
    total: cache.devices.length,
    online: cache.positions.filter(p => Date.now() - p.time < 300000).length,
    moving: cache.positions.filter(p => p.speed > 5).length,
    idle: cache.positions.filter(p => p.speed <= 5 && p.ignitionState === 'ON').length,
    stopped: cache.positions.filter(p => p.ignitionState === 'OFF').length
  };
  res.json(stats);
});

app.get('/api/alerts', (req, res) => {
  res.json(cache.alerts.slice(-50)); // Последние 50 алертов
});

app.get('/api/device/:deviceNumber/tasks', async (req, res) => {
  try {
    const tasks = await locTrackerService.getDeviceTasks(req.params.deviceNumber);
    cache.tasks.set(req.params.deviceNumber, tasks);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/device/:deviceNumber/task', async (req, res) => {
  try {
    const result = await locTrackerService.addTask(req.params.deviceNumber, req.body);
    io.emit('task:created', { deviceNumber: req.params.deviceNumber, task: req.body });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/device/:deviceNumber/message', async (req, res) => {
  try {
    const result = await locTrackerService.sendMessage(req.params.deviceNumber, req.body.message);
    io.emit('message:sent', { deviceNumber: req.params.deviceNumber, message: req.body.message });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/device/:deviceNumber/tasks/pending', async (req, res) => {
  try {
    const result = await locTrackerService.deletePendingTasks(req.params.deviceNumber);
    io.emit('tasks:deleted', { deviceNumber: req.params.deviceNumber });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket соединения
io.on('connection', (socket) => {
  console.log('✅ Клиент подключен:', socket.id);
  
  // Отправляем начальные данные
  socket.emit('initial:data', {
    devices: cache.devices,
    positions: cache.positions,
    activities: cache.activities.slice(0, 50),
    alerts: cache.alerts.slice(-20)
  });
  
  // Подписка на обновления конкретного устройства
  socket.on('subscribe:device', async (deviceNumber) => {
    socket.join(`device:${deviceNumber}`);
    const tasks = await locTrackerService.getDeviceTasks(deviceNumber);
    socket.emit('device:tasks', { deviceNumber, tasks });
  });
  
  socket.on('unsubscribe:device', (deviceNumber) => {
    socket.leave(`device:${deviceNumber}`);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Клиент отключен:', socket.id);
  });
});

// Планировщик задач
// Обновление позиций каждые 10 секунд
cron.schedule('*/10 * * * * *', updatePositions);

// Обновление активностей каждые 5 секунд
cron.schedule('*/5 * * * * *', updateActivities);

// Обновление устройств каждую минуту
cron.schedule('0 * * * * *', updateDevices);

// Обновление состояния автопарка каждые 30 секунд
cron.schedule('*/30 * * * * *', updateFleetState);

// Очистка старых алертов каждые 5 минут
cron.schedule('*/5 * * * *', () => {
  const fiveMinutesAgo = Date.now() - 300000;
  cache.alerts = cache.alerts.filter(alert => 
    new Date(alert.timestamp).getTime() > fiveMinutesAgo
  );
  console.log('🧹 Очищены старые алерты');
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, async () => {
  console.log(`🚀 Сервер диспетчеризации запущен на порту ${PORT}`);
  
  // Начальная загрузка данных
  console.log('📡 Загрузка начальных данных...');
  await updateDevices();
  await updatePositions();
  await updateActivities();
  await updateFleetState();
  console.log('✅ Система готова к работе!');
});