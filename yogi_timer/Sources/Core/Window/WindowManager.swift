import AppKit
import SwiftUI
import Combine

public enum WindowPosition: String, CaseIterable, Codable {
    case topLeft
    case topRight
    case bottomLeft
    case bottomRight
    case custom
}

public final class WindowManager: NSObject, ObservableObject {
    @Published public var currentPosition: WindowPosition = .topRight
    
    public var mainWindow: YogiTimerWindow?
    private var cancellables = Set<AnyCancellable>()
    private let positionKey = "yogi.window.position"
    private let frameKey = "yogi.window.frame"
    
    public override init() {
        super.init()
        // Load position
        if let savedPosString = UserDefaults.standard.string(forKey: positionKey),
           let savedPos = WindowPosition(rawValue: savedPosString) {
            self.currentPosition = savedPos
        } else {
            self.currentPosition = .topRight
        }
    }
    
    public func setupMainWindow<Content: View>(content: Content) {
        let size = NSSize(width: 180, height: 75) // Compact, sleek design
        let rect = getInitialFrame(for: size)
        
        let window = YogiTimerWindow(
            contentRect: rect,
            styleMask: [.borderless, .resizable], // Allow resizing but borderless
            backing: .buffered,
            defer: false
        )
        
        // Wrap content in a host view
        let hostingView = NSHostingView(rootView: content)
        window.contentView = hostingView
        window.minSize = NSSize(width: 140, height: 60)
        window.maxSize = NSSize(width: 400, height: 400) // Allow expanding for tasks list
        
        self.mainWindow = window
        
        // Listen to window moves/resizes to save position
        NotificationCenter.default.publisher(for: NSWindow.didMoveNotification, object: window)
            .sink { [weak self] _ in self?.handleWindowMoved() }
            .store(in: &cancellables)
            
        NotificationCenter.default.publisher(for: NSWindow.didResizeNotification, object: window)
            .sink { [weak self] _ in self?.handleWindowResized() }
            .store(in: &cancellables)
            
        // Show window on top of everything
        window.makeKeyAndOrderFront(nil)
        
        // Snap if not custom
        if currentPosition != .custom {
            snapToPosition(currentPosition)
        }
    }
    
    public func snapToPosition(_ position: WindowPosition) {
        guard let window = mainWindow, let screen = NSScreen.main else { return }
        
        self.currentPosition = position
        UserDefaults.standard.set(position.rawValue, forKey: positionKey)
        
        if position == .custom {
            return
        }
        
        let visibleFrame = screen.visibleFrame
        let windowSize = window.frame.size
        let margin: CGFloat = 16.0
        
        var newOrigin = NSPoint.zero
        
        switch position {
        case .topLeft:
            newOrigin.x = visibleFrame.minX + margin
            newOrigin.y = visibleFrame.maxY - windowSize.height - margin
        case .topRight:
            newOrigin.x = visibleFrame.maxX - windowSize.width - margin
            newOrigin.y = visibleFrame.maxY - windowSize.height - margin
        case .bottomLeft:
            newOrigin.x = visibleFrame.minX + margin
            newOrigin.y = visibleFrame.minY + margin
        case .bottomRight:
            newOrigin.x = visibleFrame.maxX - windowSize.width - margin
            newOrigin.y = visibleFrame.minY + margin
        case .custom:
            return
        }
        
        Logger.window.info("Snapping window to position: \(position.rawValue) at origin: \(newOrigin.x), \(newOrigin.y)")
        window.setFrameOrigin(newOrigin)
    }
    
    private func getInitialFrame(for size: NSSize) -> NSRect {
        if let savedFrameString = UserDefaults.standard.string(forKey: frameKey) {
            let rect = NSRectFromString(savedFrameString)
            // Ensure rect is visible on screen
            if isFrameOnScreen(rect) {
                return rect
            }
        }
        
        // Default to Top Right on Main Screen
        guard let screen = NSScreen.main else {
            return NSRect(x: 100, y: 100, width: size.width, height: size.height)
        }
        
        let visibleFrame = screen.visibleFrame
        let margin: CGFloat = 16.0
        let x = visibleFrame.maxX - size.width - margin
        let y = visibleFrame.maxY - size.height - margin
        return NSRect(x: x, y: y, width: size.width, height: size.height)
    }
    
    private func isFrameOnScreen(_ rect: NSRect) -> Bool {
        for screen in NSScreen.screens {
            if screen.frame.intersects(rect) {
                return true
            }
        }
        return false
    }
    
    private func handleWindowMoved() {
        guard let window = mainWindow else { return }
        
        // If window movement is not triggered by snap, set to custom
        if let screen = window.screen {
            let visibleFrame = screen.visibleFrame
            let size = window.frame.size
            let origin = window.frame.origin
            let margin: CGFloat = 16.0
            
            let isTopLeft = abs(origin.x - (visibleFrame.minX + margin)) < 5 && abs(origin.y - (visibleFrame.maxY - size.height - margin)) < 5
            let isTopRight = abs(origin.x - (visibleFrame.maxX - size.width - margin)) < 5 && abs(origin.y - (visibleFrame.maxY - size.height - margin)) < 5
            let isBottomLeft = abs(origin.x - (visibleFrame.minX + margin)) < 5 && abs(origin.y - (visibleFrame.minY + margin)) < 5
            let isBottomRight = abs(origin.x - (visibleFrame.maxX - size.width - margin)) < 5 && abs(origin.y - (visibleFrame.minY + margin)) < 5
            
            var newPos = WindowPosition.custom
            if isTopLeft { newPos = .topLeft }
            else if isTopRight { newPos = .topRight }
            else if isBottomLeft { newPos = .bottomLeft }
            else if isBottomRight { newPos = .bottomRight }
            
            if newPos != currentPosition {
                DispatchQueue.main.async {
                    self.currentPosition = newPos
                    UserDefaults.standard.set(newPos.rawValue, forKey: self.positionKey)
                }
            }
        }
        
        UserDefaults.standard.set(NSStringFromRect(window.frame), forKey: frameKey)
    }
    
    private func handleWindowResized() {
        guard let window = mainWindow else { return }
        UserDefaults.standard.set(NSStringFromRect(window.frame), forKey: frameKey)
    }
}

// MARK: - Custom NSWindow subclass for minimal floating display

public final class YogiTimerWindow: NSWindow {
    
    public override init(contentRect: NSRect, styleMask style: NSWindow.StyleMask, backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool) {
        super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)
        
        self.title = "Yogi Timer"
        self.backgroundColor = .black
        self.isOpaque = true
        self.hasShadow = true
        self.isMovableByWindowBackground = true // Crucial for borderless dragging
        
        // Window level keeps it always on top
        self.level = .floating
        
        // Collection behaviors: show on all spaces, show over fullscreen windows
        self.collectionBehavior = [
            .canJoinAllSpaces,
            .fullScreenAuxiliary,
            .ignoresCycle
        ]
        
        // Style parameters
        self.isReleasedWhenClosed = false
        self.hidesOnDeactivate = false
    }
    
    // Enable keyboard focus on the borderless window so shortcuts work
    public override var canBecomeKey: Bool {
        return true
    }
    
    public override var canBecomeMain: Bool {
        return true
    }
}
