import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Truck, MapPin, Clock, Power } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

function Sidebar() {
  const navigate = useNavigate();
  const { 
    devices, 
    positions, 
    filters, 
    setFilter,
    getFilteredDevices 
  } = useStore();
  
  const filteredDevices = getFilteredDevices()(useStore.getState());

  const getDeviceStatus = (device) => {
    const position = positions.find(p => p.deviceNumber === device.number);
    if (!position) return { status: 'offline', label: 'Оффлайн', color: 'gray' };
    
    const isOnline = Date.now() - position.time < 300000; // 5 минут
    if (!isOnline) return { status: 'offline', label: 'Оффлайн', color: 'gray' };
    
    if (position.speed > 5) return { status: 'moving', label: 'В движении', color: 'info' };
    if (position.ignitionState === 'ON') return { status: 'idle', label: 'Простой', color: 'warning' };
    return { status: 'stopped', label: 'Остановлен', color: 'secondary' };
  };

  const getDeviceInfo = (device) => {
    const position = positions.find(p => p.deviceNumber === device.number);
    if (!position) return null;
    
    return {
      speed: position.speed,
      lastUpdate: position.time,
      ignition: position.ignitionState
    };
  };

  return (
    <aside className="sidebar">
      <div className="p-4">
        {/* Поиск и фильтры */}
        <div className="mb-4">
          <div className="relative mb-3">
            <Search size={18} className="absolute" style={{
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray)'
            }} />
            <input
              type="text"
              placeholder="Поиск транспорта..."
              className="input"
              style={{ paddingLeft: '40px' }}
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="all">Все статусы</option>
            <option value="online">Онлайн</option>
            <option value="moving">В движении</option>
            <option value="idle">Простой</option>
            <option value="stopped">Остановлен</option>
          </select>
        </div>

        {/* Список транспорта */}
        <div className="vehicle-list">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm text-gray">
              Найдено: {filteredDevices.length}
            </span>
            <button className="btn btn-sm btn-outline">
              <Filter size={14} />
              Фильтры
            </button>
          </div>

          <div className="space-y-2">
            {filteredDevices.map(device => {
              const status = getDeviceStatus(device);
              const info = getDeviceInfo(device);
              
              return (
                <div
                  key={device.number}
                  className="vehicle-card"
                  onClick={() => navigate(`/vehicle/${device.number}`)}
                  style={{
                    padding: '12px',
                    background: 'var(--white)',
                    border: '1px solid var(--light)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--light)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Truck size={16} />
                      <span className="font-semibold text-sm">
                        {device.registrationNumber}
                      </span>
                    </div>
                    <span className={`badge badge-${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray space-y-1">
                    {device.name && (
                      <div>{device.name}</div>
                    )}
                    
                    {info && (
                      <>
                        <div className="flex items-center gap-2">
                          <MapPin size={12} />
                          <span>Скорость: {info.speed} км/ч</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Power size={12} />
                          <span>Зажигание: {info.ignition === 'ON' ? 'Вкл' : 'Выкл'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={12} />
                          <span>
                            {formatDistanceToNow(new Date(info.lastUpdate), {
                              addSuffix: true,
                              locale: ru
                            })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;