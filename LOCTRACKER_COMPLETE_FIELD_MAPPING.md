# Полный маппинг полей LocTracker API -> Notion Database

## Документ содержит ВСЕ возможные поля данных из LocTracker API

Этот файл представляет исчерпывающий список всех полей, которые можно получить из различных эндпоинтов LocTracker API и синхронизировать с базой данных Notion.

---

## 📋 ОСНОВНАЯ ИНФОРМАЦИЯ О ТРАНСПОРТЕ

### Из эндпоинта `/devices`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `number` | String | Уникальный номер устройства | Gerätenummer | Rich Text |
| `registrationNumber` | String | Регистрационный номер ТС | LKW, Fahrer (title) | Rich Text, Title |
| `name` | String | Название/имя транспортного средства | Fahrername | Rich Text |
| `withTablet` | Boolean | Наличие планшета в ТС | Hat Tablet | Checkbox |
| `id` | Integer | ID транспортного средства в системе | Fahrzeug ID | Number |
| `vin` | String | VIN код транспортного средства | VIN Code | Rich Text |
| `brand` | String | Марка транспортного средства | Marke | Select |
| `model` | String | Модель транспортного средства | Modell | Rich Text |
| `year` | Integer | Год выпуска | Baujahr | Number |
| `color` | String | Цвет транспортного средства | Farbe | Select |
| `fuelType` | String | Тип топлива (DIESEL, PETROL, ELECTRIC, HYBRID) | Kraftstoffart | Select |
| `engineVolume` | Float | Объем двигателя в литрах | Hubraum (L) | Number |
| `maxWeight` | Float | Максимальная масса в тоннах | Max. Gewicht (t) | Number |
| `emptyWeight` | Float | Масса без груза в тоннах | Leergewicht (t) | Number |
| `licensePlateCountry` | String | Страна регистрации | Registrierungsland | Select |
| `description` | String | Описание/примечания | Beschreibung | Rich Text |

### Из эндпоинта `/devices/groups`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `groupName` | String | Название группы ТС | Gruppe | Select |
| `groupId` | Integer | ID группы | Gruppen ID | Number |
| `managerName` | String | Имя менеджера группы | Manager | Rich Text |
| `managerPhone` | String | Телефон менеджера | Manager Telefon | Phone |
| `managerEmail` | String | Email менеджера | Manager Email | Email |

---

## 🗺️ GPS ПОЗИЦИОНИРОВАНИЕ И ДВИЖЕНИЕ

### Из эндпоинта `/positions`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `lat` | Double | Широта | Breitengrad | Number |
| `lng` | Double | Долгота | Längengrad | Number |
| `altitude` | Integer | Высота над уровнем моря (м) | Höhe (m) | Number |
| `speed` | Integer | Скорость (км/ч) | Geschwindigkeit | Number |
| `heading` | Integer | Направление движения (0-360°) | Richtung | Number |
| `accuracy` | Integer | Точность GPS (м) | GPS Genauigkeit (m) | Number |
| `satellites` | Integer | Количество спутников | Satelliten | Number |
| `hdop` | Float | Горизонтальная точность | HDOP | Number |
| `time` | Long | Время фиксации позиции (Unix ms) | Positionszeit | Date |
| `fixTime` | Long | Время получения GPS фикса | GPS Fix Zeit | Date |
| `serverTime` | Long | Время получения сервером | Server Zeit | Date |
| `gsmSignal` | Integer | Уровень GSM сигнала (0-100) | GSM Signal | Select |
| `gsmOperator` | String | Оператор связи | GSM Operator | Select |
| `roaming` | Boolean | Роуминг активен | Roaming | Checkbox |
| `dataTransfer` | Boolean | Передача данных активна | Datenübertragung | Checkbox |
| `address` | String | Адрес текущей позиции | Aktuelle Adresse | Rich Text |
| `country` | String | Страна | Land | Select |
| `city` | String | Город | Stadt | Rich Text |
| `street` | String | Улица | Straße | Rich Text |
| `postalCode` | String | Почтовый индекс | PLZ | Rich Text |

---

## ⚙️ ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ И СОСТОЯНИЕ

