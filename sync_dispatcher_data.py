#!/usr/bin/env python3
"""
Синхронизация данных LocTracker -> Notion Dispatcher Database
Заполняет все поля для диспетчера и тахографа
"""

import os
import json
import logging
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from notion_client import Client
import pytz
import time
import math

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ID созданной базы данных диспетчера (обновлено с новыми полями)
DISPATCHER_DATABASE_ID = "262c3f4a-118b-812c-a535-f0fd1ae50550"

class LocTrackerAPI:
    """Класс для работы с LocTracker API"""
    
    def __init__(self):
        self.username = os.getenv('VITE_LOCTRACKER_USERNAME', '37010032240')
        self.password = os.getenv('VITE_LOCTRACKER_PASSWORD', 'Frei-Disposition!?2025')
        self.base_url = os.getenv('VITE_LOCTRACKER_API_URL', 'https://locator.lt/LoctrackerFieldService/REST/v1')
        
        logger.info(f"Подключение к LocTracker API для пользователя: {self.username}")
        
    def get_devices(self) -> Optional[List[Dict]]:
        """Получить список всех устройств"""
        try:
            url = f"{self.base_url}/{self.username}/devices"
            params = {'password': self.password}
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            devices = data.get('devices', data) if isinstance(data, dict) else data
            logger.info(f"Получено {len(devices)} устройств")
            return devices
            
        except Exception as e:
            logger.error(f"Ошибка при получении устройств: {e}")
            return None
    
    def get_positions(self) -> Optional[List[Dict]]:
        """Получить текущие позиции всех устройств"""
        try:
            url = f"{self.base_url}/{self.username}/positions"
            params = {'password': self.password}
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            positions = data.get('positions', data) if isinstance(data, dict) else data
            logger.info(f"Получено {len(positions)} позиций")
            return positions
            
        except Exception as e:
            logger.error(f"Ошибка при получении позиций: {e}")
            return None
    
    def get_device_tasks(self, device_number: str) -> Optional[List[Dict]]:
        """Получить задачи для конкретного устройства"""
        try:
            url = f"{self.base_url}/{self.username}/tasks/{device_number}/trip"
            params = {'password': self.password}
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            tasks = data.get('tasks', data) if isinstance(data, dict) else data
            return tasks
            
        except Exception as e:
            logger.debug(f"Нет задач для устройства {device_number}: {e}")
            return None
    
    def get_active_task(self, device_number: str) -> Optional[Dict]:
        """Получить активную задачу устройства"""
        try:
            url = f"{self.base_url}/{self.username}/tasks/{device_number}/active"
            params = {'password': self.password}
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data.get('task', data) if isinstance(data, dict) else data
            
        except Exception as e:
            logger.debug(f"Нет активной задачи для {device_number}: {e}")
            return None
    
    def get_tachograph_state(self) -> Optional[List]:
        """Получить состояние тахографов для всех устройств"""
        try:
            url = f"{self.base_url}/{self.username}/tachographs/state"
            params = {'password': self.password}
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            # Правильный ключ - tachographsState, не tachographs
            return data.get('tachographsState', []) if isinstance(data, dict) else []
            
        except Exception as e:
            logger.debug(f"Нет данных тахографов: {e}")
            return None
    
    def get_fleet_state(self) -> Optional[Dict]:
        """Получить состояние всего автопарка"""
        try:
            url = f"{self.base_url}/{self.username}/fleet/state"
            params = {'password': self.password}
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.debug(f"Ошибка получения состояния автопарка: {e}")
            return None
    
    def get_device_report(self, device_number: str, date_from: str = None, date_to: str = None) -> Optional[Dict]:
        """Получить отчет по устройству за период"""
        try:
            # По умолчанию берем за последние 24 часа
            if not date_from:
                date_from = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            if not date_to:
                date_to = datetime.now().strftime('%Y-%m-%d')
            
            url = f"{self.base_url}/{self.username}/reports/vehicle"
            params = {
                'password': self.password,
                'deviceNumber': device_number,
                'dateFrom': date_from,
                'dateTo': date_to
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.debug(f"Нет отчета для устройства {device_number}: {e}")
            return None
    
    def get_activities(self, device_number: str) -> Optional[List[Dict]]:
        """Получить активности водителя"""
        try:
            url = f"{self.base_url}/{self.username}/activities/{device_number}"
            params = {'password': self.password}
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data.get('activities', data) if isinstance(data, dict) else data
            
        except Exception as e:
            logger.debug(f"Нет активностей для {device_number}: {e}")
            return None
    
    def get_fuel_data(self, device_number: str) -> Optional[Dict]:
        """Получить данные по топливу"""
        try:
            url = f"{self.base_url}/{self.username}/fuel/{device_number}"
            params = {'password': self.password}
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.debug(f"Нет данных по топливу для {device_number}: {e}")
            return None

class DispatcherNotionSync:
    """Класс для синхронизации данных с Notion"""
    
    def __init__(self):
        self.api_key = os.getenv('NOTION_API_KEY')
        if not self.api_key:
            raise ValueError("NOTION_API_KEY должен быть установлен")
            
        self.client = Client(auth=self.api_key)
        self.database_id = DISPATCHER_DATABASE_ID
        
        logger.info(f"Подключение к Notion Database: {self.database_id}")
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Рассчитать расстояние между двумя точками в км"""
        R = 6371  # Радиус Земли в км
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        distance = R * c * 1.15  # +15% для учета дорог
        return round(distance, 2)
    
    def _format_driving_time(self, seconds: int) -> str:
        """Форматировать время вождения в часы:минуты"""
        if seconds is None or seconds <= 0:
            return "0:00"
        hours = int(seconds / 3600)
        minutes = int((seconds % 3600) / 60)
        return f"{hours}:{minutes:02d}"
    
    def _calculate_status(self, data: Dict) -> str:
        """Рассчитать статус на основе данных"""
        # Проверяем время вождения
        daily_driving = data.get('dailyDrivingTimeLeft', 0)
        continuous_driving = data.get('continuousDrivingTimeLeft', 0)
        
        if daily_driving is not None and daily_driving > 0:
            remaining_hours = daily_driving / 3600
            if remaining_hours <= 0:
                return "⏸️ PAUSIERT"
            elif remaining_hours < 0.5:
                return "🔴 KRITISCH"
            elif remaining_hours < 0.75:
                return "🟠 PAUSE BALD"
            elif remaining_hours < 1:
                return "🟡 WARNUNG"
        
        if continuous_driving is not None and continuous_driving > 0:
            remaining_hours = continuous_driving / 3600
            if remaining_hours < 0.5:
                return "🔴 KRITISCH"
            elif remaining_hours < 0.75:
                return "🟠 PAUSE BALD"
        
        # Статус по скорости и зажиганию
        ignition = data.get('ignitionState', 'OFF')
        speed = data.get('speed', 0)
        
        if ignition == 'OFF':
            return "⏸️ PAUSIERT"
        elif speed > 5:
            return "🟢 OK"
        
        return "🟢 OK"
    
    def update_or_create_entry(self, data: Dict) -> bool:
        """Обновить или создать запись в базе данных диспетчера"""
        
        vehicle_name = data.get('registrationNumber', data.get('name', 'Unknown'))
        if not vehicle_name:
            logger.warning("Пропускаем запись без идентификации")
            return False
            
        try:
            # Проверяем существующую запись
            existing = self._find_entry(vehicle_name)
            
            properties = self._prepare_properties(data)
            
            if existing:
                # Обновляем существующую запись
                self.client.pages.update(
                    page_id=existing['id'],
                    properties=properties
                )
                logger.info(f"✅ Обновлена запись для {vehicle_name}")
            else:
                # Создаем новую запись
                self.client.pages.create(
                    parent={"database_id": self.database_id},
                    properties=properties
                )
                logger.info(f"➕ Создана новая запись для {vehicle_name}")
                
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при обновлении/создании записи для {vehicle_name}: {e}")
            return False
    
    def _find_entry(self, vehicle_name: str) -> Optional[Dict]:
        """Найти существующую запись по названию ТС"""
        try:
            response = self.client.databases.query(
                database_id=self.database_id,
                filter={
                    "property": "🚛 Fahrzeug",
                    "title": {
                        "contains": vehicle_name
                    }
                }
            )
            
            if response['results']:
                return response['results'][0]
            return None
            
        except Exception as e:
            logger.error(f"Ошибка при поиске записи: {e}")
            return None
    
    def _prepare_properties(self, data: Dict) -> Dict:
        """Подготовить свойства для Notion"""
        properties = {}
        
        # === ОСНОВНАЯ ИДЕНТИФИКАЦИЯ ===
        vehicle_name = data.get('registrationNumber', data.get('name', 'Unknown'))
        properties['🚛 Fahrzeug'] = {"title": [{"text": {"content": vehicle_name}}]}
        
        # === КРИТИЧЕСКИЕ ПОЛЯ ДИСПЕТЧЕРА ===
        
        # Позиция на карте
        if data.get('lat') and data.get('lng'):
            maps_link = f"https://maps.google.com/?q={data['lat']},{data['lng']}"
            properties['📍 Position'] = {"url": maps_link}
            properties['📍 Lat'] = {"number": float(data['lat'])}
            properties['📍 Lng'] = {"number": float(data['lng'])}
        
        # Регистрационный номер
        if data.get('registrationNumber'):
            properties['🏷️ LKW'] = {"rich_text": [{"text": {"content": str(data['registrationNumber'])}}]}
        
        # Имя водителя (из тахографа или задачи)
        driver_name = data.get('driverName', data.get('driver', ''))
        if driver_name:
            properties['👤 Fahrer'] = {"rich_text": [{"text": {"content": str(driver_name)}}]}
        
        # Телефон водителя
        if data.get('driverPhone'):
            properties['📞 Telefon'] = {"rich_text": [{"text": {"content": str(data['driverPhone'])}}]}
        
        # Скорость
        if data.get('speed') is not None:
            properties['💨 Speed'] = {"number": float(data['speed'])}
        
        # Текущий адрес
        if data.get('address'):
            properties['📍 Adresse'] = {"rich_text": [{"text": {"content": str(data['address'])}}]}
        
        # Текущая задача
        current_task = data.get('currentTaskAddress', '')
        if current_task:
            properties['🎯 Aufgabe'] = {"rich_text": [{"text": {"content": current_task}}]}
        else:
            properties['🎯 Aufgabe'] = {"rich_text": [{"text": {"content": "Keine Aufgabe"}}]}
        
        # Следующая задача (важно: если пусто - пишем "Keine Aufgabe")
        next_task = data.get('nextTaskAddress', '')
        if next_task:
            properties['➡️ Nächste'] = {"rich_text": [{"text": {"content": next_task}}]}
        else:
            properties['➡️ Nächste'] = {"rich_text": [{"text": {"content": "Keine Aufgabe"}}]}
        
        # Статус задачи
        task_status = data.get('taskStatus', 'PENDING')
        if task_status:
            properties['📊 Status'] = {"select": {"name": task_status}}
        
        # Расстояние до задачи
        if data.get('distanceToTask') is not None:
            properties['📏 KM'] = {"number": float(data['distanceToTask'])}
            
            # Рассчитываем ETA на основе расстояния и скорости
            speed = data.get('speed', 0)
            if speed > 10:  # Если едет
                eta_hours = data['distanceToTask'] / speed
                eta_time = datetime.now(pytz.UTC) + timedelta(hours=eta_hours)
                properties['⏱️ ETA'] = {"date": {"start": eta_time.isoformat()}}
            elif data.get('distanceToTask', 0) > 0:
                # Используем среднюю скорость 60 км/ч если стоит
                eta_hours = data['distanceToTask'] / 60
                eta_time = datetime.now(pytz.UTC) + timedelta(hours=eta_hours)
                properties['⏱️ ETA'] = {"date": {"start": eta_time.isoformat()}}
        
        # Последнее сообщение
        if data.get('lastMessage'):
            properties['💬 Nachricht'] = {"rich_text": [{"text": {"content": str(data['lastMessage'])}}]}
        
        # Статус двигателя
        if data.get('ignitionState'):
            properties['🔑 Motor'] = {"checkbox": data['ignitionState'] == 'ON'}
        
        # === ТАХОГРАФ ===
        
        # Время вождения
        if data.get('dailyDrivingTimeLeft') is not None:
            time_str = self._format_driving_time(data['dailyDrivingTimeLeft'])
            properties['⏱️ Fahrzeit'] = {"rich_text": [{"text": {"content": time_str}}]}
        
        # Время до паузы
        if data.get('continuousDrivingTimeLeft') is not None:
            time_str = self._format_driving_time(data['continuousDrivingTimeLeft'])
            properties['⏸️ Pause in'] = {"rich_text": [{"text": {"content": time_str}}]}
        
        # Недельное время
        if data.get('weeklyDrivingTimeLeft') is not None:
            time_str = self._format_driving_time(data['weeklyDrivingTimeLeft'])
            properties['📅 Woche'] = {"rich_text": [{"text": {"content": time_str}}]}
        
        # Текущая активность
        if data.get('currentActivity'):
            properties['🎯 Aktivität'] = {"select": {"name": data['currentActivity']}}
        
        # Начало работы
        if data.get('workDayStarted'):
            try:
                timestamp_ms = int(data['workDayStarted'])
                dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=pytz.UTC)
                properties['🕐 Start'] = {"date": {"start": dt.isoformat()}}
            except:
                pass
        
        # Следующий отдых
        if data.get('nextDayRest'):
            try:
                timestamp_ms = int(data['nextDayRest'])
                dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=pytz.UTC)
                properties['😴 Ruhezeit'] = {"date": {"start": dt.isoformat()}}
            except:
                pass
        
        # Нарушения
        violations = data.get('longerDrivingCount', 0) + data.get('shorterRestCount', 0)
        properties['⚠️ Verstöße'] = {"number": violations}
        
        # === СТАТУС ===
        status = self._calculate_status(data)
        properties['⚠️ Warnung'] = {"select": {"name": status}}
        
        # === ВРЕМЯ ОБНОВЛЕНИЯ ===
        current_time = datetime.now(pytz.UTC).isoformat()
        properties['🔄 Update'] = {"date": {"start": current_time}}
        
        # === ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ ===
        
        # Топливо в литрах (не в процентах!)
        if data.get('fuelLevel') is not None:
            # Предполагаем стандартный бак 400 литров для грузовика
            tank_capacity = data.get('fuelTankCapacity', 400)
            fuel_liters = (float(data['fuelLevel']) / 100) * tank_capacity
            properties['⛽ Fuel'] = {"number": fuel_liters}
        
        # Дневной пробег
        if data.get('dailyDistance') is not None:
            properties['🛣️ Tages KM'] = {"number": float(data['dailyDistance'])}
        
        # Выполненные задачи
        if data.get('completedTasks') is not None:
            properties['✅ Erledigt'] = {"number": int(data['completedTasks'])}
        else:
            # По умолчанию 0
            properties['✅ Erledigt'] = {"number": 0}
        
        # Загрузка (процент использования транспорта)
        if data.get('utilization') is not None:
            properties['📊 Auslastung'] = {"number": float(data['utilization']) / 100}
        else:
            # Рассчитываем на основе времени работы
            if data.get('workDayStarted'):
                work_start = int(data['workDayStarted']) / 1000
                now = time.time()
                work_hours = (now - work_start) / 3600
                if work_hours > 0:
                    # Предполагаем 8-часовой рабочий день
                    utilization = min(work_hours / 8, 1.0)
                    properties['📊 Auslastung'] = {"number": utilization}
        
        # Группа
        if data.get('groupName'):
            properties['🏢 Gruppe'] = {"select": {"name": data['groupName']}}
        else:
            # Определяем группу по типу задач или расстоянию
            if data.get('distanceToTask', 0) > 200:
                properties['🏢 Gruppe'] = {"select": {"name": "Fernverkehr"}}
            else:
                properties['🏢 Gruppe'] = {"select": {"name": "Nahverkehr"}}
        
        # === ЗАДАЧИ ===
        
        # Плановое прибытие
        if data.get('plannedArrival'):
            try:
                timestamp_ms = int(data['plannedArrival'])
                dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=pytz.UTC)
                properties['📅 Plan'] = {"date": {"start": dt.isoformat()}}
            except:
                pass
        
        # Фактическое прибытие
        if data.get('actualArrival'):
            try:
                timestamp_ms = int(data['actualArrival'])
                dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=pytz.UTC)
                properties['✅ Ist'] = {"date": {"start": dt.isoformat()}}
            except:
                pass
        
        # Опоздание (рассчитываем на основе планового и фактического времени)
        if data.get('delayMinutes') is not None:
            properties['⏰ Delay'] = {"number": int(data['delayMinutes'])}
        elif data.get('plannedArrival') and data.get('actualArrival'):
            # Рассчитываем опоздание в минутах
            planned = int(data['plannedArrival']) / 1000
            actual = int(data['actualArrival']) / 1000
            delay_seconds = actual - planned
            delay_minutes = int(delay_seconds / 60)
            if delay_minutes > 0:
                properties['⏰ Delay'] = {"number": delay_minutes}
        
        # Клиент
        if data.get('customerName'):
            properties['👥 Kunde'] = {"rich_text": [{"text": {"content": str(data['customerName'])}}]}
        
        # Номер заказа
        if data.get('orderNumber'):
            properties['📋 Auftrag'] = {"rich_text": [{"text": {"content": str(data['orderNumber'])}}]}
        
        # Описание груза
        if data.get('cargoDescription'):
            properties['📦 Fracht'] = {"rich_text": [{"text": {"content": str(data['cargoDescription'])}}]}
        
        # Приоритет
        if data.get('priority'):
            priority_map = {1: "Hoch", 2: "Mittel", 3: "Niedrig"}
            priority = priority_map.get(data['priority'], "Mittel")
            properties['⭐ Priorität'] = {"select": {"name": priority}}
        
        # Паллеты
        if data.get('palletCount') is not None:
            properties['📦 Paletten'] = {"number": int(data['palletCount'])}
        
        # Вес груза
        if data.get('cargoWeight') is not None:
            properties['⚖️ Gewicht'] = {"number": float(data['cargoWeight'])}
        
        # Примечания
        if data.get('notes'):
            properties['📝 Notizen'] = {"rich_text": [{"text": {"content": str(data['notes'])}}]}
        
        # === ИДЕНТИФИКАТОРЫ ===
        
        # Номер устройства
        if data.get('deviceNumber'):
            properties['📱 Device'] = {"rich_text": [{"text": {"content": str(data['deviceNumber'])}}]}
        
        # ID транспорта
        if data.get('vehicleId'):
            properties['🆔 ID'] = {"number": int(data['vehicleId'])}
        
        return properties

def sync_dispatcher_data():
    """Главная функция синхронизации"""
    logger.info("="*50)
    logger.info("🚀 Начало синхронизации данных диспетчера")
    
    # Инициализация API
    loctracker = LocTrackerAPI()
    notion = DispatcherNotionSync()
    
    # Получаем данные
    devices = loctracker.get_devices()
    if not devices:
        logger.error("Не удалось получить список устройств")
        return
    
    positions = loctracker.get_positions()
    if not positions:
        logger.error("Не удалось получить позиции")
        return
    
    # Получаем дополнительные данные
    tachographs = loctracker.get_tachograph_state()
    fleet_state = loctracker.get_fleet_state()
    
    # Создаем словарь задач из fleet state
    fleet_tasks_dict = {}
    if fleet_state and 'devices' in fleet_state:
        for fleet_device in fleet_state['devices']:
            if 'device' in fleet_device and 'tasks' in fleet_device:
                device_num = fleet_device['device'].get('number')
                if device_num:
                    fleet_tasks_dict[str(device_num)] = fleet_device['tasks']
    
    # Создаем словари для быстрого доступа
    positions_dict = {p['deviceNumber']: p for p in positions}
    tacho_dict = {}
    if tachographs:
        for tacho in tachographs:
            if 'deviceNumber' in tacho:
                tacho_dict[tacho['deviceNumber']] = tacho
    
    processed_count = 0
    error_count = 0
    
    # Обрабатываем каждое устройство
    for device in devices:
        device_number = device.get('number')
        registration = device.get('registrationNumber', '').strip()
        
        if not registration:
            continue
        
        logger.info(f"📦 Обработка {registration}...")
        
        # Объединяем все данные
        combined_data = {**device}
        combined_data['vehicleId'] = device.get('id')
        
        # Добавляем данные позиции
        if device_number in positions_dict:
            position = positions_dict[device_number]
            combined_data.update(position)
        
        # Добавляем данные тахографа (новая структура API)
        if device_number in tacho_dict:
            tacho = tacho_dict[device_number]
            
            # Время вождения из новой структуры
            if 'driveTimeCurrentDay' in tacho:
                combined_data['dailyDrivingTimeLeft'] = tacho['driveTimeCurrentDay'].get('durationRemaining', 0)
            
            if 'driveTimeSinceRest' in tacho:
                combined_data['continuousDrivingTimeLeft'] = tacho['driveTimeSinceRest'].get('durationRemaining', 0)
            
            if 'driveTimeCurrentWeek' in tacho:
                combined_data['weeklyDrivingTimeLeft'] = tacho['driveTimeCurrentWeek'].get('durationRemaining', 0)
            
            # Статус активности (преобразуем числовой статус)
            status = tacho.get('status', 0)
            status_map = {0: 'REST', 1: 'AVAILABLE', 2: 'WORK', 3: 'DRIVING'}
            combined_data['currentActivity'] = status_map.get(status, 'AVAILABLE')
            
            # Время начала работы
            combined_data['workDayStarted'] = tacho.get('workPeriodStart')
            combined_data['nextDayRest'] = tacho.get('workPeriodExpectedEnd')
            
            # Нарушения
            combined_data['longerDrivingCount'] = tacho.get('extendedDailyDrives', 0)
            combined_data['shorterRestCount'] = tacho.get('shortenedDailyRest', 0)
            
            # Имя водителя
            combined_data['driverName'] = tacho.get('driverNameFull', tacho.get('driverName', ''))
        
        # Получаем задачи (сначала пробуем из fleet state, потом из API)
        tasks = None
        
        # Сначала ищем в fleet state
        if device_number in fleet_tasks_dict:
            tasks = fleet_tasks_dict[device_number]
            logger.debug(f"Найдено {len(tasks)} задач в fleet state для {registration}")
        
        # Если нет в fleet state, пробуем API
        if not tasks:
            try:
                tasks = loctracker.get_device_tasks(device_number)
            except Exception as e:
                logger.debug(f"Не удалось получить задачи из API для {registration}: {e}")
        
        if tasks and len(tasks) > 0:
                # Текущая задача (ищем первую не завершенную или последнюю завершенную)
                current_task = None
                for task in tasks:
                    if task.get('status') != 'COMPLETED':
                        current_task = task
                        break
                
                # Если все завершены, берем последнюю
                if not current_task and len(tasks) > 0:
                    current_task = tasks[0]
                
                if current_task:
                    combined_data['currentTaskAddress'] = current_task.get('locationAddress', '')
                    combined_data['taskStatus'] = current_task.get('status', '')
                    combined_data['plannedArrival'] = current_task.get('plannedArrival', current_task.get('date'))
                    combined_data['actualArrival'] = current_task.get('actualArrival', current_task.get('timeCompleted'))
                    combined_data['customerName'] = current_task.get('customerName', current_task.get('locationName', ''))
                    combined_data['orderNumber'] = current_task.get('orderNumber', str(current_task.get('taskId', '')))
                    combined_data['cargoDescription'] = current_task.get('cargoDescription', current_task.get('logistComment', ''))
                    combined_data['palletCount'] = current_task.get('palletCount', current_task.get('parcelWeight'))
                    combined_data['cargoWeight'] = current_task.get('cargoWeight', current_task.get('totalParcelWeight'))
                    combined_data['priority'] = current_task.get('priority', 2)
                    combined_data['notes'] = current_task.get('notes', current_task.get('driverNotes', ''))
                    
                    # Вычисляем расстояние до текущей задачи
                    task_lat = current_task.get('latitude', current_task.get('lat'))
                    task_lng = current_task.get('longitude', current_task.get('lng'))
                    if combined_data.get('lat') and combined_data.get('lng') and task_lat and task_lng:
                        distance = notion._calculate_distance(
                            combined_data['lat'], combined_data['lng'],
                            task_lat, task_lng
                        )
                        combined_data['distanceToTask'] = distance
                
                # Следующая задача
                next_task = tasks[1] if len(tasks) > 1 else None
                if next_task:
                    combined_data['nextTaskAddress'] = next_task.get('locationAddress', '')
                
                # Считаем выполненные задачи
                completed = [t for t in tasks if t.get('status') == 'COMPLETED']
                combined_data['completedTasks'] = len(completed)
        
        # Получаем отчет по устройству для дневного пробега
        try:
            report = loctracker.get_device_report(device_number)
            if report:
                combined_data['dailyDistance'] = report.get('totalDistance', 0)
                combined_data['fuelTankCapacity'] = report.get('fuelTankCapacity', 400)
                
                # Если есть данные о заправках
                if 'fuelData' in report:
                    combined_data['fuelLevel'] = report['fuelData'].get('currentLevel')
        except Exception as e:
            logger.debug(f"Не удалось получить отчет для {registration}: {e}")
        
        # Получаем данные по топливу
        try:
            fuel_data = loctracker.get_fuel_data(device_number)
            if fuel_data:
                combined_data['fuelLevel'] = fuel_data.get('currentLevel')
                combined_data['fuelTankCapacity'] = fuel_data.get('tankCapacity', 400)
        except Exception as e:
            logger.debug(f"Не удалось получить данные топлива для {registration}: {e}")
        
        # Обновляем или создаем запись в Notion
        if notion.update_or_create_entry(combined_data):
            processed_count += 1
            logger.info(f"✅ Обработано: {registration}")
        else:
            error_count += 1
            logger.error(f"❌ Ошибка обработки: {registration}")
        
        # Небольшая задержка для API
        time.sleep(0.5)
    
    logger.info("="*50)
    logger.info(f"✅ Синхронизация завершена!")
    logger.info(f"📊 Обработано: {processed_count}")
    logger.info(f"❌ Ошибок: {error_count}")
    logger.info(f"🔗 База данных: https://www.notion.so/{DISPATCHER_DATABASE_ID.replace('-', '')}")
    logger.info("="*50)

def main():
    """Главная функция"""
    try:
        sync_dispatcher_data()
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}")
        raise

if __name__ == "__main__":
    main()