import Foundation
import UserNotifications
import AppKit
import SwiftUI

public enum AccentColor: String, CaseIterable, Codable {
    case white = "White"
    case amber = "Amber"
    case gold = "Gold"
    case crimson = "Crimson"
    case mint = "Mint"
    
    public var color: Color {
        switch self {
        case .white: return .white
        case .amber: return Color(red: 0.95, green: 0.60, blue: 0.10)
        case .gold: return Color(red: 0.85, green: 0.70, blue: 0.30)
        case .crimson: return Color(red: 0.85, green: 0.15, blue: 0.15)
        case .mint: return Color(red: 0.40, green: 0.85, blue: 0.60)
        }
    }
}

public final class ReminderManager: NSObject, ObservableObject {
    @Published public var hasNotificationPermission: Bool = false
    @Published public var selectedAccentColor: AccentColor = .white {
        didSet {
            UserDefaults.standard.set(selectedAccentColor.rawValue, forKey: "yogi.reminder.accentColor")
        }
    }
    @Published public var playSoundOnFinish: Bool = true {
        didSet {
            UserDefaults.standard.set(playSoundOnFinish, forKey: "yogi.reminder.playSound")
        }
    }
    @Published public var fullscreenWarningOnFinish: Bool = true {
        didSet {
            UserDefaults.standard.set(fullscreenWarningOnFinish, forKey: "yogi.reminder.fullscreenWarning")
        }
    }
    
    // Shows alert dialog within app
    @Published public var showLocalAlert: Bool = false
    
    private var flashWindow: NSWindow?
    
    public override init() {
        super.init()
        
        // Load configurations
        if let savedColorString = UserDefaults.standard.string(forKey: "yogi.reminder.accentColor"),
           let savedColor = AccentColor(rawValue: savedColorString) {
            self.selectedAccentColor = savedColor
        }
        
        if UserDefaults.standard.object(forKey: "yogi.reminder.playSound") != nil {
            self.playSoundOnFinish = UserDefaults.standard.bool(forKey: "yogi.reminder.playSound")
        }
        if UserDefaults.standard.object(forKey: "yogi.reminder.fullscreenWarning") != nil {
            self.fullscreenWarningOnFinish = UserDefaults.standard.bool(forKey: "yogi.reminder.fullscreenWarning")
        }
        
        checkNotificationPermission()
    }
    
    public func checkNotificationPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.hasNotificationPermission = (settings.authorizationStatus == .authorized)
            }
        }
    }
    
    public func requestNotificationPermission() {
        Logger.reminders.info("Requesting Notification permission")
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { granted, error in
            DispatchQueue.main.async {
                self.hasNotificationPermission = granted
                if let error = error {
                    Logger.reminders.error("Notification authorization request failed: \(error.localizedDescription)")
                } else {
                    Logger.reminders.info("Notification permission granted: \(granted)")
                }
            }
        }
    }
    
    public func triggerReminder() {
        Logger.reminders.info("Triggering completion reminders")
        
        // 1. Play native sound
        if playSoundOnFinish {
            // NSSound plays standard system alerts
            if let sound = NSSound(named: "Glass") {
                sound.play()
            }
        }
        
        // 2. Deliver Local Notification
        deliverNotification()
        
        // 3. Optional fullscreen warning flash
        if fullscreenWarningOnFinish {
            triggerFullscreenFlash()
        }
        
        // 4. Trigger in-app local state
        DispatchQueue.main.async {
            self.showLocalAlert = true
        }
    }
    
    private func deliverNotification() {
        let content = UNMutableNotificationContent()
        content.title = "Time is Finite"
        content.body = "Your focus session is complete. Return to present awareness."
        content.sound = UNNotificationSound.default
        
        let request = UNNotificationRequest(
            identifier: "yogi.timer.finished.\(UUID().uuidString)",
            content: content,
            trigger: nil // Deliver immediately
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                Logger.reminders.error("Failed to post user notification: \(error.localizedDescription)")
            }
        }
    }
    
    private func triggerFullscreenFlash() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            // If already flashing, skip
            guard self.flashWindow == nil else { return }
            
            // Setup flashing windows on all screens
            var flashWindows: [NSWindow] = []
            for screen in NSScreen.screens {
                let window = NSWindow(
                    contentRect: screen.frame,
                    styleMask: [.borderless],
                    backing: .buffered,
                    defer: false
                )
                window.backgroundColor = NSColor(self.selectedAccentColor.color).withAlphaComponent(0.4)
                window.isOpaque = false
                window.hasShadow = false
                window.ignoresMouseEvents = true // Pass through clicks
                window.level = .screenSaver
                window.orderFrontRegardless()
                
                flashWindows.append(window)
            }
            
            // Fade out and close after 1.5 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                for window in flashWindows {
                    NSAnimationContext.runAnimationGroup({ context in
                        context.duration = 0.5
                        window.animator().alphaValue = 0.0
                    }, completionHandler: {
                        window.close()
                    })
                }
            }
        }
    }
}