### Из эндпоинта `/positions` (CAN данные)
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `ignitionState` | String | Состояние зажигания (ON/OFF) | Motor läuft | Checkbox |
| `engineRPM` | Integer | Обороты двигателя | Motordrehzahl | Number |
| `engineHours` | Float | Моточасы | Betriebsstunden | Number |
| `odometerValue` | Float | Показания одометра (км) | Kilometerstand | Number |
| `fuelLevel` | Float | Уровень топлива (%) | Kraftstoffstand | Number |
| `fuelUsed` | Float | Использовано топлива (л) | Verbrauchter Kraftstoff (L) | Number |
| `fuelRate` | Float | Мгновенный расход (л/ч) | Momentanverbrauch (L/h) | Number |
| `averageFuelConsumption` | Float | Средний расход (л/100км) | Durchschnittsverbrauch | Number |
| `coolantTemp` | Integer | Температура охлаждающей жидкости (°C) | Kühlmitteltemperatur | Number |
| `oilTemp` | Integer | Температура масла (°C) | Öltemperatur | Number |
| `oilPressure` | Float | Давление масла (бар) | Öldruck (bar) | Number |
| `engineLoad` | Integer | Нагрузка на двигатель (%) | Motorlast (%) | Number |
| `throttlePosition` | Integer | Положение дроссельной заслонки (%) | Drosselklappe (%) | Number |
| `brakePressed` | Boolean | Педаль тормоза нажата | Bremse gedrückt | Checkbox |
| `clutchPressed` | Boolean | Педаль сцепления нажата | Kupplung gedrückt | Checkbox |
| `cruiseControlActive` | Boolean | Круиз-контроль активен | Tempomat aktiv | Checkbox |
| `ptoActive` | Boolean | Коробка отбора мощности активна | PTO aktiv | Checkbox |
| `adBlueLevel` | Float | Уровень AdBlue (%) | AdBlue Stand (%) | Number |
| `batteryVoltage` | Float | Напряжение батареи (В) | Batteriespannung (V) | Number |
| `alternatorVoltage` | Float | Напряжение генератора (В) | Generatorspannung (V) | Number |
| `ambientTemp` | Integer | Температура окружающей среды (°C) | Außentemperatur | Number |
| `cabinTemp` | Integer | Температура в кабине (°C) | Kabinentemperatur | Number |

### Из эндпоинта `/positions` (Дополнительные датчики)
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `externalVoltage` | Integer | Внешнее напряжение (мВ) | Externe Spannung (V) | Number |
| `internalBatteryVoltage` | Integer | Напряжение внутренней батареи (мВ) | Interne Batterie (V) | Number |
| `analogInput1` | Float | Аналоговый вход 1 | Analog Eingang 1 | Number |
| `analogInput2` | Float | Аналоговый вход 2 | Analog Eingang 2 | Number |
| `digitalInput1` | Boolean | Цифровой вход 1 | Digital Eingang 1 | Checkbox |
| `digitalInput2` | Boolean | Цифровой вход 2 | Digital Eingang 2 | Checkbox |
| `digitalInput3` | Boolean | Цифровой вход 3 | Digital Eingang 3 | Checkbox |
| `digitalInput4` | Boolean | Цифровой вход 4 | Digital Eingang 4 | Checkbox |
| `digitalOutput1` | Boolean | Цифровой выход 1 | Digital Ausgang 1 | Checkbox |
| `digitalOutput2` | Boolean | Цифровой выход 2 | Digital Ausgang 2 | Checkbox |
| `temperature1` | Float | Температурный датчик 1 (°C) | Temperatursensor 1 | Number |
| `temperature2` | Float | Температурный датчик 2 (°C) | Temperatursensor 2 | Number |
| `temperature3` | Float | Температурный датчик 3 (°C) | Temperatursensor 3 | Number |
| `temperature4` | Float | Температурный датчик 4 (°C) | Temperatursensor 4 | Number |
| `humidity` | Integer | Влажность (%) | Feuchtigkeit (%) | Number |
| `weight` | Float | Вес груза (кг) | Gewicht (kg) | Number |
| `axleWeight1` | Float | Нагрузка на ось 1 (кг) | Achslast 1 (kg) | Number |
| `axleWeight2` | Float | Нагрузка на ось 2 (кг) | Achslast 2 (kg) | Number |
| `axleWeight3` | Float | Нагрузка на ось 3 (кг) | Achslast 3 (kg) | Number |

