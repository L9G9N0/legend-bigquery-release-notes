import Foundation
import Combine

public final class TimerManager: ObservableObject {
    // Keys for persistence
    private enum Keys {
        static let timerRunning = "yogi.timer.running"
        static let targetEndTimestamp = "yogi.timer.targetEnd"
        static let pausedRemainingSeconds = "yogi.timer.remaining"
        static let initialDuration = "yogi.timer.initialDuration"
    }
    
    // Published states for UI binding
    @Published public var remainingSeconds: TimeInterval = 1500 // Default 25 min (Pomodoro)
    @Published public var isRunning: Bool = false
    @Published public var initialDuration: TimeInterval = 1500
    
    // Timer completion publisher
    public let timerFinished = PassthroughSubject<Void, Never>()
    
    private var dispatchTimer: DispatchSourceTimer?
    private let queue = DispatchQueue(label: "com.yogi.timer.queue", qos: .userInteractive)
    
    public init() {
        loadState()
    }
    
    deinit {
        stopTimerSource()
    }
    
    // MARK: - Core Operations
    
    public func start(duration: TimeInterval) {
        Logger.timer.info("Starting timer with duration: \(duration) seconds")
        self.initialDuration = duration
        self.remainingSeconds = duration
        self.isRunning = true
        
        let targetEnd = Date().addingTimeInterval(duration)
        saveState(running: true, targetEnd: targetEnd, remaining: duration, initial: duration)
        
        startTimerSource()
    }
    
    public func pause() {
        guard isRunning else { return }
        Logger.timer.info("Pausing timer")
        
        stopTimerSource()
        self.isRunning = false
        
        // Calculate remaining seconds exactly at the moment of pause
        if let targetEnd = UserDefaults.standard.object(forKey: Keys.targetEndTimestamp) as? Date {
            let remaining = max(0, targetEnd.timeIntervalSince(Date()))
            self.remainingSeconds = remaining
            saveState(running: false, targetEnd: nil, remaining: remaining, initial: initialDuration)
        } else {
            saveState(running: false, targetEnd: nil, remaining: remainingSeconds, initial: initialDuration)
        }
    }
    
    public func resume() {
        guard !isRunning && remainingSeconds > 0 else { return }
        Logger.timer.info("Resuming timer from \(self.remainingSeconds) seconds")
        self.isRunning = true
        
        let targetEnd = Date().addingTimeInterval(remainingSeconds)
        saveState(running: true, targetEnd: targetEnd, remaining: remainingSeconds, initial: initialDuration)
        
        startTimerSource()
    }
    
    public func reset() {
        Logger.timer.info("Resetting timer to initial duration: \(self.initialDuration)")
        stopTimerSource()
        self.isRunning = false
        self.remainingSeconds = initialDuration
        
        saveState(running: false, targetEnd: nil, remaining: initialDuration, initial: initialDuration)
    }
    
    public func setDuration(_ duration: TimeInterval) {
        Logger.timer.info("Setting custom duration: \(duration)")
        stopTimerSource()
        self.isRunning = false
        self.initialDuration = duration
        self.remainingSeconds = duration
        
        saveState(running: false, targetEnd: nil, remaining: duration, initial: duration)
    }
    
    // MARK: - Persistence Helpers
    
    private func saveState(running: Bool, targetEnd: Date?, remaining: TimeInterval, initial: TimeInterval) {
        let defaults = UserDefaults.standard
        defaults.set(running, forKey: Keys.timerRunning)
        defaults.set(targetEnd, forKey: Keys.targetEndTimestamp)
        defaults.set(remaining, forKey: Keys.pausedRemainingSeconds)
        defaults.set(initial, forKey: Keys.initialDuration)
        defaults.synchronize()
    }
    
    private func loadState() {
        let defaults = UserDefaults.standard
        let running = defaults.bool(forKey: Keys.timerRunning)
        let initial = defaults.double(forKey: Keys.initialDuration)
        
        self.initialDuration = initial > 0 ? initial : 1500
        
        if running, let targetEnd = defaults.object(forKey: Keys.targetEndTimestamp) as? Date {
            let now = Date()
            if targetEnd > now {
                self.remainingSeconds = targetEnd.timeIntervalSince(now)
                self.isRunning = true
                startTimerSource()
            } else {
                // Completed while closed
                self.remainingSeconds = 0
                self.isRunning = false
                saveState(running: false, targetEnd: nil, remaining: 0, initial: self.initialDuration)
                DispatchQueue.main.async {
                    self.timerFinished.send()
                }
            }
        } else {
            let remaining = defaults.double(forKey: Keys.pausedRemainingSeconds)
            self.remainingSeconds = remaining > 0 ? remaining : self.initialDuration
            self.isRunning = false
        }
    }
    
    // MARK: - Precision Dispatch Timer Source
    
    private func startTimerSource() {
        stopTimerSource()
        
        let timer = DispatchSource.makeTimerSource(queue: queue)
        timer.schedule(deadline: .now(), repeating: 0.1, leeway: .milliseconds(10)) // High frequency (0.1s) for responsive display
        
        timer.setEventHandler { [weak self] in
            guard let self = self else { return }
            
            // Re-read target end timestamp
            if let targetEnd = UserDefaults.standard.object(forKey: Keys.targetEndTimestamp) as? Date {
                let now = Date()
                let remaining = targetEnd.timeIntervalSince(now)
                
                DispatchQueue.main.async {
                    if remaining <= 0 {
                        self.stopTimerSource()
                        self.remainingSeconds = 0
                        self.isRunning = false
                        self.saveState(running: false, targetEnd: nil, remaining: 0, initial: self.initialDuration)
                        self.timerFinished.send()
                    } else {
                        self.remainingSeconds = remaining
                    }
                }
            } else {
                // Fallback in case state got corrupted
                DispatchQueue.main.async {
                    self.stopTimerSource()
                    self.isRunning = false
                }
            }
        }
        
        self.dispatchTimer = timer
        timer.activate()
    }
    
    private func stopTimerSource() {
        dispatchTimer?.cancel()
        dispatchTimer = nil
    }
}
