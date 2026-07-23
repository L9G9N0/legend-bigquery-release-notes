# Project Roadmap

This roadmap outlines planned features, improvements, and objectives for future releases of Yogi Timer.

---

## 📅 Short-Term (v1.1)
- [ ] **Custom Alarm Sounds:** Support importing custom audio files (.mp3, .wav) for reminders rather than relying solely on system default sound effects.
- [ ] **Dynamic Preset Configurator:** An interface to let users change the quick presets (currently 15m, 25m, 50m, 90m) to their preferred intervals.
- [ ] **Menu Bar Status Item:** Allow showing an optional compact status bar item with the remaining countdown time in the macOS menu bar.

---

## 📅 Medium-Term (v1.2)
- [ ] **Focus Analytics & Stats:** Local SQLite-backed database tracking completed focus sessions to show minimal charts of daily/weekly focus trends.
- [ ] **Hardcore Focus Option:** Accessibility API integration (`CGEventTap`) to block system shortcuts like `Cmd + Tab` completely, creating a true distraction-free environment.
- [ ] **iCloud Syncing:** Synced tasks across multiple macOS devices using iCloud Key-Value storage.

---

## 📅 Long-Term (v2.0)
- [ ] **App Store Distribution:** Code-signing, notarizing, and configuring Yogi Timer for deployment to the Mac App Store.
- [ ] **Companion iPhone/iPad App:** A lightweight companion app using SwiftData and widgets, keeping focus data in sync across Apple platforms.