---

## 🚛 ДАННЫЕ ТАХОГРАФА

### Из эндпоинта `/tachographs/state`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `driverCardNumber` | String | Номер карты водителя | Fahrerkarten Nr. | Rich Text |
| `driverName` | String | Имя водителя | Fahrername (Tacho) | Rich Text |
| `coDriverCardNumber` | String | Номер карты второго водителя | Co-Fahrer Karte | Rich Text |
| `coDriverName` | String | Имя второго водителя | Co-Fahrer Name | Rich Text |
| `currentActivity` | String | Текущая активность (DRIVING/REST/WORK/AVAILABLE) | Aktuelle Aktivität | Select |
| `activityStartTime` | Long | Время начала активности | Aktivität Start | Date |
| `dailyDrivingTimeLeft` | Integer | Оставшееся время вождения за день (сек) | Fahrzeit übrig | Rich Text |
| `continuousDrivingTimeLeft` | Integer | Время до обязательного перерыва (сек) | Fahrzeit bis Pause | Rich Text |
| `weeklyDrivingTimeLeft` | Integer | Оставшееся время вождения за неделю (сек) | Diese Woche Fahrzeit übrig | Rich Text |
| `twoWeeksDrivingTimeLeft` | Integer | Оставшееся время за 2 недели (сек) | Zwei Wochen Fahrzeit übrig | Rich Text |
| `dailyRestTimeLeft` | Integer | Оставшееся время отдыха (сек) | Tägliche Ruhezeit übrig | Rich Text |
| `weeklyRestTimeLeft` | Integer | Оставшееся время отдыха за неделю (сек) | Wöchentliche Ruhezeit übrig | Rich Text |
| `nextDayRest` | Long | Время следующего обязательного отдыха | Nächste Tagesruhezeit | Date |
| `nextWeekRest` | Long | Время следующего недельного отдыха | Nächste Wochenruhezeit | Date |
| `workDayStarted` | Long | Время начала рабочего дня | Start | Date |
| `longerDrivingCount` | Integer | Количество превышений времени вождения | Längere Fahrten | Number |
| `shorterRestCount` | Integer | Количество сокращенных отдыхов | Kürzere Ruhezeiten | Number |
| `missingRestCount` | Integer | Количество пропущенных отдыхов | Fehlende Ruhezeiten | Number |
| `cardExpiryDate` | Long | Дата истечения карты водителя | Kartenablauf | Date |
| `lastCardDownload` | Long | Последняя загрузка данных с карты | Letzter Kartendownload | Date |
| `lastVehicleDownload` | Long | Последняя загрузка данных с ТС | Letzter Fahrzeugdownload | Date |
| `infringements` | Array | Список нарушений | Verstöße | Rich Text |
| `currentSpeed` | Integer | Текущая скорость из тахографа | Tacho Geschwindigkeit | Number |
| `totalDistance` | Float | Общий пробег из тахографа | Tacho Kilometer | Number |

---

## 📋 ЗАДАЧИ И МАРШРУТЫ

