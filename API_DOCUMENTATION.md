# Полное техническое описание REST API LocTracker Field Service (v1.0.34)

Этот документ представляет собой исчерпывающее руководство для разработчиков по интеграции с REST API LocTracker Field Service. Здесь подробно описаны все эндпоинты, структуры данных, методы аутентификации и коды ошибок.

## Часть 1: Общая информация

### 1.1. Назначение API

LocTracker Field Service REST API предназначен для интеграции сторонних систем с платформой LocTracker. Он позволяет автоматизировать управление транспортными задачами, отслеживать местоположение и состояние транспортных средств, обмениваться данными с водителями и получать подробные отчеты.

**Ключевые возможности:**
- Получение информации об устройствах (транспортных средствах)
- Отслеживание GPS-позиций и ленты активности в реальном времени
- Управление задачами: создание, обновление, получение и удаление
- Обмен файлами и сообщениями с водителями
- Формирование отчетов по пробегу, топливу и рабочему времени
- Получение данных с тахографов
- Управление "загрузками" (Loads) — сущностями, объединяющими несколько задач

### 1.2. Аутентификация и базовый URL

Доступ к API осуществляется по протоколу HTTPS. Аутентификация происходит путем передачи имени пользователя и пароля в параметрах каждого запроса.

**Шаблон базового URL:**
```
https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/{actionPath}?password={yourPassword}
```

**Компоненты URL:**
- `{userName}`: Ваше имя пользователя в системе LocTracker
- `{actionPath}`: Путь к конкретному методу API (например, devices или tasks/{deviceNumber}/trip)
- `{yourPassword}`: Ваш пароль в системе LocTracker

### 1.3. Формат данных и HTTP-методы

API полностью работает с форматом JSON.
- Все ответы от сервера приходят в формате JSON
- Тело запросов для методов POST и PUT должно быть в формате JSON
- При отправке данных методами POST и PUT необходимо указывать заголовок: `Content-Type: application/json; charset=UTF-8`

**Используемые HTTP-методы:**

| Метод  | Описание |
|--------|----------|
| GET    | Используется для получения ресурсов |
| POST   | Используется для создания/обновления ресурсов и выполнения действий |
| PUT    | Используется для создания ресурсов |
| DELETE | Используется для удаления ресурсов |

### 1.4. Структура ответов и коды состояний

Каждый ответ API имеет схожую JSON-структуру.

**Общая структура ответа:**
```json
{
  "user": "имя_пользователя",
  "status": 200,
  "errorCode": null,
  "errorDescription": null,
  "warnings": [],
  // ... другие поля, зависящие от запроса
}
```

**Основные HTTP-коды состояний:**

| Код | Описание |
|-----|----------|
| 200 | OK: Запрос выполнен успешно |
| 400 | Bad Request: Неверный запрос. Данные не могут быть обработаны. В ответе будет errorCode и errorDescription |
| 404 | Not Found: Запрошенный URL не найден |
| 500 | Internal Server Error: Внутренняя ошибка сервера. В ответе будет errorCode и errorDescription |

## Часть 2: Описание всех эндпоинтов (API Actions)

### 2.1. Версия сервиса

Позволяет запросить текущую версию API.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/version`

**Пример ответа:**
```json
{
  "version": "1.0.34",
  "status": 200
}
```

### 2.2. Устройства (Devices)

#### 2.2.1. Получение списка устройств

Получает список всех устройств (транспортных средств), связанных с пользователем.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/devices?password={password}`

**Параметры:**

| Параметр | Обязательность | Тип    | Описание |
|----------|----------------|--------|----------|
| userName | Да             | String | Имя пользователя LocTracker |
| password | Да             | String | Пароль LocTracker |

#### 2.2.2. Получение групп устройств

Получает список всех устройств, сгруппированных по группам LocTracker, а также информацию о менеджерах.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/devices/groups?password={password}`

#### 2.2.3. Получение текущих GPS-позиций

Получает текущее местоположение всех устройств пользователя.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/positions?password={password}`

### 2.3. Лента активности (Activity Stream)

