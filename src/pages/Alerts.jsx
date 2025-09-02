import React from 'react';
import { Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

function Alerts() {
  const { alerts, dismissAlert } = useStore();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Bell size={24} />
        Уведомления
      </h2>
      <div className="card">
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert alert-${alert.severity}`}>
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-xs opacity-75">
                    {format(new Date(alert.timestamp), 'dd.MM.yyyy HH:mm:ss')}
                  </p>
                </div>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => dismissAlert(alert.id)}
                >
                  Закрыть
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray py-4">Нет активных уведомлений</p>
        )}
      </div>
    </div>
  );
}

export default Alerts;