### Из эндпоинта `/tasks/{deviceNumber}/trip`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `taskId` | Long | ID задачи в системе | Aufgaben ID | Number |
| `localId` | String | Внешний ID задачи | Externe Aufgaben ID | Rich Text |
| `locationAddress` | String | Адрес точки назначения | Aktuelle Aufgabe | Rich Text |
| `locationName` | String | Название точки | Aufgabenort | Rich Text |
| `latitude` | Double | Широта точки задачи | Aufgabe Breite | Number |
| `longitude` | Double | Долгота точки задачи | Aufgabe Länge | Number |
| `status` | String | Статус (PENDING/IN_PROGRESS_NOW/COMPLETED/CANCELLED) | Aufgabenstatus | Select |
| `actionType` | String | Тип действия (LOADING/UNLOADING/DELIVERY/PICKUP) | Aufgabentyp | Select |
| `plannedArrival` | Long | Планируемое время прибытия | Geplante Ankunft | Date |
| `actualArrival` | Long | Фактическое время прибытия | Tatsächliche Ankunft | Date |
| `plannedDeparture` | Long | Планируемое время отъезда | Geplante Abfahrt | Date |
| `actualDeparture` | Long | Фактическое время отъезда | Tatsächliche Abfahrt | Date |
| `plannedDist` | Integer | Запланированное расстояние (м) | Geplante Entfernung (km) | Number |
| `actualDist` | Integer | Фактическое расстояние (м) | Tatsächliche Entfernung (km) | Number |
| `pathKey` | String | Ключ маршрута | Routenschlüssel | Rich Text |
| `customerName` | String | Имя клиента | Kunde | Rich Text |
| `customerPhone` | String | Телефон клиента | Kundentelefon | Phone |
| `customerEmail` | String | Email клиента | Kunden-Email | Email |
| `orderNumber` | String | Номер заказа | Auftragsnummer | Rich Text |
| `cargoDescription` | String | Описание груза | Frachtbeschreibung | Rich Text |
| `cargoWeight` | Float | Вес груза (кг) | Frachtgewicht (kg) | Number |
| `cargoVolume` | Float | Объем груза (м³) | Frachtvolumen (m³) | Number |
| `palletCount` | Integer | Количество паллет | Palettenanzahl | Number |
| `priority` | Integer | Приоритет (1-10) | Priorität | Number |
| `notes` | String | Примечания к задаче | Aufgabennotizen | Rich Text |
| `completedBy` | String | Кем выполнено | Erledigt von | Rich Text |
| `signature` | String | ID файла подписи | Unterschrift ID | Rich Text |
| `photos` | Array | ID фотографий | Fotos IDs | Rich Text |
| `documents` | Array | ID документов | Dokumente IDs | Rich Text |

### Из эндпоинта `/tasks/{deviceNumber}/active`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `timeSpentOnTask` | Integer | Время на выполнение (сек) | Zeit für Aufgabe (Min) | Number |
| `waitingTime` | Integer | Время ожидания (сек) | Wartezeit (Min) | Number |
| `serviceTime` | Integer | Время обслуживания (сек) | Servicezeit (Min) | Number |
| `delayMinutes` | Integer | Опоздание (мин) | Verspätung (Min) | Number |
| `earlyMinutes` | Integer | Опережение графика (мин) | Zu früh (Min) | Number |

---

## 📊 ОТЧЕТЫ И СТАТИСТИКА

### Из эндпоинта `/reports/period-summary/{deviceNumber}`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `totalDistance` | Float | Общий пробег за период (км) | Tageskilometer | Number |
| `totalFuel` | Float | Общий расход топлива (л) | Tageskraftstoff (L) | Number |
| `averageSpeed` | Float | Средняя скорость (км/ч) | Durchschnittsgeschwindigkeit | Number |
| `maxSpeed` | Float | Максимальная скорость (км/ч) | Höchstgeschwindigkeit | Number |
| `drivingTime` | Integer | Время в движении (сек) | Fahrzeit (Std) | Number |
| `idleTime` | Integer | Время простоя (сек) | Leerlaufzeit (Std) | Number |
| `parkingTime` | Integer | Время парковки (сек) | Parkzeit (Std) | Number |
| `engineWorkTime` | Integer | Время работы двигателя (сек) | Motorlaufzeit (Std) | Number |
| `numberOfStops` | Integer | Количество остановок | Anzahl Stopps | Number |
| `numberOfTrips` | Integer | Количество поездок | Anzahl Fahrten | Number |
| `harshBraking` | Integer | Резкие торможения | Starkes Bremsen | Number |
| `harshAcceleration` | Integer | Резкие ускорения | Starke Beschleunigung | Number |
| `harshCornering` | Integer | Резкие повороты | Scharfe Kurven | Number |
| `overSpeedingTime` | Integer | Время превышения скорости (сек) | Überschreitungszeit | Number |
| `overSpeedingDistance` | Float | Расстояние с превышением (км) | Überschreitungsstrecke | Number |
| `economyScore` | Integer | Оценка экономичности (0-100) | Wirtschaftlichkeit | Number |
| `safetyScore` | Integer | Оценка безопасности (0-100) | Sicherheitswert | Number |

