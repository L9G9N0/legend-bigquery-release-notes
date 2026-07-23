# System Architecture Guide

This document describes the architectural layout, design patterns, and efficiency optimizations of Yogi Timer.

---

## 1. Directory Structure

The project conforms to Clean Architecture principles, separated into Core business logic, UI rendering, Utilities, and App entry layers:

```
yogi_timer/
├── Sources/
│   ├── App/
│   │   └── YogiTimerApp.swift      # NSApplicationDelegate lifecycle entry point
│   ├── Core/
│   │   ├── Timer/
│   │   │   └── TimerManager.swift  # High-precision timer and persistence engine
│   │   ├── Window/
│   │   │   └── WindowManager.swift # Custom borderless NSWindow configuration
│   │   ├── Focus/
│   │   │   └── FocusManager.swift  # Full-screen overlays and focus trapping
│   │   ├── Task/
│   │   │   └── TaskManager.swift   # JSON task store & window frame resizing
│   │   └── Reminder/
│   │       └── ReminderManager.swift # Sound, alerts, flashing and notification delivery
│   ├── UI/
│   │   ├── Main/
│   │   │   └── TimerView.swift     # Core timer view, gesture controls, context menu
│   │   ├── Task/
│   │   │   └── TaskView.swift      # Tasks tray layout and form field
│   │   └── Components/
│   │       └── TimePicker.swift    # Compact slider & preset duration picker
│   └── Utilities/
│       └── Logger.swift            # OSLog wrappers for structured logging
├── build.sh                        # Shell script to build YogiTimer.app
└── Info.plist                      # Application settings configuration
```

---

## 2. Technical Mechanisms

### A. High-Precision Timer (Battery & Power Optimization)
Standard SwiftUI `Timer.publish` runs on the main `RunLoop` and is heavily throttled by AppKit when the window is minimized, hidden behind other windows, or when the system experiences UI load.
To avoid throttling and keep CPU/power usage at almost 0%, Yogi Timer uses a dedicated background GCD dispatch queue (`com.yogi.timer.queue`) to manage a `DispatchSourceTimer`. This timer checks state at high precision (every 100ms) but only dispatches updates to the main thread when time intervals change, keeping the GUI thread idle.

### B. Application Restart Survival (Delta-Time Persistence)
To survive application crashes, manual quits, or system reboots, we do not rely on incrementing timers inside active memory.
Instead, we save the following variables to `UserDefaults`:
- `timerRunning`: Boolean status.
- `targetEndTimestamp`: The absolute system `Date` when the timer is scheduled to hit zero.
- `pausedRemainingSeconds`: TimeInterval left if the timer was paused.
- `initialDuration`: The starting duration config.

When the application launches:
1. It reads these variables.
2. If `timerRunning` is `true`, it compares `targetEndTimestamp` with the current system clock (`Date()`).
3. If `targetEndTimestamp > Date()`, it sets `remainingSeconds` to the difference and resumes ticking.
4. If `targetEndTimestamp <= Date()`, it completes immediately and alerts the user.

This ensures the timer is completely immune to app restarts, background throttling, or OS-level app suspension.

### C. Floating Window & Fullscreen Overlays
The application hides its Dock Icon using `LSUIElement = true` in `Info.plist`.
To make the window float above all workspaces, fullscreen spaces, and Mission Control, the custom `YogiTimerWindow` overrides standard AppKit settings:
- `level = .floating` (promoted to `.statusBar` + 1 during Focus Mode).
- `collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .ignoresCycle]`.
- Custom corner radius and borders are drawn natively via SwiftUI overlays, avoiding expensive CPU pixel manipulation.