Позволяет отслеживать активность устройств (прибытие на точку, начало разгрузки и т.д.) в режиме, близком к реальному времени.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/activities?password={password}&latestRecordId={id}&devices={dev1;dev2}&types={type1;type2}`

**Принцип работы:**
1. При первом запросе latestRecordId устанавливается в -1
2. Сервер возвращает новые события и новый latestRecordId
3. Для последующих запросов используется latestRecordId, полученный в предыдущем ответе

**Параметры:**

| Параметр       | Обязательность | Тип    | Описание |
|----------------|----------------|--------|----------|
| latestRecordId | Да             | Long   | ID последней полученной записи. Для первого запроса -1 |
| devices        | Нет            | String | Список номеров устройств через ; для фильтрации |
| types          | Нет            | String | Список типов активностей через ; для фильтрации |

### 2.4. Задачи (Device Tasks)

#### 2.4.1. Добавить задачу в конец маршрута

Добавляет новую задачу в конец текущего маршрута устройства.

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/{deviceNumber}/last`

#### 2.4.2. Добавить несколько задач в конец маршрута

Массовое добавление задач.

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/{deviceNumber}/last/bulk`

#### 2.4.3. Получить несколько задач по ID

Получает информацию о задачах по их taskId.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks?password={password}&taskIds={id1;id2}`

#### 2.4.4. Получить активный маршрут устройства

Возвращает список всех незавершенных задач для устройства.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/{deviceNumber}/trip?password={password}`

#### 2.4.5. Получить активную задачу устройства

Возвращает задачу, которая в данный момент находится в статусе IN_PROGRESS_NOW.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/{deviceNumber}/active?password={password}`

#### 2.4.6. Получить последнюю задачу устройства

Возвращает последнюю задачу в маршруте.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/{deviceNumber}/last?password={password}`

#### 2.4.7. Удалить ожидающие задачи

Удаляет все задачи со статусом PENDING.

- **HTTP Метод:** DELETE
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/{deviceNumber}/pending?password={password}`

#### 2.4.8. Прикрепить файл к задаче

Прикрепляет ранее загруженный файл к существующей задаче.

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/attach`
- **Тело запроса:** `{"password": "...", "taskId": 123, "attachmentId": "ID-файла-из-пула"}`

#### 2.4.9. Запросить повторную загрузку файлов водителем

Позволяет запросить у водителя повторную загрузку файла с определенным тегом для уже выполненной задачи.

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/driver-attachments-request`
- **Тело запроса:** `{"password": "...", "taskId": 123, "tag": "CMR", "commentToDriver": "Комментарий для водителя"}`

#### 2.4.10. Удалить запрос на повторную загрузку файлов

Удаляет ранее созданный запрос на повторную загрузку файла.

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/delete-driver-attachments-request`
- **Тело запроса:** `{"password": "...", "taskId": 123, "attachmentRequestId": "ID-запроса"}`

#### 2.4.11. Обновить данные задачи

Позволяет обновить атрибуты существующей задачи.

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tasks/update`

### 2.5. Файлы и вложения

#### 2.5.1. Загрузить файл в пул

Загружает файл в "пул вложений" для последующей отправки в чат или прикрепления к задаче.

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/attachments/upload`
- **Тип контента:** multipart/form-data

#### 2.5.2. Скачать файл

Скачивает файл по его ID.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/files/{fileId}?password={password}`

### 2.6. Сообщения в чате

#### 2.6.1. Отправить текстовое сообщение на планшет

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/messages/{deviceNumber}`

#### 2.6.2. Отправить сообщение с файлом

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/messages/{deviceNumber}/attach`
- **Тело запроса:** `{"password": "...", "attachmentId": "ID-файла-из-пула"}`

### 2.7. Маршруты (Paths)

#### 2.7.1. Получить координаты маршрутов по ключам

Получает закодированные полилинии маршрутов по их ключам (pathKey).

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/paths/resolveByKeys`
- **Тело запроса:** `{"password": "...", "keys": ["ключ1", "ключ2"]}`

### 2.8. Отчеты

#### 2.8.1. Сводный отчет за период

Получает сводную информацию (пробег, время, топливо) по устройству за указанный период.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/reports/period-summary/{deviceNumber}?password={password}&from={timestamp_ms}&to={timestamp_ms}`

#### 2.8.2. Рабочая таблица

