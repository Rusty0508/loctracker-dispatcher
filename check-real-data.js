import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.VITE_LOCTRACKER_API_URL;
const USERNAME = process.env.VITE_LOCTRACKER_USERNAME;
const PASSWORD = process.env.VITE_LOCTRACKER_PASSWORD;

async function checkRealData() {
  console.log('🔍 Проверка реальных данных из LocTracker API...\n');
  
  try {
    // 1. Проверяем активности
    console.log('📊 АКТИВНОСТИ (последние события):');
    const activitiesUrl = `${API_URL}/${USERNAME}/activities?password=${encodeURIComponent(PASSWORD)}&latestRecordId=-1`;
    const activitiesRes = await axios.get(activitiesUrl);
    const activities = activitiesRes.data.activities || activitiesRes.data;
    
    if (Array.isArray(activities) && activities.length > 0) {
      console.log(`Найдено активностей: ${activities.length}`);
      activities.slice(0, 5).forEach(activity => {
        const date = new Date(activity.created);
        console.log(`  - ${activity.type} | ${activity.deviceNumber} | ${date.toLocaleString('ru')}`);
      });
    } else {
      console.log('  Нет недавних активностей');
    }
    
    // 2. Проверяем задачи для первых 3 устройств
    console.log('\n📋 ЗАДАЧИ (для первых 3 транспортных средств):');
    const devicesUrl = `${API_URL}/${USERNAME}/devices?password=${encodeURIComponent(PASSWORD)}`;
    const devicesRes = await axios.get(devicesUrl);
    const devices = devicesRes.data.devices || devicesRes.data;
    
    for (const device of devices.slice(0, 3)) {
      const tasksUrl = `${API_URL}/${USERNAME}/tasks/${device.number}/trip?password=${encodeURIComponent(PASSWORD)}`;
      try {
        const tasksRes = await axios.get(tasksUrl);
        const tasks = tasksRes.data.tasks || tasksRes.data;
        
        if (Array.isArray(tasks) && tasks.length > 0) {
          console.log(`\n  ${device.registrationNumber} (${device.name}):`);
          tasks.slice(0, 3).forEach(task => {
            console.log(`    ✓ ${task.locationAddress || 'Адрес не указан'}`);
            console.log(`      Статус: ${task.status || 'Неизвестен'}`);
            if (task.actionTagModel) {
              console.log(`      Тип: ${task.actionTagModel.actionType}`);
            }
          });
        } else {
          console.log(`  ${device.registrationNumber}: Нет активных задач`);
        }
      } catch (error) {
        console.log(`  ${device.registrationNumber}: Ошибка загрузки задач`);
      }
    }
    
    // 3. Проверяем состояние автопарка
    console.log('\n🚛 СОСТОЯНИЕ АВТОПАРКА:');
    const fleetUrl = `${API_URL}/${USERNAME}/fleet/state?password=${encodeURIComponent(PASSWORD)}`;
    try {
      const fleetRes = await axios.get(fleetUrl);
      console.log('  Данные состояния автопарка получены');
      if (fleetRes.data) {
        console.log(`  Структура данных:`, Object.keys(fleetRes.data));
      }
    } catch (error) {
      console.log('  Эндпоинт fleet/state недоступен');
    }
    
    // 4. Проверяем текущие позиции и скорости
    console.log('\n📍 ТЕКУЩЕЕ ДВИЖЕНИЕ:');
    const positionsUrl = `${API_URL}/${USERNAME}/positions?password=${encodeURIComponent(PASSWORD)}`;
    const positionsRes = await axios.get(positionsUrl);
    const positions = positionsRes.data.positions || positionsRes.data;
    
    const moving = positions.filter(p => p.speed > 5);
    const idle = positions.filter(p => p.speed <= 5 && p.ignitionState === 'ON');
    const stopped = positions.filter(p => p.ignitionState === 'OFF');
    
    console.log(`  В движении (скорость > 5 км/ч): ${moving.length} транспортных средств`);
    if (moving.length > 0) {
      moving.slice(0, 5).forEach(pos => {
        const device = devices.find(d => d.number === pos.deviceNumber);
        console.log(`    • ${device?.registrationNumber || pos.deviceNumber}: ${pos.speed} км/ч`);
      });
    }
    
    console.log(`  На холостом ходу: ${idle.length} транспортных средств`);
    console.log(`  Остановлено: ${stopped.length} транспортных средств`);
    
    // 5. Проверяем отчеты за последние 24 часа для первого устройства
    console.log('\n📈 ОТЧЕТ ЗА 24 ЧАСА:');
    const firstDevice = devices[0];
    if (firstDevice) {
      const to = Date.now();
      const from = to - 24 * 60 * 60 * 1000;
      const reportUrl = `${API_URL}/${USERNAME}/reports/period-summary/${firstDevice.number}?password=${encodeURIComponent(PASSWORD)}&from=${from}&to=${to}`;
      
      try {
        const reportRes = await axios.get(reportUrl);
        console.log(`  ${firstDevice.registrationNumber}:`);
        const report = reportRes.data;
        
        if (report.totalDistance !== undefined) {
          console.log(`    Пробег: ${(report.totalDistance / 1000).toFixed(1)} км`);
        }
        if (report.totalFuel !== undefined) {
          console.log(`    Расход топлива: ${report.totalFuel} л`);
        }
        if (report.avgSpeed !== undefined) {
          console.log(`    Средняя скорость: ${report.avgSpeed} км/ч`);
        }
      } catch (error) {
        console.log(`  Отчеты недоступны: ${error.response?.data?.errorDescription || error.message}`);
      }
    }
    
    // 6. Проверяем наличие тахографов
    console.log('\n📊 ТАХОГРАФЫ:');
    const tachoUrl = `${API_URL}/${USERNAME}/tachographs/state?password=${encodeURIComponent(PASSWORD)}`;
    try {
      const tachoRes = await axios.get(tachoUrl);
      const tachos = tachoRes.data.tachographs || tachoRes.data;
      if (Array.isArray(tachos) && tachos.length > 0) {
        console.log(`  Найдено тахографов: ${tachos.length}`);
      } else {
        console.log('  Данные тахографов отсутствуют');
      }
    } catch (error) {
      console.log('  Тахографы недоступны');
    }
    
    console.log('\n✅ Проверка завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.response?.data || error.message);
  }
}

checkRealData();