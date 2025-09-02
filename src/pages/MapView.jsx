import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store/useStore';
import { Truck, MapPin, Navigation, Gauge } from 'lucide-react';

// Исправление иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Создаем кастомные иконки для транспорта
const createVehicleIcon = (status, heading = 0) => {
  const color = status === 'moving' ? '#06b6d4' : 
                status === 'idle' ? '#f59e0b' : 
                status === 'stopped' ? '#10b981' : '#6b7280';
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(${heading}deg);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style="transform: rotate(-${heading}deg);">
          <path d="M18 18.5a1.5 1.5 0 01-1.5-1.5v-12a1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5m-12 0A1.5 1.5 0 014.5 17V5A1.5 1.5 0 016 3.5 1.5 1.5 0 017.5 5v12A1.5 1.5 0 016 18.5m6 0a1.5 1.5 0 01-1.5-1.5v-12a1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5z"/>
        </svg>
      </div>
    `,
    className: 'vehicle-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
};

function MapView() {
  const { devices, positions, selectedDevice, selectDevice } = useStore();
  const mapRef = useRef(null);

  const getVehicleStatus = (position) => {
    if (!position) return 'offline';
    const isOnline = Date.now() - position.time < 300000;
    if (!isOnline) return 'offline';
    if (position.speed > 5) return 'moving';
    if (position.ignitionState === 'ON') return 'idle';
    return 'stopped';
  };

  useEffect(() => {
    // Центрируем карту на выбранном транспорте
    if (selectedDevice && mapRef.current) {
      const position = positions.find(p => p.deviceNumber === selectedDevice.number);
      if (position) {
        mapRef.current.setView([position.lat, position.lng], 15);
      }
    }
  }, [selectedDevice, positions]);

  // Фильтруем только транспорт с валидными координатами
  const vehiclesWithPositions = devices.map(device => {
    const position = positions.find(p => p.deviceNumber === device.number);
    if (!position || !position.lat || !position.lng) return null;
    return { ...device, position };
  }).filter(Boolean);

  return (
    <div className="map-view" style={{ height: '100%', position: 'relative' }}>
      <MapContainer
        ref={mapRef}
        center={[51.0826683, 6.1695933]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {vehiclesWithPositions.map(vehicle => {
          const status = getVehicleStatus(vehicle.position);
          const icon = createVehicleIcon(status);
          
          return (
            <Marker
              key={vehicle.number}
              position={[vehicle.position.lat, vehicle.position.lng]}
              icon={icon}
              eventHandlers={{
                click: () => selectDevice(vehicle)
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                    {vehicle.registrationNumber}
                  </h4>
                  {vehicle.name && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                      {vehicle.name}
                    </p>
                  )}
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Gauge size={14} />
                      <span>Скорость: {vehicle.position.speed} км/ч</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Navigation size={14} />
                      <span>Зажигание: {vehicle.position.ignitionState === 'ON' ? 'Вкл' : 'Выкл'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} />
                      <span>
                        {vehicle.position.lat.toFixed(6)}, {vehicle.position.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Панель статистики */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
          Транспорт на карте
        </h3>
        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#06b6d4'
            }}></div>
            <span>В движении: {vehiclesWithPositions.filter(v => v.position.speed > 5).length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#f59e0b'
            }}></div>
            <span>Простой: {vehiclesWithPositions.filter(v => v.position.speed <= 5 && v.position.ignitionState === 'ON').length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981'
            }}></div>
            <span>Остановлен: {vehiclesWithPositions.filter(v => v.position.ignitionState === 'OFF').length}</span>
          </div>
        </div>
      </div>

      {/* Легенда */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '11px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Обозначения:</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Truck size={12} />
            <span>Транспорт</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} />
            <span>Точка доставки</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;