Получает информацию о поездках, разделенную на дневное и ночное время.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/reports/work-table/{deviceNumber}?password={password}&from={timestamp_ms}&to={timestamp_ms}&nightTimeFrom=22:00&nightTimeTo=07:00`

### 2.9. Тахографы

#### 2.9.1. Текущее состояние тахографов

Получает данные о текущем состоянии тахографов.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tachographs/state?password={password}`

#### 2.9.2. Скачать DDD-файлы

Скачивает ZIP-архив с DDD-файлами за последний месяц.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/tachographs/files?password={password}&target={target}`
- **Параметр target:** VEHICLE или DRIVER

### 2.10. Загрузки (Loads)

"Загрузка" (Load) — это сущность, которая группирует несколько задач в один заказ.

#### 2.10.1. Создать загрузку

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/loads`

#### 2.10.2. Обновить загрузку

Обновляет существующую "загрузку" по ее loadId.

- **HTTP Метод:** PUT
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/loads/{loadId}`

#### 2.10.3. Отслеживание активностей по загрузкам

Активности, связанные с "загрузками" отслеживаются через общую Ленту активности (Activity Stream).

### 2.11. Состояние автопарка (Fleet State)

Получает полную сводную информацию о состоянии всего автопарка в одном запросе.

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/fleet/state?password={password}`

### 2.12. Напоминания (Reminders)

#### 2.12.1. Создать напоминание

- **HTTP Метод:** POST
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/reminders/{deviceNumber}`

#### 2.12.2. Удалить напоминание

- **HTTP Метод:** DELETE
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/reminders/{reminderId}?password={password}`

#### 2.12.3. Получить напоминания

- **HTTP Метод:** GET
- **URL:** `https://locator.lt/LoctrackerFieldService/REST/v1/{userName}/reminders/{deviceNumber}?password={password}`

## Часть 3: Основные типы данных

### device (Устройство)

| Поле | Тип | Описание |
|------|-----|----------|
| number | String | Уникальный номер устройства |
| registrationNumber | String | Регистрационный номер ТС |
| name | String | Имя/название ТС |
| withTablet | Boolean | true, если у ТС есть планшет |

### position (Позиция)

| Поле | Тип | Описание |
|------|-----|----------|
| deviceNumber | String | Номер устройства |
| time | Long | Unix timestamp (ms, UTC) времени фиксации |
| lat | Double | Широта |
| lng | Double | Долгота |
| speed | Integer | Скорость в км/ч |
| ignitionState | String | Состояние зажигания (ON, OFF) |

### task (Задача)

| Поле | Тип | Описание |
|------|-----|----------|
| taskId | Long | Уникальный ID задачи в системе LocTracker |
| localId | String | Ваш внутренний ID задачи |
| locationAddress | String | Адрес точки |
| status | String | Статус (COMPLETED, PENDING, IN_PROGRESS_NOW) |
| actionTagModel | Object | Объект с информацией о действии на точке |
| plannedDist | Integer | Запланированное расстояние до этой точки в метрах |
| pathKey | String | Ключ для получения координат запланированного маршрута |

### activity (Активность)

| Поле | Тип | Описание |
|------|-----|----------|
| id | Long | Уникальный ID активности |
| type | String | Тип события (TASK_VISIT, MESSAGE_NEW, TASK_CREATE и т.д.) |
| created | Long | Unix timestamp (ms, UTC) времени события |
| deviceNumber | String | Номер устройства, с которым связано событие |
| fileId | String | ID файла, если событие связано с файлом |
| linkedLoad | Object | Информация о связанной "загрузке" (Load) |

## Часть 4: Коды ошибок и предупреждений

### Коды ошибок (Error Codes)

| Код  | Описание |
|------|----------|
| 1001 | Ошибка аутентификации |
| 2000 | Превышен лимит запросов |
| 2001 | Тело запроса не является валидным JSON |
| 2004 | Устройство с указанным номером не найдено |
| 2010 | Задача с таким localId уже существует в маршруте |
| 2014 | Запрошенный ресурс не существует |

### Коды предупреждений (Warning Codes)

| Код  | Описание |
|------|----------|
| 3001 | Устройство с указанным номером не найдено |
| 3006 | Задача с указанным taskId не существует |
| 3009 | Запрошенный ресурс временно недоступен |
| 3012 | Ресурс уже существует (например, load с таким integrationId) |