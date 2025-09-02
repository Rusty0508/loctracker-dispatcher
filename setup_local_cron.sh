#!/bin/bash

# Скрипт настройки локального cron для автоматической синхронизации

echo "🔧 Настройка автоматического запуска каждые 5 минут..."

# Путь к проекту
PROJECT_PATH="/Users/rusty/loctracker-dispatcher"

# Создаем скрипт запуска
cat > "$PROJECT_PATH/run_sync.sh" << 'EOF'
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
EOF

# Делаем скрипт исполняемым
chmod +x "$PROJECT_PATH/run_sync.sh"

# Добавляем задачу в crontab
echo "📝 Добавление задачи в crontab..."

# Сохраняем текущий crontab
crontab -l > mycron 2>/dev/null || true

# Проверяем, не добавлена ли уже задача
if ! grep -q "run_sync.sh" mycron; then
    # Добавляем новую задачу - каждые 5 минут
    echo "*/5 * * * * $PROJECT_PATH/run_sync.sh" >> mycron
    
    # Устанавливаем новый crontab
    crontab mycron
    echo "✅ Задача добавлена в crontab!"
else
    echo "⚠️ Задача уже существует в crontab"
fi

# Удаляем временный файл
rm mycron

echo ""
echo "📊 Текущие задачи cron:"
crontab -l | grep loctracker || echo "Нет задач для loctracker"

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "🔍 Команды для управления:"
echo "  Просмотр логов:     tail -f $PROJECT_PATH/sync.log"
echo "  Остановить cron:    crontab -e (удалите строку с run_sync.sh)"
echo "  Проверить статус:   crontab -l"
echo "  Ручной запуск:      $PROJECT_PATH/run_sync.sh"
echo ""
echo "⏰ Синхронизация будет выполняться каждые 5 минут!"