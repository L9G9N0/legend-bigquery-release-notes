import Foundation
import OSLog

public struct Logger {
    private static let subsystem = "com.yogi.timer"
    
    public static let app = os.Logger(subsystem: subsystem, category: "App")
    public static let timer = os.Logger(subsystem: subsystem, category: "Timer")
    public static let window = os.Logger(subsystem: subsystem, category: "Window")
    public static let focus = os.Logger(subsystem: subsystem, category: "Focus")
    public static let tasks = os.Logger(subsystem: subsystem, category: "Tasks")
    public static let reminders = os.Logger(subsystem: subsystem, category: "Reminders")
}
