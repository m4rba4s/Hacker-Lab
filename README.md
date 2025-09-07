# RET Academy 🔥

**Interactive Reverse Engineering & Assembly Learning Platform**

A comprehensive web-based educational platform for learning reverse engineering, assembly language, and binary analysis. Built for cybersecurity students, malware researchers, and anyone interested in low-level system analysis.

## 🚀 Features

### Core Modules
- **🔬 Disassembly Viewer** - Interactive assembly code analysis with syntax highlighting
- **📄 Source Code Tab** - View and compare C/C++ source with assembly output  
- **🗃️ Hex Editor** - Binary analysis with pattern detection and entropy calculation
- **🔤 String Analysis** - Extract and analyze string literals from binaries
- **🌊 Control Flow Graph** - Visual program flow representation
- **📚 Interactive Lessons** - Hands-on tutorials with gamification
- **📊 Statistics & Achievements** - Track learning progress
- **🎓 Concepts Visualizer** - Memory layout and system concepts
- **⚡ System Calls Reference** - Comprehensive Linux/Windows syscall database

### Educational Content
- **Progressive Learning Path** - From basics to advanced exploitation
- **Real Code Examples** - Practical assembly and C code samples
- **Interactive Challenges** - Hands-on reverse engineering tasks
- **Memory Visualization** - Stack, heap, and memory layout diagrams
- **Syscall Playground** - Generate and test shellcode

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6 modules)
- **Architecture**: Modular component-based design
- **Styling**: Custom CSS with dark cyberpunk theme
- **Data**: JSON-based lesson and syscall databases
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 📦 Quick Start

### Option 1: Direct Browser
```bash
git clone https://github.com/m4rba4s/RET-Academy.git
cd RET-Academy
# Open index.html in your browser
```

### Option 2: Local Server (Recommended)
```bash
git clone https://github.com/m4rba4s/RET-Academy.git
cd RET-Academy

# Python 3
python -m http.server 8000

# Node.js
npx http-server

# Then visit http://localhost:8000
```

## 🎯 Learning Modules

### 1. Assembly Fundamentals
- x86-64 instruction set
- Register usage and calling conventions
- Memory addressing modes
- Basic arithmetic and logic operations

### 2. Reverse Engineering Basics
- Static vs dynamic analysis
- Tool usage (disassemblers, debuggers)
- Binary file formats (ELF, PE)
- String and pattern analysis

### 3. Memory Management
- Stack and heap organization
- Buffer overflows and exploitation
- Memory protection mechanisms
- Address space layout

### 4. System Programming
- System call interfaces
- Inter-process communication
- File system operations
- Network programming

### 5. Advanced Topics
- Anti-debugging techniques
- Code obfuscation and packing
- Function hooking and injection
- Exploit development

## 💻 System Calls Database

Comprehensive reference covering:
- **Linux x64**: 30+ syscalls with examples
- **Windows x64**: Native API calls (Nt* functions)
- **Interactive playground**: Generate custom shellcode
- **Real examples**: Practical usage scenarios

## 🎨 User Interface

- **Dark Theme**: Cyberpunk-inspired design optimized for long coding sessions
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Syntax Highlighting**: Assembly, C/C++, and hex data visualization
- **Interactive Elements**: Click, hover, and drag interactions
- **Progress Tracking**: Visual feedback and achievement system

## 🔧 Architecture

```
RET-Academy/
├── assets/
│   ├── css/           # Modular stylesheets
│   ├── js/
│   │   ├── core/      # Core application logic
│   │   ├── ui/        # UI components
│   │   └── data/      # Lesson and syscall data
│   └── img/           # Images and icons
├── index.html         # Main application entry point
└── README.md
```

## 🤝 Contributing

We welcome contributions! Areas where help is needed:

- **Content**: Additional lessons and challenges
- **Features**: New analysis tools and visualizations  
- **Translations**: Multi-language support
- **Testing**: Browser compatibility and bug reports
- **Documentation**: Tutorials and guides

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📖 Documentation

- **User Guide**: Complete feature documentation
- **Developer Guide**: Architecture and API reference
- **Lesson Creation**: How to add new educational content
- **Customization**: Theming and configuration options

## 🎓 Educational Goals

**RET Academy** aims to:
- Demystify low-level system programming
- Provide hands-on cybersecurity education
- Bridge theory and practical application
- Create an inclusive learning environment
- Prepare students for real-world security challenges

## 🔒 Security Note

This platform is designed for **educational purposes only**. All examples and techniques should be used responsibly and only on systems you own or have explicit permission to analyze.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Assembly syntax highlighting inspired by various open-source projects
- Educational content structured around industry best practices
- UI/UX influenced by modern development environments
- Community feedback and contributions

---

**Built with ❤️ for the cybersecurity and reverse engineering community**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/m4rba4s/RET-Academy) or open an issue.

# 🚀 Hacker Lab v2.0 - Interactive Assembly & Reverse Engineering

Интерактивная лаборатория для изучения ассемблера и реверс-инжиниринга в браузере. Полностью автономная, безопасная и готовая к использованию без установки.

## 🎯 Особенности

- **Понятные объяснения** - каждый урок содержит детальное объяснение простым языком
- **13 интерактивных уроков** от новичка до продвинутого уровня - полный курс завершен!
- **pwndbg-style терминал** с полным набором команд отладчика
- **Темная хакерская эстетика** с неоновыми акцентами
- **Пошаговые комментарии** - каждый шаг выполнения объясняется в терминале
- **Визуализация в реальном времени**: регистры, стек, флаги, дизассемблер
- **Безопасность**: только симуляция, без выполнения реального кода
- **Офлайн работа**: никаких внешних зависимостей
- **Прогресс**: автоматическое сохранение и экспорт

## 🚀 Быстрый старт

1. Открой `hacker_lab.html` в любом современном браузере
2. Никакой установки или сервера не требуется!
3. Используй `F10` для шага, `F9` для продолжения
4. Набери `help` в терминале для списка команд

## 🎮 Управление

### Горячие клавиши
- **F10** - Шаг (si)
- **F9** - Продолжить (c)  
- **/** - Фокус на терминал

### Команды терминала
```
help          - Показать справку
levels        - Список всех уроков
load <id>     - Загрузить урок (например: load 0.1)
si            - Шаг (step instruction)
c             - Продолжить (continue)
break <addr>  - Поставить брейкпоинт
del <addr>    - Убрать брейкпоинт
bps           - Показать все брейкпоинты
regs          - Показать регистры
stack         - Показать стек
flags         - Показать флаги
goal          - Показать цель урока
hint          - Показать подсказку
explain       - Показать подробное объяснение урока
flow          - Переключиться на Control Flow Graph
check         - Проверить выполнение урока
reset         - Сбросить текущий урок
```

## 📚 Структура курса

### Module 0: Orientation (Ориентация)
- **0.1** Hello, World - знакомство с интерфейсом
- **0.2** MOV & ADD - базовые инструкции
- **0.3** Memory - работа с памятью

### Module 1: Control & Data (Управление и данные)  
- **1.1** Conditionals - условные переходы
- **1.2** Loops - циклы
- **1.3** strlen - работа со строками
- **1.4** Checksum - суммирование
- **1.5** Switch - таблицы переходов

### Module 2: Advanced (Продвинутый)
- **2.1** Calling Convention - соглашения о вызовах
- **2.2** PLT/GOT - динамическая линковка
- **2.3** Stack Canary - защита стека
- **2.4** Compiler - идиомы компилятора
- **2.5** XOR Crackme - простая защита

## 🛠️ Расширение

### Добавление нового урока

Отредактируй объект `Lessons` в HTML файле:

```javascript
'X.Y': {
    id: 'X.Y',
    title: 'Название урока',
    goal: 'Описание цели',
    hint: 'Подсказка',
    base: 0x401000,
    disasm: [
        { a: 0x401000, b: '55', s: 'push rbp' },
        // ... остальные инструкции
    ],
    trace: [
        { ip: 0, regs: { rax: 0x10n } },
        // ... состояния после каждого шага
    ],
    check: state => state.regs.rax === 0x37n // условие успеха
}
```

### Структура trace
- `ip` - индекс инструкции в массиве disasm
- `regs` - изменения регистров (используй BigInt для 64-битных значений)
- `flags` - изменения флагов (zf, sf, of, cf)
- `stack` - состояние стека (массив значений)

## 🔒 Безопасность

- Полная песочница - никакого выполнения реального кода
- Только симуляция на основе заранее записанных трассировок
- Все данные локальные, никаких сетевых запросов
- Образовательные цели - никаких вредоносных примеров

## 📊 Прогресс и данные

- Прогресс сохраняется в `localStorage`
- Кнопка "Export Progress" для создания резервной копии
- Формат: JSON с отметками о завершенных уроках

## 🎨 Технические детали

- Vanilla JavaScript (ES2020+)
- CSS Grid/Flexbox для адаптивной верстки
- Одностраничное приложение без зависимостей
- Размер файла: ~35KB (сжатый HTML+CSS+JS)
- Совместимость: Chrome 90+, Firefox 90+, Safari 14+

## 🤝 Вклад в проект

Хочешь добавить новые уроки или улучшить функциональность?
1. Форкни проект  
2. Добавь свои уроки в объект `Lessons`
3. Протестируй в браузере
4. Создай pull request

## 📜 Лицензия

Только для образовательных целей. Не используй для анализа вредоносного ПО или других незаконных действий.

---

**Приятного хакинга!** 🔥#   H a c k e r - L a b  
 