#!/usr/bin/env python3
"""
Создание страницы и базы данных для диспетчера
"""

import os
from notion_client import Client
from dotenv import load_dotenv
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализация клиента
notion = Client(auth=os.getenv('NOTION_API_KEY'))

try:
    # Сначала создаем страницу в существующей базе данных
    # Используем ID базы данных Transtar Management System
    parent_database_id = "262c3f4a118b8042bdc5fd314602ebf7"
    
    # Создаем новую страницу
    new_page = notion.pages.create(
        parent={"database_id": parent_database_id},
        properties={
            "Fahrer": {
                "title": [
                    {
                        "text": {
                            "content": "🚚 LocTracker Dispatcher System"
                        }
                    }
                ]
            }
        },
        icon={
            "type": "emoji",
            "emoji": "🚦"
        }
    )
    
    page_id = new_page["id"]
    logger.info(f"✅ Страница создана: {page_id}")
    
    # Теперь создаем базу данных внутри этой страницы
    new_database = notion.databases.create(
        parent={"type": "page_id", "page_id": page_id},
        title=[
            {
                "type": "text",
                "text": {
                    "content": "🚚 LocTrackerDispo"
                }
            }
        ],
        properties={
            # Основное поле (Title)
            "🚛 Fahrzeug": {
                "title": {}
            },
            # Критические поля диспетчера
            "📍 Position": {"url": {}},
            "🏷️ LKW": {"rich_text": {}},
            "👤 Fahrer": {"rich_text": {}},
            "📞 Telefon": {"rich_text": {}},  # Упрощаем для телефона
            "💨 Speed": {"number": {"format": "number"}},
            "📍 Adresse": {"rich_text": {}},
            "🎯 Aufgabe": {"rich_text": {}},
            "➡️ Nächste": {"rich_text": {}},
            "📊 Status": {
                "select": {
                    "options": [
                        {"name": "PENDING", "color": "yellow"},
                        {"name": "IN_PROGRESS", "color": "blue"},
                        {"name": "COMPLETED", "color": "green"},
                        {"name": "DELAYED", "color": "orange"}
                    ]
                }
            },
            "📏 KM": {"number": {"format": "number"}},
            "⏱️ ETA": {"date": {}},
            "💬 Nachricht": {"rich_text": {}},
            "🔑 Motor": {"checkbox": {}},
            
            # Тахограф
            "⏱️ Fahrzeit": {"rich_text": {}},
            "⏸️ Pause in": {"rich_text": {}},
            "📅 Woche": {"rich_text": {}},
            "🎯 Aktivität": {
                "select": {
                    "options": [
                        {"name": "DRIVING", "color": "green"},
                        {"name": "WORK", "color": "blue"},
                        {"name": "REST", "color": "gray"},
                        {"name": "AVAILABLE", "color": "yellow"}
                    ]
                }
            },
            "🕐 Start": {"date": {}},
            "😴 Ruhezeit": {"date": {}},
            "⚠️ Verstöße": {"number": {"format": "number"}},
            
            # Координаты
            "📍 Lat": {"number": {"format": "number"}},
            "📍 Lng": {"number": {"format": "number"}},
            
            # Статус
            "⚠️ Warnung": {
                "select": {
                    "options": [
                        {"name": "🟢 OK", "color": "green"},
                        {"name": "🟡 WARNUNG", "color": "yellow"},
                        {"name": "🟠 PAUSE BALD", "color": "orange"},
                        {"name": "🔴 KRITISCH", "color": "red"},
                        {"name": "⏸️ PAUSIERT", "color": "gray"}
                    ]
                }
            },
            
            # Время обновления
            "🔄 Update": {"date": {}},
            
            # Дополнительные
            "⛽ Fuel": {"number": {"format": "percent"}},
            "🛣️ Tages KM": {"number": {"format": "number"}},
            "📊 Auslastung": {"number": {"format": "percent"}},
            "✅ Erledigt": {"number": {"format": "number"}},
            "🏢 Gruppe": {
                "select": {
                    "options": [
                        {"name": "Nahverkehr", "color": "blue"},
                        {"name": "Fernverkehr", "color": "green"},
                        {"name": "Express", "color": "red"}
                    ]
                }
            },
            
            # Задачи
            "📅 Plan": {"date": {}},
            "✅ Ist": {"date": {}},
            "⏰ Delay": {"number": {"format": "number"}},
            "👥 Kunde": {"rich_text": {}},
            "📋 Auftrag": {"rich_text": {}},
            "📦 Fracht": {"rich_text": {}},
            "⭐ Priorität": {
                "select": {
                    "options": [
                        {"name": "Hoch", "color": "red"},
                        {"name": "Mittel", "color": "yellow"},
                        {"name": "Niedrig", "color": "green"}
                    ]
                }
            },
            "📦 Paletten": {"number": {"format": "number"}},
            "⚖️ Gewicht": {"number": {"format": "number"}},
            "📝 Notizen": {"rich_text": {}},
            
            # Идентификаторы
            "📱 Device": {"rich_text": {}},
            "🆔 ID": {"number": {"format": "number"}}
        },
        icon={
            "type": "emoji",
            "emoji": "🚦"
        }
    )
    
    database_id = new_database["id"]
    logger.info(f"✅ База данных создана успешно!")
    logger.info(f"📋 Database ID: {database_id}")
    logger.info(f"🔗 URL: {new_database['url']}")
    
    # Сохраняем ID
    with open('dispatcher_database_id.txt', 'w') as f:
        f.write(f"Page ID: {page_id}\n")
        f.write(f"Database ID: {database_id}\n")
        f.write(f"URL: {new_database['url']}\n")
    
    print(f"\n✅ Успешно создано!")
    print(f"📄 Page ID: {page_id}")
    print(f"📊 Database ID: {database_id}")
    print(f"🔗 URL: {new_database['url']}")
    
except Exception as e:
    logger.error(f"❌ Ошибка: {e}")
    raise