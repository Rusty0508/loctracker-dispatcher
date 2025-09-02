import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Plus, Filter, Search, Truck, MapPin, 
  Clock, CheckCircle, AlertCircle, Package, Send,
  Calendar, Download, RefreshCw, Trash2, Edit2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function TaskManager() {
  const navigate = useNavigate();
  const { devices, positions, tasks } = useStore();
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('device');
  const [showBulkTaskModal, setShowBulkTaskModal] = useState(false);
  const [bulkTasks, setBulkTasks] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  useEffect(() => {
    loadAllTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [allTasks, selectedDevice, filterStatus, searchQuery, sortBy]);

  const loadAllTasks = async () => {
    setLoading(true);
    try {
      const taskPromises = devices.map(device => 
        axios.get(`/api/device/${device.number}/tasks`)
          .then(res => res.data.map(task => ({
            ...task,
            deviceNumber: device.number,
            deviceName: device.registrationNumber
          })))
          .catch(() => [])
      );
      
      const results = await Promise.all(taskPromises);
      const allDeviceTasks = results.flat();
      setAllTasks(allDeviceTasks);
    } catch (error) {
      toast.error('Ошибка загрузки задач');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTasks = () => {
    let filtered = [...allTasks];

    // Фильтр по устройству
    if (selectedDevice !== 'all') {
      filtered = filtered.filter(task => task.deviceNumber === selectedDevice);
    }

    // Фильтр по статусу
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.locationAddress?.toLowerCase().includes(query) ||
        task.deviceName?.toLowerCase().includes(query) ||
        task.localId?.toLowerCase().includes(query)
      );
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'device':
          return a.deviceName?.localeCompare(b.deviceName);
        case 'status':
          return a.status?.localeCompare(b.status);
        case 'address':
          return a.locationAddress?.localeCompare(b.locationAddress);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleBulkCreate = async () => {
    if (!bulkTasks.trim()) return;

    const lines = bulkTasks.split('\n').filter(line => line.trim());
    const tasksToCreate = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const deviceReg = parts[0];
        const address = parts[1];
        const actionType = parts[2] || 'DELIVERY';
        
        const device = devices.find(d => 
          d.registrationNumber === deviceReg || d.number === deviceReg
        );
        
        if (device) {
          tasksToCreate.push({
            deviceNumber: device.number,
            task: {
              localId: `BULK-${Date.now()}-${Math.random()}`,
              locationAddress: address,
              actionTagModel: { actionType }
            }
          });
        }
      }
    }

    if (tasksToCreate.length === 0) {
      toast.error('Не удалось распознать задачи. Проверьте формат.');
      return;
    }

    setLoading(true);
    let created = 0;
    
    for (const item of tasksToCreate) {
      try {
        await axios.post(`/api/device/${item.deviceNumber}/task`, item.task);
        created++;
      } catch (error) {
        console.error('Ошибка создания задачи:', error);
      }
    }

    toast.success(`Создано задач: ${created} из ${tasksToCreate.length}`);
    setBulkTasks('');
    setShowBulkTaskModal(false);
    loadAllTasks();
    setLoading(false);
  };

  const deleteSelectedTasks = async () => {
    if (selectedTasks.size === 0) {
      toast.error('Выберите задачи для удаления');
      return;
    }

    if (!confirm(`Удалить ${selectedTasks.size} задач(и)?`)) return;

    // Группируем задачи по устройствам
    const tasksByDevice = {};
    selectedTasks.forEach(taskId => {
      const task = allTasks.find(t => t.taskId === taskId);
      if (task && task.status === 'PENDING') {
        if (!tasksByDevice[task.deviceNumber]) {
          tasksByDevice[task.deviceNumber] = [];
        }
        tasksByDevice[task.deviceNumber].push(task);
      }
    });

    let deleted = 0;
    for (const deviceNumber in tasksByDevice) {
      try {
        await axios.delete(`/api/device/${deviceNumber}/tasks/pending`);
        deleted += tasksByDevice[deviceNumber].length;
      } catch (error) {
        console.error('Ошибка удаления задач:', error);
      }
    }

    toast.success(`Удалено задач: ${deleted}`);
    setSelectedTasks(new Set());
    loadAllTasks();
  };

  const exportTasks = () => {
    const csv = [
      ['Транспорт', 'Адрес', 'Тип', 'Статус', 'ID'].join(','),
      ...filteredTasks.map(task => [
        task.deviceName,
        task.locationAddress,
        task.actionTagModel?.actionType || '',
        task.status,
        task.localId || task.taskId
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS_NOW': return 'info';
      case 'PENDING': return 'warning';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Выполнено';
      case 'IN_PROGRESS_NOW': return 'Выполняется';
      case 'PENDING': return 'Ожидание';
      default: return status;
    }
  };

  return (
    <div className="p-4">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList size={24} />
            Управление задачами
          </h2>
          <p className="text-gray">
            Всего задач: {allTasks.length} | Показано: {filteredTasks.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => setShowBulkTaskModal(true)}
          >
            <Plus size={16} />
            Массовое создание
          </button>
          <button 
            className="btn btn-secondary"
            onClick={exportTasks}
            disabled={filteredTasks.length === 0}
          >
            <Download size={16} />
            Экспорт CSV
          </button>
          <button 
            className="btn btn-danger"
            onClick={deleteSelectedTasks}
            disabled={selectedTasks.size === 0}
          >
            <Trash2 size={16} />
            Удалить ({selectedTasks.size})
          </button>
          <button 
            className="btn btn-outline"
            onClick={loadAllTasks}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="card mb-4">
        <div className="grid grid-cols-4 gap-3" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          <div>
            <label className="text-sm text-gray mb-1 block">Транспорт</label>
            <select 
              className="input"
              value={selectedDevice}
              onChange={e => setSelectedDevice(e.target.value)}
            >
              <option value="all">Все транспортные средства</option>
              {devices.map(device => (
                <option key={device.number} value={device.number}>
                  {device.registrationNumber} - {device.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray mb-1 block">Статус</label>
            <select 
              className="input"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="PENDING">Ожидание</option>
              <option value="IN_PROGRESS_NOW">Выполняется</option>
              <option value="COMPLETED">Выполнено</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray mb-1 block">Сортировка</label>
            <select 
              className="input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="device">По транспорту</option>
              <option value="status">По статусу</option>
              <option value="address">По адресу</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray mb-1 block">Поиск</label>
            <div className="relative">
              <Search size={18} className="absolute" style={{
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray)'
              }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="Адрес или ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица задач */}
      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox"
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedTasks(new Set(filteredTasks.map(t => t.taskId)));
                        } else {
                          setSelectedTasks(new Set());
                        }
                      }}
                      checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                    />
                  </th>
                  <th>Транспорт</th>
                  <th>Адрес доставки</th>
                  <th>Тип действия</th>
                  <th>Статус</th>
                  <th>Расстояние</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => {
                  const device = devices.find(d => d.number === task.deviceNumber);
                  const position = positions.find(p => p.deviceNumber === task.deviceNumber);
                  
                  return (
                    <tr key={task.taskId}>
                      <td>
                        <input 
                          type="checkbox"
                          checked={selectedTasks.has(task.taskId)}
                          onChange={e => {
                            const newSelected = new Set(selectedTasks);
                            if (e.target.checked) {
                              newSelected.add(task.taskId);
                            } else {
                              newSelected.delete(task.taskId);
                            }
                            setSelectedTasks(newSelected);
                          }}
                        />
                      </td>
                      <td>
                        <div 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate(`/vehicle/${task.deviceNumber}`)}
                        >
                          <Truck size={16} />
                          <div>
                            <div className="font-medium">{task.deviceName}</div>
                            {position && (
                              <div className="text-xs text-gray">
                                {position.speed} км/ч
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray" />
                          <div>
                            <div>{task.locationAddress}</div>
                            {task.localId && (
                              <div className="text-xs text-gray">{task.localId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {task.actionTagModel && (
                          <span className="badge badge-info">
                            {task.actionTagModel.actionType}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td>
                        {task.plannedDist ? (
                          <span>{(task.plannedDist / 1000).toFixed(1)} км</span>
                        ) : (
                          <span className="text-gray">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/vehicle/${task.deviceNumber}`)}
                          >
                            <Edit2 size={14} />
                          </button>
                          {task.status === 'PENDING' && (
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={async () => {
                                if (confirm('Удалить задачу?')) {
                                  try {
                                    await axios.delete(`/api/device/${task.deviceNumber}/tasks/pending`);
                                    toast.success('Задача удалена');
                                    loadAllTasks();
                                  } catch (error) {
                                    toast.error('Ошибка удаления');
                                  }
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray">
            <Package size={48} className="mx-auto mb-3" style={{ opacity: 0.3 }} />
            <p>Нет задач для отображения</p>
            <p className="text-sm">Создайте новые задачи или измените фильтры</p>
          </div>
        )}
      </div>

      {/* Модальное окно массового создания */}
      {showBulkTaskModal && (
        <div className="modal-overlay" onClick={() => setShowBulkTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Массовое создание задач</h3>
              <button onClick={() => setShowBulkTaskModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray mb-3">
                Формат: [Номер транспорта], [Адрес], [Тип действия]<br />
                Пример: CT 0092Y, Берлин Hauptstraße 10, DELIVERY
              </p>
              <textarea
                className="input"
                rows="10"
                placeholder="CT 0092Y, Берлин Hauptstraße 10, DELIVERY&#10;HS-TS 172, Мюнхен Marienplatz 1, PARCEL_UNLOAD&#10;CT 379AT, Кёльн Dom 5, PICKUP"
                value={bulkTasks}
                onChange={e => setBulkTasks(e.target.value)}
              />
              <div className="mt-3 p-3 bg-light rounded">
                <p className="text-xs text-gray">
                  <strong>Доступные типы действий:</strong><br />
                  DELIVERY - Доставка<br />
                  PARCEL_LOAD - Погрузка<br />
                  PARCEL_UNLOAD - Разгрузка<br />
                  PICKUP - Забор груза<br />
                  BREAK - Перерыв<br />
                  FUEL - Заправка
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowBulkTaskModal(false)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={handleBulkCreate}>
                <Plus size={16} />
                Создать задачи
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManager;