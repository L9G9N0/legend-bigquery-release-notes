# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-23

### Added
- **Core Engine:** High-precision background `DispatchSourceTimer` logic with persistence across application restarts and sleep cycles.
- **Window Management:** Borderless custom `NSWindow` supporting click-to-drag, corner rounding, snap-to-corner positioning, and persistent coordinates.
- **Focus Mode:** dimming overlay windows on all screens at `.statusBar` level with aggressive automatic app reactivation.
- **Task Tray:** Collapsible task check-list directly inside the floating window, with JSON persistence.
- **Reminders:** Fullscreen alert warning, audio alerts, and macOS notifications with customizable accent colors.
- **Structured Logging:** Unified `OSLog` wrapper class.
- **Build System:** Lightweight compiling shell script `./build.sh` targeting Apple Silicon macOS 14.0+.
