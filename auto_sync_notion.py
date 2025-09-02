#!/usr/bin/env python3
"""
Автоматическая синхронизация LocTracker -> Notion
Обновляет данные каждую минуту
"""

import time
import logging
from loctracker_to_notion import LocTrackerNotionSync

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler('auto_sync.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Главная функция автоматической синхронизации"""
    sync = LocTrackerNotionSync()
    
    logger.info("🚀 Запуск автоматической синхронизации LocTracker -> Notion")
    logger.info("📊 Данные будут обновляться каждую минуту")
    logger.info("⏹️  Для остановки нажмите Ctrl+C")
    
    while True:
        try:
            # Выполняем синхронизацию
            sync.sync_data()
            
            # Ждем минуту перед следующим обновлением
            logger.info("⏰ Следующее обновление через 60 секунд...")
            time.sleep(60)
            
        except KeyboardInterrupt:
            logger.info("\n⏹️  Синхронизация остановлена пользователем")
            break
        except Exception as e:
            logger.error(f"❌ Ошибка синхронизации: {e}")
            logger.info("🔄 Повторная попытка через 60 секунд...")
            time.sleep(60)

if __name__ == "__main__":
    main()