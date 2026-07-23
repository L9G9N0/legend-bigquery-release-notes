import Foundation
import Combine

public struct YogiTask: Identifiable, Codable {
    public let id: UUID
    public var title: String
    public var note: String
    public var deadline: Date?
    public var isCompleted: Bool
    
    public init(id: UUID = UUID(), title: String, note: String = "", deadline: Date? = nil, isCompleted: Bool = false) {
        self.id = id
        self.title = title
        self.note = note
        self.deadline = deadline
        self.isCompleted = isCompleted
    }
}

public final class TaskManager: ObservableObject {
    @Published public var tasks: [YogiTask] = []
    @Published public var showTasksTray: Bool = false {
        didSet {
            UserDefaults.standard.set(showTasksTray, forKey: "yogi.tasks.showTray")
            adjustWindowSize()
        }
    }
    
    private let fileURL: URL
    private var windowManager: WindowManager?
    
    public init() {
        // Resolve tasks file path inside Application Support
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        let yogiFolder = appSupport.appendingPathComponent("YogiTimer", isDirectory: true)
        
        // Create folder if missing
        try? FileManager.default.createDirectory(at: yogiFolder, withIntermediateDirectories: true, attributes: nil)
        
        self.fileURL = yogiFolder.appendingPathComponent("tasks.json")
        self.showTasksTray = UserDefaults.standard.bool(forKey: "yogi.tasks.showTray")
        
        loadTasks()
    }
    
    public func setWindowManager(_ wm: WindowManager) {
        self.windowManager = wm
    }
    
    // MARK: - Task CRUD
    
    public func addTask(title: String, note: String = "", deadline: Date? = nil) {
        guard !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        let task = YogiTask(title: title, note: note, deadline: deadline)
        tasks.append(task)
        Logger.tasks.info("Task added: \(title)")
        saveTasks()
    }
    
    public func toggleTaskCompletion(id: UUID) {
        if let index = tasks.firstIndex(where: { $0.id == id }) {
            tasks[index].isCompleted.toggle()
            Logger.tasks.info("Task completion toggled for: \(self.tasks[index].title) -> \(self.tasks[index].isCompleted)")
            saveTasks()
        }
    }
    
    public func deleteTask(id: UUID) {
        tasks.removeAll(where: { $0.id == id })
        Logger.tasks.info("Task deleted: \(id)")
        saveTasks()
    }
    
    // MARK: - Persistence
    
    private func saveTasks() {
        do {
            let data = try JSONEncoder().encode(tasks)
            try data.write(to: fileURL)
        } catch {
            Logger.tasks.error("Failed to save tasks: \(error.localizedDescription)")
        }
    }
    
    private func loadTasks() {
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return }
        do {
            let data = try Data(contentsOf: fileURL)
            self.tasks = try JSONDecoder().decode([YogiTask].self, from: data)
        } catch {
            Logger.tasks.error("Failed to load tasks: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Window Layout Adjustment
    
    public func adjustWindowSize() {
        guard let window = windowManager?.mainWindow else { return }
        
        let currentFrame = window.frame
        var targetSize = NSSize(width: 180, height: 75) // Minimum compact size
        
        if showTasksTray {
            // Expand window height to accommodate tasks
            targetSize = NSSize(width: 280, height: 320)
        }
        
        var targetFrame = currentFrame
        // Maintain upper edge when resizing, expand downwards
        targetFrame.origin.y = currentFrame.maxY - targetSize.height
        targetFrame.size = targetSize
        
        Logger.window.info("Adjusting window size. Tray active: \(self.showTasksTray). Frame: \(targetFrame.size.width)x\(targetFrame.size.height)")
        
        DispatchQueue.main.async {
            window.setFrame(targetFrame, display: true, animate: true)
        }
    }
}
