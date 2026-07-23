import AppKit
import SwiftUI
import Combine

public final class FocusManager: ObservableObject {
    @Published public var isFocusModeActive: Bool = false
    
    private var overlayWindows: [NSWindow] = []
    private var windowManager: WindowManager?
    private var cancellables = Set<AnyCancellable>()
    private var originalTimerWindowLevel: NSWindow.Level = .floating
    
    public init() {}
    
    public func setWindowManager(_ wm: WindowManager) {
        self.windowManager = wm
    }
    
    public func toggleFocusMode() {
        if isFocusModeActive {
            deactivateFocusMode()
        } else {
            activateFocusMode()
        }
    }
    
    public func activateFocusMode() {
        guard !isFocusModeActive else { return }
        Logger.focus.info("Activating Focus Mode blocking overlay")
        isFocusModeActive = true
        
        // 1. Elevate Main Timer Window level so it sits above the overlays
        if let mainWindow = windowManager?.mainWindow {
            self.originalTimerWindowLevel = mainWindow.level
            // Set level higher than statusBar to float on top of overlay
            mainWindow.level = NSWindow.Level(rawValue: NSWindow.Level.statusBar.rawValue + 1)
            mainWindow.orderFrontRegardless()
        }
        
        // 2. Create and show fullscreen overlay window on every screen
        for screen in NSScreen.screens {
            let overlay = FocusOverlayWindow(contentRect: screen.frame)
            overlay.orderFrontRegardless()
            overlayWindows.append(overlay)
        }
        
        // 3. Register for application activation notifications for aggressive auto-refocusing
        NSWorkspace.shared.notificationCenter.publisher(for: NSWorkspace.didActivateApplicationNotification)
            .sink { [weak self] notification in
                self?.handleWorkspaceAppActivation(notification)
            }
            .store(in: &cancellables)
            
        // Keep focus on our app
        NSApp.activate(ignoringOtherApps: true)
    }
    
    public func deactivateFocusMode() {
        guard isFocusModeActive else { return }
        Logger.focus.info("Deactivating Focus Mode")
        isFocusModeActive = false
        
        // 1. Restore Main Timer Window level
        if let mainWindow = windowManager?.mainWindow {
            mainWindow.level = self.originalTimerWindowLevel
        }
        
        // 2. Close all overlay windows
        for window in overlayWindows {
            window.close()
        }
        overlayWindows.removeAll()
        
        // 3. Stop monitoring app switching
        cancellables.removeAll()
    }
    
    private func handleWorkspaceAppActivation(_ notification: Notification) {
        guard isFocusModeActive else { return }
        
        guard let app = notification.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication else { return }
        
        // If the activated app is not us, aggressively pull focus back
        if app.bundleIdentifier != Bundle.main.bundleIdentifier {
            Logger.focus.info("App switch detected to: \(app.localizedName ?? "unknown"). Refocusing Yogi Timer...")
            
            // Re-order timer window and overlays to front
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                NSApp.activate(ignoringOtherApps: true)
                self.windowManager?.mainWindow?.makeKeyAndOrderFront(nil)
                for overlay in self.overlayWindows {
                    overlay.orderFrontRegardless()
                }
            }
        }
    }
}

// MARK: - Focus Blocking Overlay Window Subclass

public final class FocusOverlayWindow: NSWindow {
    
    public init(contentRect: NSRect) {
        super.init(
            contentRect: contentRect,
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        
        self.title = "Yogi Timer Focus Overlay"
        // Semi-transparent black background
        self.backgroundColor = NSColor.black.withAlphaComponent(0.85)
        self.isOpaque = false
        self.hasShadow = false
        self.ignoresMouseEvents = false // Trap all mouse events!
        
        // Place at status bar level so it sits on top of standard apps and Dock
        self.level = .statusBar
        
        // Show across all spaces
        self.collectionBehavior = [
            .canJoinAllSpaces,
            .fullScreenAuxiliary,
            .ignoresCycle
        ]
        
        self.isReleasedWhenClosed = false
        self.hidesOnDeactivate = false
        
        // Simple visual content: a dark panel
        let hostingView = NSHostingView(rootView: FocusOverlayView())
        self.contentView = hostingView
    }
    
    // Become key window so we can trap keyboard keys
    public override var canBecomeKey: Bool {
        return true
    }
    
    public override var canBecomeMain: Bool {
        return true
    }
}

// MARK: - Overlay Content View

struct FocusOverlayView: View {
    var body: some View {
        ZStack {
            Color.clear
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black.opacity(0.01)) // Non-zero opacity to capture mouse clicks
    }
}
