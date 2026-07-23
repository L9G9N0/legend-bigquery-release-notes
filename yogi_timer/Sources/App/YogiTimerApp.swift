import AppKit
import SwiftUI

@main
public final class AppDelegate: NSObject, NSApplicationDelegate {
    private var windowManager: WindowManager!
    private var timerManager: TimerManager!
    private var taskManager: TaskManager!
    private var focusManager: FocusManager!
    private var reminderManager: ReminderManager!
    
    public func applicationDidFinishLaunching(_ notification: Notification) {
        // Initialize Core Engine managers
        timerManager = TimerManager()
        windowManager = WindowManager()
        taskManager = TaskManager()
        focusManager = FocusManager()
        reminderManager = ReminderManager()
        
        // Dependency Injection
        taskManager.setWindowManager(windowManager)
        focusManager.setWindowManager(windowManager)
        
        // Build the primary SwiftUI layout
        let timerView = TimerView(
            timerManager: timerManager,
            windowManager: windowManager,
            taskManager: taskManager,
            focusManager: focusManager,
            reminderManager: reminderManager
        )
        
        // Create the borderless utility panel
        windowManager.setupMainWindow(content: timerView)
        
        // Synchronize initial UI size
        taskManager.adjustWindowSize()
        
        Logger.app.info("Yogi Timer initialized successfully.")
    }
    
    public func applicationWillTerminate(_ notification: Notification) {
        // Ensure Focus Mode is cleaned up on quit
        focusManager.deactivateFocusMode()
        Logger.app.info("Yogi Timer terminating.")
    }
}
