# Contributing to Yogi Timer

Thank you for your interest in contributing to **Yogi Timer**! This document outlines coding guidelines, file structures, and the workflow for landing changes.

---

## 1. Development Principles
- **No Dependencies:** Avoid external packages (CocoaPods, Swift Package Manager libraries) unless absolutely necessary. Rely on native Apple frameworks (`AppKit`, `SwiftUI`, `Combine`, `OSLog`).
- **Energy Efficiency First:** Every logic flow must optimize for battery life. Keep timers in background threads, keep layouts light, and do not trigger unnecessary redraws.
- **Maintain Design Philosophy:** The application must remain pitch-black, silent, distraction-free, and high contrast. Do not suggest adding flashy colors or complex widget themes.

---

## 2. Directory Layout & Style
All Swift files must reside inside the `Sources/` directory:
- `Sources/App/`: Application delegate and lifecycle classes.
- `Sources/Core/`: Core manager logic.
- `Sources/UI/`: Pure SwiftUI layout views.
- `Sources/Utilities/`: Utility objects (Logger, formatting, helpers).

### Coding Standards
- Format code using standard Swift style.
- Avoid using standard `print()` statements; use the unified `Logger` category matching your module.
- Keep components small and specialized.
- Document any platform-specific features (such as `NSWindow` level adjustments).

---

## 3. Pull Request Workflow
1. Check the active tasks in [ROADMAP.md](file:///Users/legend27648/agy_project/yogi_timer/ROADMAP.md).
2. Create a feature branch with a descriptive name (`feature/custom-sounds`).
3. Commit logical units (one feature at a time).
4. Verify compiling using `./build.sh` before submitting.
5. Create a clean Pull Request.
