import { create } from 'zustand';

export const useStore = create((set) => ({
  // Данные
  devices: [],
  positions: [],
  activities: [],
  alerts: [],
  tasks: new Map(),
  fleetStats: {
    total: 0,
    online: 0,
    moving: 0,
    idle: 0,
    stopped: 0
  },
  
  // Выбранные элементы
  selectedDevice: null,
  selectedAlert: null,
  
  // Фильтры
  filters: {
    search: '',
    status: 'all',
    group: 'all'
  },
  
  // Actions для устройств
  setDevices: (devices) => set({ devices }),
  setPositions: (positions) => set({ positions }),
  
  // Actions для активностей
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities].slice(0, 100)
  })),
  
  // Actions для алертов
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 50)
  })),
  
  clearAlerts: () => set({ alerts: [] }),
  
  dismissAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== alertId)
  })),
  
  // Actions для задач
  setDeviceTasks: (deviceNumber, tasks) => set((state) => {
    const newTasks = new Map(state.tasks);
    newTasks.set(deviceNumber, tasks);
    return { tasks: newTasks };
  }),
  
  // Actions для статистики
  updateFleetStats: (stats) => set({ fleetStats: stats }),
  
  // Actions для выбора
  selectDevice: (device) => set({ selectedDevice: device }),
  selectAlert: (alert) => set({ selectedAlert: alert }),
  
  // Actions для фильтров
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  // Вычисляемые значения
  getDeviceById: (deviceNumber) => {
    return (state) => state.devices.find(d => d.number === deviceNumber);
  },
  
  getPositionById: (deviceNumber) => {
    return (state) => state.positions.find(p => p.deviceNumber === deviceNumber);
  },
  
  getDeviceWithPosition: (deviceNumber) => {
    return (state) => {
      const device = state.devices.find(d => d.number === deviceNumber);
      const position = state.positions.find(p => p.deviceNumber === deviceNumber);
      return { ...device, position };
    };
  },
  
  getFilteredDevices: () => {
    return (state) => {
      let filtered = state.devices;
      
      // Поиск
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        filtered = filtered.filter(d => 
          d.name?.toLowerCase().includes(search) ||
          d.registrationNumber?.toLowerCase().includes(search) ||
          d.number.includes(search)
        );
      }
      
      // Статус
      if (state.filters.status !== 'all') {
        const positions = state.positions;
        filtered = filtered.filter(device => {
          const position = positions.find(p => p.deviceNumber === device.number);
          if (!position) return false;
          
          switch (state.filters.status) {
            case 'online':
              return Date.now() - position.time < 300000;
            case 'moving':
              return position.speed > 5;
            case 'idle':
              return position.speed <= 5 && position.ignitionState === 'ON';
            case 'stopped':
              return position.ignitionState === 'OFF';
            default:
              return true;
          }
        });
      }
      
      return filtered;
    };
  }
}));