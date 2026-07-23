import SwiftUI

struct TaskView: View {
    @ObservedObject var taskManager: TaskManager
    @State private var newTaskTitle: String = ""
    @State private var hoverTaskId: UUID? = nil
    
    var body: some View {
        VStack(spacing: 8) {
            Divider()
                .background(Color.white.opacity(0.2))
            
            // Header
            HStack {
                Text("Tasks")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white.opacity(0.7))
                Spacer()
                Button(action: {
                    taskManager.showTasksTray = false
                }) {
                    Image(systemName: "chevron.up")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white.opacity(0.5))
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(.horizontal, 4)
            
            // Tasks Scroll View
            ScrollView {
                VStack(alignment: .leading, spacing: 6) {
                    if taskManager.tasks.isEmpty {
                        Text("No tasks active.")
                            .font(.system(size: 10).italic())
                            .foregroundColor(.white.opacity(0.3))
                            .padding(.top, 10)
                            .frame(maxWidth: .infinity, alignment: .center)
                    } else {
                        ForEach(taskManager.tasks) { task in
                            HStack(alignment: .top, spacing: 6) {
                                Button(action: {
                                    taskManager.toggleTaskCompletion(id: task.id)
                                }) {
                                    Image(systemName: task.isCompleted ? "checkmark.square" : "square")
                                        .font(.system(size: 11))
                                        .foregroundColor(task.isCompleted ? .white : .white.opacity(0.6))
                                }
                                .buttonStyle(PlainButtonStyle())
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(task.title)
                                        .font(.system(size: 11, design: .default))
                                        .foregroundColor(task.isCompleted ? .white.opacity(0.4) : .white)
                                        .strikethrough(task.isCompleted, color: .white.opacity(0.4))
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                                
                                Spacer()
                                
                                if hoverTaskId == task.id {
                                    Button(action: {
                                        taskManager.deleteTask(id: task.id)
                                    }) {
                                        Image(systemName: "trash")
                                            .font(.system(size: 10))
                                            .foregroundColor(.red.opacity(0.8))
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding(.vertical, 2)
                            .padding(.horizontal, 4)
                            .background(Color.white.opacity(hoverTaskId == task.id ? 0.05 : 0))
                            .cornerRadius(3)
                            .onHover { isHovering in
                                if isHovering {
                                    hoverTaskId = task.id
                                } else if hoverTaskId == task.id {
                                    hoverTaskId = nil
                                }
                            }
                        }
                    }
                }
            }
            .frame(maxHeight: .infinity)
            
            // Add Task input
            HStack(spacing: 4) {
                TextField("Add task...", text: $newTaskTitle, onCommit: {
                    taskManager.addTask(title: newTaskTitle)
                    newTaskTitle = ""
                })
                .textFieldStyle(PlainTextFieldStyle())
                .font(.system(size: 11))
                .foregroundColor(.white)
                .padding(.horizontal, 6)
                .padding(.vertical, 4)
                .background(Color.white.opacity(0.1))
                .cornerRadius(4)
                
                Button(action: {
                    taskManager.addTask(title: newTaskTitle)
                    newTaskTitle = ""
                }) {
                    Image(systemName: "plus")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.black)
                        .frame(width: 18, height: 18)
                        .background(Color.white)
                        .cornerRadius(4)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(.top, 4)
        }
        .padding(.horizontal, 8)
        .padding(.bottom, 8)
    }
}
