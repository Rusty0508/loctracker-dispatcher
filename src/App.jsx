import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import VehicleDetails from './pages/VehicleDetails';
import TaskManager from './pages/TaskManager';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';

// Store
import { useStore } from './store/useStore';

const queryClient = new QueryClient();
const socket = io('http://localhost:3001');

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { 
    setDevices, 
    setPositions, 
    addActivity, 
    addAlert, 
    updateFleetStats 
  } = useStore();

  useEffect(() => {
    // Подключение к WebSocket
    socket.on('connect', () => {
      console.log('✅ Connected to dispatcher server');
    });

    // Получение начальных данных
    socket.on('initial:data', (data) => {
      setDevices(data.devices);
      setPositions(data.positions);
      data.activities.forEach(activity => addActivity(activity));
      data.alerts.forEach(alert => addAlert(alert));
    });

    // Обновления в реальном времени
    socket.on('devices:update', setDevices);
    socket.on('positions:update', setPositions);
    socket.on('activity:new', addActivity);
    socket.on('alert:new', addAlert);
    socket.on('fleet:stats', updateFleetStats);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <Header />
          <div className="flex" style={{ height: 'calc(100vh - 60px)' }}>
            {sidebarOpen && <Sidebar />}
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/vehicle/:deviceNumber" element={<VehicleDetails />} />
                <Route path="/tasks" element={<TaskManager />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/alerts" element={<Alerts />} />
              </Routes>
            </main>
          </div>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;