import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Truck, Map, ClipboardList, FileText, Bell, 
  Settings, User, Menu 
} from 'lucide-react';
import { useStore } from '../store/useStore';

function Header() {
  const location = useLocation();
  const { alerts, fleetStats } = useStore();
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const navItems = [
    { path: '/', label: 'Панель', icon: Menu },
    { path: '/map', label: 'Карта', icon: Map },
    { path: '/tasks', label: 'Задачи', icon: ClipboardList },
    { path: '/reports', label: 'Отчеты', icon: FileText },
    { path: '/alerts', label: 'Уведомления', icon: Bell, badge: unreadAlerts }
  ];

  return (
    <header className="header" style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--light)',
      height: '60px',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Truck size={24} className="text-primary" style={{ color: 'var(--primary)' }} />
          <h1 className="text-xl font-bold">LocTracker Dispatcher</h1>
        </div>
        
        <nav className="flex gap-2" style={{ marginLeft: '2rem' }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: location.pathname === item.path ? 'var(--primary)' : 'var(--gray)',
                background: location.pathname === item.path ? 'var(--light)' : 'transparent',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="badge badge-danger" style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  transform: 'translate(25%, -25%)',
                  minWidth: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  background: 'var(--danger)',
                  color: 'white',
                  fontSize: '10px'
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Статистика флота */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="status-dot status-online"></span>
            <span className="text-gray">Онлайн:</span>
            <span className="font-semibold">{fleetStats.online}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="status-dot status-moving"></span>
            <span className="text-gray">В движении:</span>
            <span className="font-semibold">{fleetStats.moving}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="status-dot status-idle"></span>
            <span className="text-gray">Простой:</span>
            <span className="font-semibold">{fleetStats.idle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-sm btn-outline">
            <Settings size={16} />
          </button>
          <button className="btn btn-sm btn-outline">
            <User size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;