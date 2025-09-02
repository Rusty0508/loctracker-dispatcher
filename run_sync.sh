#!/bin/bash

# Переход в директорию проекта
cd /Users/rusty/loctracker-dispatcher

# Загрузка переменных окружения
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate

# Установка зависимостей если нужно
pip install -q -r requirements.txt

# Запуск синхронизации
python sync_dispatcher_data.py >> sync.log 2>&1

# Деактивация виртуального окружения
deactivate