### Из эндпоинта `/reports/work-table/{deviceNumber}`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `dayDistance` | Float | Дневной пробег (км) | Tagesstrecke | Number |
| `nightDistance` | Float | Ночной пробег (км) | Nachtstrecke | Number |
| `dayDrivingTime` | Integer | Дневное время вождения (сек) | Tagesfahrzeit | Number |
| `nightDrivingTime` | Integer | Ночное время вождения (сек) | Nachtfahrzeit | Number |
| `dayFuel` | Float | Дневной расход топлива (л) | Tageskraftstoff | Number |
| `nightFuel` | Float | Ночной расход топлива (л) | Nachtkraftstoff | Number |
| `workStartTime` | Long | Начало работы | Arbeitsbeginn | Date |
| `workEndTime` | Long | Конец работы | Arbeitsende | Date |
| `breakTime` | Integer | Время перерывов (сек) | Pausenzeit | Number |
| `overtimeHours` | Float | Сверхурочные часы | Überstunden | Number |

---

## 💬 СООБЩЕНИЯ И КОММУНИКАЦИЯ

### Из эндпоинта `/activities` (тип MESSAGE)
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `messageId` | Long | ID сообщения | Nachrichten ID | Number |
| `messageText` | String | Текст сообщения | Letzte Nachricht | Rich Text |
| `messageFrom` | String | Отправитель (DRIVER/DISPATCHER) | Absender | Select |
| `messageTime` | Long | Время сообщения | Nachrichtenzeit | Date |
| `messageRead` | Boolean | Сообщение прочитано | Nachricht gelesen | Checkbox |
| `attachmentId` | String | ID вложения | Anhang ID | Rich Text |
| `attachmentName` | String | Имя файла вложения | Anhangname | Rich Text |
| `attachmentType` | String | Тип вложения | Anhangstyp | Select |
| `unreadCount` | Integer | Количество непрочитанных | Ungelesene Nachrichten | Number |

---

## 📦 ЗАГРУЗКИ (LOADS)

### Из эндпоинта `/loads`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `loadId` | String | ID загрузки | Lade ID | Rich Text |
| `integrationId` | String | Внешний ID загрузки | Externe Lade ID | Rich Text |
| `loadStatus` | String | Статус загрузки | Ladestatus | Select |
| `loadType` | String | Тип загрузки | Ladetyp | Select |
| `customerReference` | String | Референс клиента | Kundenreferenz | Rich Text |
| `totalWeight` | Float | Общий вес (тонн) | Gesamtgewicht (t) | Number |
| `totalVolume` | Float | Общий объем (м³) | Gesamtvolumen (m³) | Number |
| `totalPallets` | Integer | Всего паллет | Paletten gesamt | Number |
| `totalPieces` | Integer | Всего мест | Stückzahl | Number |
| `loadValue` | Float | Стоимость груза | Ladewert (€) | Number |
| `currency` | String | Валюта | Währung | Select |
| `pickupAddress` | String | Адрес загрузки | Abholadresse | Rich Text |
| `deliveryAddress` | String | Адрес доставки | Lieferadresse | Rich Text |
| `pickupTime` | Long | Время загрузки | Abholzeit | Date |
| `deliveryTime` | Long | Время доставки | Lieferzeit | Date |
| `assignedDevices` | Array | Назначенные ТС | Zugewiesene Fahrzeuge | Multi-select |
| `documentsRequired` | Array | Требуемые документы | Erforderliche Dokumente | Multi-select |
| `specialInstructions` | String | Особые инструкции | Besondere Anweisungen | Rich Text |

---

## 🔧 СЕРВИС И ОБСЛУЖИВАНИЕ

### Из эндпоинта `/reminders`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `reminderId` | Long | ID напоминания | Erinnerungs ID | Number |
| `reminderType` | String | Тип (SERVICE/INSURANCE/INSPECTION/CUSTOM) | Erinnerungstyp | Select |
| `reminderTitle` | String | Заголовок напоминания | Erinnerungstitel | Rich Text |
| `reminderDescription` | String | Описание | Erinnerungsbeschreibung | Rich Text |
| `dueDate` | Long | Срок выполнения | Fälligkeitsdatum | Date |
| `dueMileage` | Integer | Пробег для выполнения | Fälliger Kilometerstand | Number |
| `reminderStatus` | String | Статус (ACTIVE/COMPLETED/OVERDUE) | Erinnerungsstatus | Select |
| `lastServiceDate` | Long | Дата последнего ТО | Letzter Service | Date |
| `lastServiceMileage` | Integer | Пробег при последнем ТО | Letzter Service km | Number |
| `nextServiceDate` | Long | Дата следующего ТО | Nächster Service | Date |
| `nextServiceMileage` | Integer | Пробег до следующего ТО | Nächster Service km | Number |
| `insuranceExpiry` | Long | Окончание страховки | Versicherungsablauf | Date |
| `inspectionExpiry` | Long | Окончание техосмотра | TÜV Ablauf | Date |
| `licenseExpiry` | Long | Окончание лицензии | Lizenzablauf | Date |
| `serviceHistory` | Array | История обслуживания | Servicehistorie | Rich Text |

---

## 📈 АНАЛИТИКА И KPI

### Из эндпоинта `/fleet/state`
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `fleetUtilization` | Float | Использование автопарка (%) | Flottenauslastung (%) | Number |
| `activeVehicles` | Integer | Активные ТС | Aktive Fahrzeuge | Number |
| `inactiveVehicles` | Integer | Неактивные ТС | Inaktive Fahrzeuge | Number |
| `movingVehicles` | Integer | ТС в движении | Fahrende Fahrzeuge | Number |
| `parkedVehicles` | Integer | Припаркованные ТС | Geparkte Fahrzeuge | Number |
| `idlingVehicles` | Integer | ТС на холостом ходу | Leerlauf Fahrzeuge | Number |
| `offlineVehicles` | Integer | ТС офлайн | Offline Fahrzeuge | Number |
| `totalFleetDistance` | Float | Общий пробег автопарка | Gesamtflottenstrecke | Number |
| `totalFleetFuel` | Float | Общий расход топлива | Gesamtflottenkraftstoff | Number |
| `averageFleetSpeed` | Float | Средняя скорость автопарка | Durchschnittliche Flottengeschwindigkeit | Number |
| `tasksCompleted` | Integer | Выполнено задач | Erledigte Aufgaben | Number |
| `tasksPending` | Integer | Ожидающие задачи | Ausstehende Aufgaben | Number |
| `tasksInProgress` | Integer | Задачи в процессе | Aufgaben in Bearbeitung | Number |
| `onTimeDelivery` | Float | Доставки вовремя (%) | Pünktliche Lieferung (%) | Number |
| `customerSatisfaction` | Float | Удовлетворенность клиентов | Kundenzufriedenheit | Number |

---

## 🚨 СОБЫТИЯ И ТРЕВОГИ

### Из эндпоинта `/activities` (различные типы)
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `alarmType` | String | Тип тревоги | Alarmtyp | Select |
| `alarmTime` | Long | Время тревоги | Alarmzeit | Date |
| `alarmLocation` | String | Место тревоги | Alarmort | Rich Text |
| `alarmSeverity` | String | Серьезность (LOW/MEDIUM/HIGH/CRITICAL) | Alarmschwere | Select |
| `geofenceViolation` | String | Нарушение геозоны | Geofence Verletzung | Rich Text |
| `speedingViolation` | Object | Превышение скорости | Geschwindigkeitsüberschreitung | Rich Text |
| `unauthorizedUse` | Boolean | Несанкционированное использование | Unbefugte Nutzung | Checkbox |
| `emergencyButton` | Boolean | Кнопка экстренного вызова | Notruftaste | Checkbox |
| `accidentDetected` | Boolean | Обнаружена авария | Unfall erkannt | Checkbox |
| `lowFuelAlert` | Boolean | Низкий уровень топлива | Niedriger Kraftstoffstand | Checkbox |
| `maintenanceAlert` | Boolean | Требуется обслуживание | Wartungsalarm | Checkbox |
| `temperatureAlert` | Boolean | Тревога по температуре | Temperaturalarm | Checkbox |

---

## 👤 ДАННЫЕ ВОДИТЕЛЯ

### Из различных эндпоинтов
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `driverId` | String | ID водителя | Fahrer ID | Rich Text |
| `driverName` | String | Имя водителя | Fahrername | Rich Text |
| `driverPhone` | String | Телефон водителя | Fahrertelefon | Phone |
| `driverEmail` | String | Email водителя | Fahrer-Email | Email |
| `driverLicense` | String | Номер водительских прав | Führerscheinnummer | Rich Text |
| `licenseExpiry` | Long | Срок действия прав | Führerscheinablauf | Date |
| `licenseCategories` | Array | Категории прав | Führerscheinkategorien | Multi-select |
| `driverScore` | Integer | Оценка водителя (0-100) | Fahrerbewertung | Number |
| `driverExperience` | Integer | Опыт вождения (лет) | Fahrerfahrung (Jahre) | Number |
| `medicalCheckExpiry` | Long | Срок медосмотра | Medizinische Untersuchung | Date |
| `trainingExpiry` | Long | Срок обучения/аттестации | Schulungsablauf | Date |
| `driverStatus` | String | Статус (AVAILABLE/DRIVING/REST/OFF_DUTY) | Fahrerstatus | Select |
| `assignedVehicle` | String | Назначенное ТС | Zugewiesenes Fahrzeug | Rich Text |
| `homeBase` | String | Домашняя база | Heimatbasis | Rich Text |
| `currentRoute` | String | Текущий маршрут | Aktuelle Route | Rich Text |

---

## 🔄 СИСТЕМНЫЕ И МЕТАДАННЫЕ

### Служебные поля
| Поле API | Тип | Описание | Поле в Notion | Тип в Notion |
|----------|-----|----------|---------------|---------------|
| `lastUpdate` | Long | Время последнего обновления | aktuell | Date |
| `dataSource` | String | Источник данных | Datenquelle | Select |
| `syncStatus` | String | Статус синхронизации | Sync-Status | Select |
| `syncErrors` | Array | Ошибки синхронизации | Sync-Fehler | Rich Text |
| `apiVersion` | String | Версия API | API-Version | Rich Text |
| `deviceFirmware` | String | Версия прошивки устройства | Firmware-Version | Rich Text |
| `lastConnection` | Long | Последнее соединение | Letzte Verbindung | Date |
| `connectionQuality` | Integer | Качество связи (0-100) | Verbindungsqualität | Number |
| `dataCompleteness` | Integer | Полнота данных (%) | Datenvollständigkeit | Number |
| `recordCreated` | Long | Запись создана | Erstellt | Date |
| `recordModified` | Long | Запись изменена | Geändert | Date |
| `modifiedBy` | String | Кем изменено | Geändert von | Rich Text |

---

## 📝 ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ

### Вычисляемые поля (не из API, а рассчитываемые)
| Поле | Описание | Поле в Notion | Тип в Notion | Формула/Логика |
|------|----------|---------------|---------------|----------------|
| `distanceToCurrentTask` | Расстояние до текущей задачи | KM | Number | Haversine formula |
| `distanceToNextTask` | Расстояние до следующей задачи | KM1 | Number | Haversine formula |
| `eta` | Предполагаемое время прибытия | ETA | Date | distance / avgSpeed |
| `delayStatus` | Статус опоздания | Verspätungsstatus | Select | plannedTime - currentTime |
| `fuelEfficiency` | Эффективность расхода топлива | Kraftstoffeffizienz | Number | distance / fuelUsed |
| `utilizationRate` | Коэффициент использования | Auslastungsrate | Number | drivingTime / totalTime |
| `maintenanceStatus` | Статус обслуживания | Wartungsstatus | Select | Based on mileage/date |
| `complianceStatus` | Статус соответствия | Compliance-Status | Select | Based on violations |
| `riskScore` | Оценка риска | Risikobewertung | Number | Based on driving behavior |
| `profitability` | Прибыльность | Rentabilität | Number | revenue - costs |

### Ссылки и интеграции
| Поле | Описание | Поле в Notion | Тип в Notion |
|------|----------|---------------|---------------|
| `googleMapsLink` | Ссылка на Google Maps | Position | URL |
| `whatsAppLink` | Ссылка на WhatsApp | WhatsApp | URL |
| `phoneLink` | Ссылка для звонка | Kontakt | URL |
| `trackerLink` | Ссылка на трекер | Tracker Link | URL |
| `documentLink` | Ссылка на документы | Dokumente | URL |
| `photoGalleryLink` | Ссылка на фотогалерею | Fotogalerie | URL |
| `videoLink` | Ссылка на видео | Video Link | URL |
| `reportLink` | Ссылка на отчет | Bericht Link | URL |

