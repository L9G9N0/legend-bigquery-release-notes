# Setup & Installation Guide

This document describes how to compile, launch, and configure Yogi Timer on macOS.

---

## 1. Compilation
Yogi Timer is built using Swift 6 and AppKit/SwiftUI. Since it compiles down to native binary modules without external package dependencies, you can compile it using the included build script:

```bash
# 1. Clone or open the repository
cd /Users/legend27648/agy_project/yogi_timer

# 2. Grant execution permission if needed
chmod +x build.sh

# 3. Build the .app bundle
./build.sh
```

Upon success, a `YogiTimer.app` bundle is generated in the root directory.

---

## 2. Launching
Run the application using:
```bash
open YogiTimer.app
```
As a menu-bar/utility-agent style application, it will not clutter your Dock. Instead, the floating window will appear in the top-right corner of your screen. 
- **Interact:** Click anywhere on the black window to drag it.
- **Configure / Exit:** Right-click anywhere on the window to access the settings context menu (Snap positions, Focus Mode, Appearance, Alert Settings, and Exit).

---

## 3. Required Permissions

### A. Notifications (Optional but Recommended)
* **Why it is required:** Allows Yogi Timer to alert you when your countdown reaches zero, even if your screen is locked or you are away from the machine.
* **Manual Setup:**
  1. On first launch, or when clicking "Request Notification Permission" in the right-click menu, macOS will display a prompt asking: *"YogiTimer.app would like to send you notifications."*
  2. Click **Allow**.
  3. If you accidentally clicked Don't Allow, go to **System Settings > Notifications > YogiTimer** and toggle "Allow Notifications" to **ON**.

### B. Focus Mode & App Switching (Zero-Permission Architecture)
* **Design Note:** Rather than requesting invasive system-level Accessibility (`AXIsProcessTrusted`) or Screen Recording permissions (which are often blocked in corporate settings), Yogi Timer uses a **Zero-Permission Architecture** to block distractions:
  - Custom full-screen overlays dim connected monitors at the `.statusBar` level.
  - Yogi Timer observes public system workspace notifications (`didActivateApplicationNotification`). If it detects you switched to another app while Focus Mode is active, it automatically pulls focus back and makes itself active.
* **Caveat:** Standard macOS shortcuts like `Cmd + Opt + Esc` (Force Quit) or clicking system menu-bar icons remain operational to ensure you can always exit in an emergency.
