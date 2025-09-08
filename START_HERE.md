# 🔥 HACKER LAB v2.0 - QUICK START 🔥

## 🚀 ЗАПУСК - 3 СПОСОБА

### 1️⃣ САМЫЙ ПРОСТОЙ (Standalone)
**Просто откройте файл:** `hacker_lab.html`
- ✅ Работает сразу
- ⚠️ Некоторые функции могут не работать

### 2️⃣ РЕКОМЕНДУЕМЫЙ (С сервером)
1. **Откройте:** `OPEN_ME.html` 
2. **Нажмите:** "Start with Server"
3. **Или запустите:** `start_hacker_lab.bat`

### 3️⃣ ПРОДВИНУТЫЙ (Вручную)
```bash
# В терминале/PowerShell:
cd C:\lowlevel_lab
python -m http.server 8000

# Откройте в браузере:
http://localhost:8000
```

---

## 📁 СТРУКТУРА ФАЙЛОВ

```
C:\lowlevel_lab\
│
├── 🎯 OPEN_ME.html          # НАЧНИТЕ ОТСЮДА!
├── 🚀 hacker_lab.html       # Standalone версия (все в одном файле)
├── 🔧 start_hacker_lab.bat  # Автозапуск сервера
├── 📱 index.html            # Модульная версия (требует сервер)
├── 🏃 run_lab.ps1          # PowerShell launcher
│
├── assets/                  # Ресурсы для модульной версии
│   ├── css/                # Стили
│   ├── js/                 # JavaScript модули
│   └── data/               # Данные уроков
│
└── 📖 README.md            # Документация

```

---

## 🎮 ГОРЯЧИЕ КЛАВИШИ

- **F10** - Шаг вперед (step)
- **F9** - Продолжить выполнение (continue)
- **/** - Фокус на терминал
- **ESC** - Скрыть/показать терминал

---

## 💻 КОМАНДЫ ТЕРМИНАЛА

### Базовые
- `help` - Список команд
- `levels` - Все уроки
- `load 0.1` - Загрузить урок
- `clear` - Очистить терминал

### Отладка
- `si` - Шаг (step instruction)
- `c` - Продолжить (continue)
- `regs` - Показать регистры
- `stack` - Показать стек
- `flags` - Показать флаги

### Брейкпоинты
- `break 0x401000` - Поставить брейкпоинт
- `del 0x401000` - Убрать брейкпоинт
- `bps` - Список брейкпоинтов

### Урок
- `goal` - Цель урока
- `hint` - Подсказка
- `check` - Проверить выполнение
- `reset` - Сбросить урок

### Элитные (💀)
- `checksec` - Проверка защиты
- `ropgen` - Генератор ROP цепочек
- `shellgen` - Генератор шеллкода
- `exploit buffer_overflow` - Симуляция эксплойта

---

## 🔧 РЕШЕНИЕ ПРОБЛЕМ

### ❌ "ES6 modules not supported"
**Решение:** Используйте HTTP сервер или откройте `hacker_lab.html`

### ❌ Python не найден
**Установка Python:**
```powershell
# Через winget:
winget install Python.Python.3

# Или скачайте с:
https://python.org
```

### ❌ Ничего не работает
1. Откройте `OPEN_ME.html`
2. Следуйте инструкциям
3. Или просто откройте `hacker_lab.html` напрямую

---

## 📚 МОДУЛИ КУРСА

### Module 0: Orientation
- 0.1 Hello, World
- 0.2 MOV & ADD
- 0.3 Memory

### Module 1: Control & Data
- 1.1 Conditionals
- 1.2 Loops
- 1.3 strlen
- 1.4 Checksum
- 1.5 Switch

### Module 2: Advanced
- 2.1 Calling Convention
- 2.2 PLT/GOT
- 2.3 Stack Canary
- 2.4 Compiler Idioms
- 2.5 XOR Crackme

### Module 3+: Elite
- Дополнительные продвинутые уроки
- CTF челленджи
- Реверс-инжиниринг

---

## 💀 СОЗДАНО

**Λήθη (Lethe)**  
Government-grade hacking simulation  
Educational purposes only

---

**НАЧНИТЕ С:** `OPEN_ME.html` 🚀