---

## 🎯 СТАТУСЫ И ИНДИКАТОРЫ

### Комплексный статус (вычисляется на основе множества факторов)
| Статус | Условия | Цвет | Приоритет |
|--------|---------|------|----------|
| ⏸️ PAUSIERT | ignition = OFF или currentActivity = REST | Серый | Низкий |
| 🟢 OK | Все параметры в норме | Зеленый | Нормальный |
| 🟡 WARNUNG (<1 Std) | Остается < 1 часа до критических значений | Желтый | Средний |
| 🟠 PAUSE BALD (<45 Min) | Остается < 45 минут времени вождения | Оранжевый | Высокий |
| 🔴 KRITISCH (<30 Min) | Остается < 30 минут или превышены лимиты | Красный | Критический |
| 🚨 ALARM | Активная тревога или авария | Красный мигающий | Экстренный |
| ⚠️ WARTUNG | Требуется обслуживание | Желтый | Средний |
| 📵 OFFLINE | Нет связи > 30 минут | Серый | Средний |
| 🔧 SERVICE | ТС на обслуживании | Синий | Низкий |
| ❌ FEHLER | Критическая ошибка в системе | Красный | Критический |

---

## 📊 СВОДНАЯ ТАБЛИЦА ИСПОЛЬЗОВАНИЯ

### Приоритет полей для отображения в Notion
| Приоритет | Категория | Ключевые поля | Частота обновления |
|-----------|-----------|---------------|--------------------|
| 1 - Критический | Идентификация | registrationNumber, deviceNumber, name | При изменении |
| 1 - Критический | Позиция | lat, lng, speed, address | Каждые 10 сек |
| 1 - Критический | Тахограф | dailyDrivingTimeLeft, continuousDrivingTimeLeft | Каждую минуту |
| 2 - Высокий | Задачи | currentTask, nextTask, taskStatus | Каждые 30 сек |
| 2 - Высокий | Техническое | fuelLevel, engineHours, odometerValue | Каждые 5 минут |
| 3 - Средний | Статистика | dailyDistance, averageSpeed, fuelConsumption | Каждый час |
| 3 - Средний | Сервис | nextServiceDate, insuranceExpiry | Ежедневно |
| 4 - Низкий | История | reports, activities, messages | По запросу |
| 4 - Низкий | Аналитика | scores, KPIs, trends | Ежедневно |

---

## ⚙️ ТЕХНИЧЕСКИЕ ДЕТАЛИ ИНТЕГРАЦИИ

### Ограничения API
- Максимум 1000 устройств на запрос
- Максимум 10000 активностей на запрос
- Лимит запросов: 100 в минуту
- Максимальный размер ответа: 10 МБ
- Таймаут запроса: 30 секунд

### Форматы данных
- Даты: Unix timestamp в миллисекундах (UTC)
- Координаты: Decimal degrees (WGS84)
- Расстояния: метры (в API), километры (в Notion)
- Время: секунды (в API), часы:минуты (в Notion)
- Топливо: литры
- Температура: градусы Цельсия
- Напряжение: милливольты (в API), вольты (в Notion)

### Обработка ошибок
- Пустые поля: пропускаются или заполняются значением по умолчанию
- Неверный формат: логируется, поле пропускается
- Отсутствие связи: сохраняется последнее известное значение
- Превышение лимитов: повторный запрос через экспоненциальную задержку

---

## 📌 ПРИМЕЧАНИЯ

1. **Все временные метки** должны конвертироваться из Unix timestamp (миллисекунды) в ISO 8601 формат для Notion
2. **Все расстояния** из API приходят в метрах и должны конвертироваться в километры
3. **Напряжение** приходит в милливольтах и должно делиться на 1000
4. **Время вождения** приходит в секундах и должно форматироваться в часы:минуты
5. **GSM сигнал** - число от 0 до 100, конвертируется в текстовые уровни
6. **Статусы** вычисляются на основе комбинации множества параметров
7. **Ссылки** генерируются динамически на основе координат и идентификаторов

---

*Последнее обновление: 2025-01-02*
*Версия API: 1.0.34*
*Автор: LocTracker Integration System*