import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Truck, MapPin, Gauge, Power, Clock, Activity, 
  MessageSquare, Package, Navigation, AlertTriangle,
  Send, Plus, Trash2, RefreshCw, FileText
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import toast from 'react-hot-toast';

function VehicleDetails() {
  const { deviceNumber } = useParams();
  const navigate = useNavigate();
  const { devices, positions, activities, setDeviceTasks } = useStore();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState({
    locationAddress: '',
    locationLatitude: '',
    locationLongitude: '',
    actionType: 'DELIVERY'
  });
  const [periodReport, setPeriodReport] = useState(null);
  
  const device = devices.find(d => d.number === deviceNumber);
  const position = positions.find(p => p.deviceNumber === deviceNumber);
  const deviceActivities = activities.filter(a => a.deviceNumber === deviceNumber).slice(0, 20);

  useEffect(() => {
    if (deviceNumber) {
      loadTasks();
      loadPeriodReport();
    }
  }, [deviceNumber]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/device/${deviceNumber}/tasks`);
      setTasks(response.data);
      setDeviceTasks(deviceNumber, response.data);
    } catch (error) {
      toast.error('Ошибка загрузки задач');
    } finally {
      setLoading(false);
    }
  };

  const loadPeriodReport = async () => {
    try {
      const to = Date.now();
      const from = to - 24 * 60 * 60 * 1000; // Последние 24 часа
      const response = await axios.get(
        `/api/device/${deviceNumber}/report?from=${from}&to=${to}`
      );
      setPeriodReport(response.data);
    } catch (error) {
      console.error('Ошибка загрузки отчета:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await axios.post(`/api/device/${deviceNumber}/message`, { message });
      toast.success('Сообщение отправлено');
      setMessage('');
      setShowMessageModal(false);
    } catch (error) {
      toast.error('Ошибка отправки сообщения');
    }
  };

  const createTask = async () => {
    if (!newTask.locationAddress) {
      toast.error('Укажите адрес доставки');
      return;
    }
    
    try {
      await axios.post(`/api/device/${deviceNumber}/task`, {
        localId: `TASK-${Date.now()}`,
        locationAddress: newTask.locationAddress,
        locationLatitude: parseFloat(newTask.locationLatitude) || null,
        locationLongitude: parseFloat(newTask.locationLongitude) || null,
        actionTagModel: {
          actionType: newTask.actionType
        }
      });
      toast.success('Задача создана');
      setNewTask({
        locationAddress: '',
        locationLatitude: '',
        locationLongitude: '',
        actionType: 'DELIVERY'
      });
      setShowTaskModal(false);
      loadTasks();
    } catch (error) {
      toast.error('Ошибка создания задачи');
    }
  };

  const deletePendingTasks = async () => {
    if (!confirm('Удалить все ожидающие задачи?')) return;
    
    try {
      await axios.delete(`/api/device/${deviceNumber}/tasks/pending`);
      toast.success('Задачи удалены');
      loadTasks();
    } catch (error) {
      toast.error('Ошибка удаления задач');
    }
  };

  if (!device) return <div className="p-4">Устройство не найдено</div>;

  const getStatus = () => {
    if (!position) return { label: 'Оффлайн', color: 'gray' };
    const isOnline = Date.now() - position.time < 300000;
    if (!isOnline) return { label: 'Оффлайн', color: 'gray' };
    if (position.speed > 5) return { label: 'В движении', color: 'info' };
    if (position.ignitionState === 'ON') return { label: 'Простой', color: 'warning' };
    return { label: 'Остановлен', color: 'success' };
  };

  const status = getStatus();

  return (
    <div className="p-4">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck size={24} />
            {device.registrationNumber}
          </h2>
          {device.name && <p className="text-gray">{device.name}</p>}
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => setShowMessageModal(true)}
          >
            <MessageSquare size={16} />
            Сообщение
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowTaskModal(true)}
          >
            <Plus size={16} />
            Новая задача
          </button>
          <button 
            className="btn btn-outline"
            onClick={loadTasks}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {/* Текущее состояние */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Текущее состояние</h3>
            <span className={`badge badge-${status.color}`}>{status.label}</span>
          </div>
          
          {position ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gauge size={18} className="text-gray" />
                <span>Скорость:</span>
                <span className="font-semibold">{position.speed} км/ч</span>
              </div>
              <div className="flex items-center gap-2">
                <Power size={18} className="text-gray" />
                <span>Зажигание:</span>
                <span className={`font-semibold ${position.ignitionState === 'ON' ? 'text-success' : 'text-gray'}`}>
                  {position.ignitionState === 'ON' ? 'Включено' : 'Выключено'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray" />
                <span>Координаты:</span>
                <span className="font-semibold text-sm">
                  {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-gray" />
                <span>Обновлено:</span>
                <span className="font-semibold">
                  {formatDistanceToNow(new Date(position.time), {
                    addSuffix: true,
                    locale: ru
                  })}
                </span>
              </div>
              <button 
                className="btn btn-primary btn-sm w-full mt-3"
                onClick={() => navigate(`/map?device=${deviceNumber}`)}
              >
                <Navigation size={14} />
                Показать на карте
              </button>
            </div>
          ) : (
            <p className="text-gray text-center py-4">Нет данных о позиции</p>
          )}
        </div>

        {/* Активные задачи */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Активные задачи ({tasks.length})</h3>
            {tasks.filter(t => t.status === 'PENDING').length > 0 && (
              <button 
                className="btn btn-danger btn-sm"
                onClick={deletePendingTasks}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-auto">
              {tasks.map((task, index) => (
                <div 
                  key={task.taskId || index}
                  className="p-2 border rounded-lg"
                  style={{
                    borderLeft: `4px solid ${
                      task.status === 'COMPLETED' ? 'var(--secondary)' :
                      task.status === 'IN_PROGRESS_NOW' ? 'var(--info)' :
                      'var(--gray)'
                    }`
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.locationAddress}</p>
                      {task.actionTagModel && (
                        <span className="badge badge-info text-xs mt-1">
                          {task.actionTagModel.actionType}
                        </span>
                      )}
                    </div>
                    <span className={`badge badge-${
                      task.status === 'COMPLETED' ? 'success' :
                      task.status === 'IN_PROGRESS_NOW' ? 'info' :
                      'gray'
                    } text-xs`}>
                      {task.status === 'COMPLETED' ? 'Выполнено' :
                       task.status === 'IN_PROGRESS_NOW' ? 'Выполняется' :
                       'Ожидание'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray text-center py-4">Нет активных задач</p>
          )}
        </div>

        {/* Статистика за день */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Статистика за 24 часа</h3>
            <FileText size={18} />
          </div>
          
          {periodReport ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Пробег:</span>
                <span className="font-semibold">{periodReport.distance || 0} км</span>
              </div>
              <div className="flex justify-between">
                <span>Время в движении:</span>
                <span className="font-semibold">{periodReport.movingTime || 0} ч</span>
              </div>
              <div className="flex justify-between">
                <span>Остановок:</span>
                <span className="font-semibold">{periodReport.stops || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Средняя скорость:</span>
                <span className="font-semibold">{periodReport.avgSpeed || 0} км/ч</span>
              </div>
              <div className="flex justify-between">
                <span>Макс. скорость:</span>
                <span className="font-semibold">{periodReport.maxSpeed || 0} км/ч</span>
              </div>
            </div>
          ) : (
            <p className="text-gray text-center py-4">Загрузка статистики...</p>
          )}
        </div>
      </div>

      {/* История активности */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="font-semibold">История активности</h3>
          <Activity size={18} />
        </div>
        
        {deviceActivities.length > 0 ? (
          <div className="space-y-2">
            {deviceActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border-b">
                <div className={`badge badge-${
                  activity.type === 'TASK_VISIT' ? 'success' :
                  activity.type === 'MESSAGE_NEW' ? 'info' :
                  activity.type === 'TASK_CREATE' ? 'warning' :
                  'gray'
                }`}>
                  {activity.type}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description || activity.type}</p>
                </div>
                <span className="text-xs text-gray">
                  {format(new Date(activity.created), 'dd.MM HH:mm:ss')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray text-center py-4">Нет активности</p>
        )}
      </div>

      {/* Модальное окно для сообщения */}
      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Отправить сообщение</h3>
              <button onClick={() => setShowMessageModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <textarea
                className="input"
                rows="4"
                placeholder="Введите сообщение для водителя..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowMessageModal(false)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={sendMessage}>
                <Send size={16} />
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для создания задачи */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Создать задачу</h3>
              <button onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray">Адрес доставки *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Например: Берлин, Hauptstraße 10"
                    value={newTask.locationAddress}
                    onChange={e => setNewTask({...newTask, locationAddress: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray">Широта</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="52.520008"
                      value={newTask.locationLatitude}
                      onChange={e => setNewTask({...newTask, locationLatitude: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray">Долгота</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="13.404954"
                      value={newTask.locationLongitude}
                      onChange={e => setNewTask({...newTask, locationLongitude: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray">Тип действия</label>
                  <select
                    className="input"
                    value={newTask.actionType}
                    onChange={e => setNewTask({...newTask, actionType: e.target.value})}
                  >
                    <option value="DELIVERY">Доставка</option>
                    <option value="PARCEL_LOAD">Погрузка</option>
                    <option value="PARCEL_UNLOAD">Разгрузка</option>
                    <option value="PICKUP">Забор груза</option>
                    <option value="BREAK">Перерыв</option>
                    <option value="FUEL">Заправка</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowTaskModal(false)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={createTask}>
                <Package size={16} />
                Создать задачу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleDetails;