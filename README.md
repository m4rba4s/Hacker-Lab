<img src="https://i.ibb.co/ynfLKF2Q/Screenshot.png" alt="App Screenshot" width="600"/>

# RET Academy 🔥

**Interactive Reverse Engineering & Assembly Learning Platform**

A comprehensive, browser-based platform for learning reverse engineering, assembly, and binary analysis — built for cybersecurity students, malware researchers, and anyone curious about low-level systems.

[![Status](https://img.shields.io/badge/status-active-brightgreen)](./)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Made with](https://img.shields.io/badge/made%20with-HTML5%2FCSS3%2FJS-black)](./)
[![Educational](https://img.shields.io/badge/purpose-educational-orange)](./)

---

## ✨ Why RET Academy?

* 100% client-side (no backend, no installs)
* Built for clarity: visualizations, step-through execution, and hands-on challenges
* Practical focus: from assembly basics to real-world RE workflows

---

## 🚀 Core Features

### Analysis & Tools

* **🔬 Disassembly Viewer** — interactive asm with syntax highlighting
* **📄 Source ↔ Assembly Diff** — compare C/C++ and compiler output
* **🗃️ Hex Editor** — pattern detection & entropy hints
* **🔤 String Analysis** — extract & inspect literals quickly
* **🌊 Control Flow Graph** — visualize program flow
* **⚡ System Calls Reference** — Linux/Windows syscall database (searchable)
* **🎓 Concepts Visualizer** — memory layout, calling conventions, and ABI concepts

### Learning Experience

* **📚 Interactive Lessons** — progressive path from fundamentals to advanced
* **🎮 Challenges** — practical reverse-engineering tasks
* **🧠 Memory Visualizer** — stack/heap diagrams & live register views
* **🏅 Progress & Achievements** — track completion and milestones

---

## 🧪 Built-In: *Hacker Lab v2.0* (Interactive Simulator)

A fully sandboxed, pwndbg-style RE terminal in your browser — **no real code executes**; everything is simulated and safe.

**Highlights**

* Real-time views: **registers, stack, flags, disassembly, CFG**
* Step execution: **F10** (step), **F9** (continue)
* Terminal commands with inline guidance and goals
* Offline by design; progress saved to `localStorage`

**Hotkeys**

* **F10** — step (`si`)
* **F9** — continue (`c`)
* **/** — focus terminal

**Terminal Commands**

```
help            # help overview
levels          # list lessons
load <id>       # load lesson (e.g. load 0.1)
si              # step instruction
c               # continue
break <addr>    # set breakpoint
del <addr>      # remove breakpoint
bps             # list breakpoints
regs            # show registers
stack           # show stack
flags           # show flags
goal            # lesson goal
hint            # hint for current lesson
explain         # full explanation
flow            # toggle Control Flow Graph
check           # validate lesson completion
reset           # reset current lesson
```

---

## 🧭 Curriculum Overview

### Module 0 — Orientation

* **0.1** Hello, World — UI & basics
* **0.2** MOV & ADD — first instructions
* **0.3** Memory — addressing & loads/stores

### Module 1 — Control & Data

* **1.1** Conditionals — flags & branches
* **1.2** Loops — counters & patterns
* **1.3** `strlen` — strings & termination
* **1.4** Checksum — accumulation idioms
* **1.5** Switch — jump tables & dispatch

### Module 2 — Advanced

* **2.1** Calling Conventions — SysV/Win64
* **2.2** PLT/GOT — dynamic linking
* **2.3** Stack Canary — stack hardening
* **2.4** Compiler Idioms — common patterns
* **2.5** XOR Crackme — simple protection

---

## 💻 System Calls Database

* **Linux x64** — curated set with signatures & examples
* **Windows x64 (Native API)** — `Nt*` references
* **Playground** — generate pseudo-shellcode snippets (simulated)
* **Context** — usage notes and pitfalls

---

## 🛠 Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6 modules, no frameworks)
* **Architecture:** Modular, component-based
* **Styling:** Custom CSS, dark cyberpunk theme
* **Data:** JSON (lessons, syscall DB)
* **Compatibility:** Chrome / Firefox / Safari / Edge (modern versions)

---

## ⚡ Quick Start

### Option 1 — Open directly in the browser

```bash
git clone https://github.com/m4rba4s/RET-Academy.git
cd RET-Academy
# Open index.html in your browser
```

### Option 2 — Local static server (recommended)

```bash
git clone https://github.com/m4rba4s/RET-Academy.git
cd RET-Academy

# Python 3
python -m http.server 8000

# or Node.js
npx http-server

# then visit
http://localhost:8000
```

---

## 🧩 Project Structure

```
RET-Academy/
├─ assets/
│  ├─ css/          # Modular styles
│  ├─ js/
│  │  ├─ core/      # App logic (state, engine, simulator)
│  │  ├─ ui/        # UI components (views, widgets, CFG)
│  │  └─ data/      # Lessons & syscall JSON
│  └─ img/          # Icons & illustrations
├─ index.html        # Main entry
└─ README.md
```

---

## 🧱 Adding a New Lesson

Edit the `Lessons` object in your lesson bundle (JS). Minimal shape:

```js
'X.Y': {
  id: 'X.Y',
  title: 'Lesson Title',
  goal: 'What the learner must achieve',
  hint: 'A helpful hint',
  base: 0x401000,             // display base for disasm
  disasm: [
    { a: 0x401000, b: '55', s: 'push rbp' },
    // ...
  ],
  trace: [
    { ip: 0, regs: { rax: 0x10n } },
    // ... post-step states
  ],
  check: (state) => state.regs.rax === 0x37n // success condition
}
```

**Trace fields**

* `ip` — index into the `disasm` array
* `regs` — register deltas (`BigInt` for 64-bit)
* `flags` — `zf/sf/of/cf` changes
* `stack` — array snapshot (optional)

---

## 🧭 Roadmap

* More platform lessons (ARM64, RISC-V idioms)
* Deeper CFG interactions (path constraints, summaries)
* Exportable “lesson packs” & translations
* Accessibility polish (reduced motion, high-contrast)

---

## 🤝 Contributing

We welcome contributions!

**You can help with:**

* **Content:** new lessons & challenges
* **Features:** analysis tools, visualizations, UI/UX
* **Translations:** multi-language content
* **Testing:** browser compatibility, bug reports
* **Docs:** tutorials, screenshots, walkthroughs

**Dev Flow**

1. Fork the repo
2. Create a feature branch
3. Implement & test locally
4. Open a pull request with a clear description and screenshots where relevant

---

## 📖 Documentation

* **User Guide:** full feature tour
* **Developer Guide:** architecture & APIs
* **Lesson Authoring:** JSON/JS format, tracing model
* **Customization:** theming and config hooks

---

## 🎨 UI & UX

* **Dark Theme:** cyberpunk-inspired, eye-friendly for long sessions
* **Responsive:** desktop, tablet, mobile
* **Syntax Highlighting:** asm, C/C++, hex
* **Interactive:** click/hover/drag, contextual tips
* **Progress Tracking:** achievements & completion states

---

## 🔒 Security & Ethics

This project is for **educational purposes only**.
Use techniques **responsibly** and only on systems you **own** or have **explicit permission** to analyze. No real code is executed by the simulator; all lessons are deterministic and sandboxed.

---

## 📜 License

**MIT** — see [`LICENSE`](./LICENSE).

---

## 🙏 Acknowledgments

* Inspired by open-source RE tooling and teaching approaches
* Lesson structure aligned with industry best practices
* UI/UX influenced by modern dev environments
* Huge thanks to the community for feedback and contributions

---

**Built with ❤️ for the reverse-engineering & cybersecurity community.**
Questions, ideas, or issues? Open an issue or PR at:
**[https://github.com/m4rba4s/RET-Academy](https://github.com/m4rba4s/RET-Academy)**


