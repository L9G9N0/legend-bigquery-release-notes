# Yogi Timer 🧘‍♂️

> **Time is finite.**
> Yogi Timer is a production-quality native macOS focus companion designed to quietly exist in the corner of your screen and serve as a constant visual reminder that every second matters.

---

## The Philosophy
Yogi Timer is **not a stopwatch**. It is a minimal, elegant tool designed to foster present awareness. It does not contain flashy animations, colorful gradients, or noisy distractions. It is dark-first, minimal, and premium.

---

## Features
- **High-Precision Countdown Timer:** Implemented using background `DispatchSourceTimer` (low CPU, low power) that survives window minimizations, system sleep, and application restarts.
- **Floating Window:** A borderless floating panel that stays always on top. Snaps to standard screen corners (Top Left, Top Right, Bottom Left, Bottom Right) or supports custom placement. Supports multiple monitors and stays visible over fullscreen applications.
- **Focus Mode:** A blocking overlay that dims all screens (85% pitch-black transparency) to isolate your main timer workspace and aggressively refocuses Yogi Timer if you try to switch to other applications.
- **Task System:** A lightweight task checklist that collapses/expands directly inside the timer window. Tasks are persisted locally in JSON format.
- **Reminder System:** Delivers macOS Notifications, plays native audio alerts, and triggers a subtle screen-wide visual color flash when the session completes.

---

## Keyboard Shortcuts
When the Yogi Timer window is focused, you can use these shortcuts:
- `Space` — Start / Pause / Resume
- `R` — Reset timer to initial duration
- `C` — Configure custom duration (preset selectors or increment buttons)
- `T` — Toggle task manager tray
- `F` — Toggle Focus Mode (blocking overlay)
- `Cmd + Q` — Quit application

---

## Getting Started
For details on building and setting up permissions (Notifications, Focus Mode behavior, etc.), refer to:
- [SETUP.md](file:///Users/legend27648/agy_project/yogi_timer/SETUP.md)
- [SYSTEM_ARCHITECTURE.md](file:///Users/legend27648/agy_project/yogi_timer/SYSTEM_ARCHITECTURE.md)
