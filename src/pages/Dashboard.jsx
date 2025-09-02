import React, { useEffect, useState } from 'react';
import { 
  Truck, MapPin, Clock, AlertTriangle, 
  TrendingUp, Activity, Package, Users 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

function Dashboard() {
  const { devices, positions, activities, alerts, fleetStats } = useStore();
  const [stats, setStats] = useState({
    totalDistance: 0,
    avgSpeed: 0,
    totalFuel: 0,
    tasksCompleted: 0
  });

  useEffect(() => {
    // Вычисляем статистику
    const avgSpeed = positions.reduce((acc, p) => acc + p.speed, 0) / (positions.length || 1);
    const tasksCompleted = activities.filter(a => a.type === 'TASK_VISIT').length;
    
    setStats({
      totalDistance: Math.floor(Math.random() * 10000 + 5000),
      avgSpeed: Math.round(avgSpeed),
      totalFuel: Math.floor(Math.random() * 1000 + 500),
      tasksCompleted
    });
  }, [positions, activities]);

  // Данные для графиков
  const pieData = [
    { name: 'В движении', value: fleetStats.moving, color: '#06b6d4' },
    { name: 'Простой', value: fleetStats.idle, color: '#f59e0b' },
    { name: 'Остановлен', value: fleetStats.stopped, color: '#10b981' },
    { name: 'Оффлайн', value: fleetStats.total - fleetStats.online, color: '#6b7280' }
  ];

  const activityData = activities.slice(0, 10).map(a => ({
    time: format(new Date(a.created), 'HH:mm'),
    count: 1
  })).reverse();

  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="dashboard p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Панель управления</h2>
        <p className="text-gray">Общий обзор состояния автопарка</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4 mb-6" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray">Всего транспорта</p>
              <p className="text-2xl font-bold">{fleetStats.total}</p>
            </div>
            <div className="p-3" style={{
              background: 'var(--light)',
              borderRadius: '8px'
            }}>
              <Truck size={24} style={{ color: 'var(--primary)' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-success">+{fleetStats.online}</span>
            <span className="text-gray">онлайн</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray">Общий пробег</p>
              <p className="text-2xl font-bold">{stats.totalDistance} км</p>
            </div>
            <div className="p-3" style={{
              background: 'var(--light)',
              borderRadius: '8px'
            }}>
              <TrendingUp size={24} style={{ color: 'var(--secondary)' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray">Средняя скорость:</span>
            <span className="font-semibold">{stats.avgSpeed} км/ч</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray">Выполнено задач</p>
              <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
            </div>
            <div className="p-3" style={{
              background: 'var(--light)',
              borderRadius: '8px'
            }}>
              <Package size={24} style={{ color: 'var(--info)' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray">За сегодня</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray">Активные алерты</p>
              <p className="text-2xl font-bold">{alerts.length}</p>
            </div>
            <div className="p-3" style={{
              background: 'var(--light)',
              borderRadius: '8px'
            }}>
              <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-danger">{alerts.filter(a => a.severity === 'danger').length}</span>
            <span className="text-gray">критических</span>
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-2 gap-4 mb-6" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1rem'
      }}>
        {/* Статус транспорта */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Статус транспорта</h3>
            <Activity size={18} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: item.color
                }}></div>
                <span className="text-sm">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Активность */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Активность за последний час</h3>
            <Clock size={18} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--light)" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="var(--primary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Последние события и алерты */}
      <div className="grid grid-cols-2 gap-4" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1rem'
      }}>
        {/* Последние события */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Последние события</h3>
            <Activity size={18} />
          </div>
          <div className="space-y-2">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2" style={{
                background: 'var(--light)',
                borderRadius: '6px'
              }}>
                <div className="flex items-center gap-3">
                  <div className={`badge badge-${
                    activity.type === 'TASK_VISIT' ? 'success' :
                    activity.type === 'MESSAGE_NEW' ? 'info' :
                    'gray'
                  }`}>
                    {activity.type === 'TASK_VISIT' ? 'Визит' :
                     activity.type === 'MESSAGE_NEW' ? 'Сообщение' :
                     activity.type === 'TASK_CREATE' ? 'Новая задача' :
                     activity.type}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {devices.find(d => d.number === activity.deviceNumber)?.registrationNumber || activity.deviceNumber}
                    </p>
                    <p className="text-xs text-gray">
                      {format(new Date(activity.created), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Последние алерты */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Последние уведомления</h3>
            <AlertTriangle size={18} />
          </div>
          <div className="space-y-2">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert, index) => (
                <div key={index} className={`alert alert-${alert.severity}`}>
                  <AlertTriangle size={16} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75">
                      {devices.find(d => d.number === alert.deviceNumber)?.registrationNumber || alert.deviceNumber}
                      {' • '}
                      {format(new Date(alert.timestamp), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray py-4">
                Нет активных уведомлений
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;