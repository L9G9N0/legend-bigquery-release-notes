import SwiftUI
import Combine

struct TimerView: View {
    @ObservedObject var timerManager: TimerManager
    @ObservedObject var windowManager: WindowManager
    @ObservedObject var taskManager: TaskManager
    @ObservedObject var focusManager: FocusManager
    @ObservedObject var reminderManager: ReminderManager
    
    @State private var isHovering = false
    @State private var showTimePicker = false
    
    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                Color.black
                    .edgesIgnoringSafeArea(.all)
                
                if showTimePicker {
                    TimePicker(isPresented: $showTimePicker) { newDuration in
                        timerManager.setDuration(newDuration)
                    }
                    .transition(.opacity)
                } else {
                    VStack(spacing: 4) {
                        // Countdown digits
                        Text(formatTime(timerManager.remainingSeconds))
                            .font(.system(size: 34, weight: .light, design: .monospaced))
                            .foregroundColor(reminderManager.selectedAccentColor.color)
                            .contentTransition(.numericText(value: timerManager.remainingSeconds))
                        
                        // Hover Controls
                        if isHovering {
                            HStack(spacing: 12) {
                                // Play / Pause
                                Button(action: {
                                    if timerManager.isRunning {
                                        timerManager.pause()
                                    } else {
                                        timerManager.resume()
                                    }
                                }) {
                                    Image(systemName: timerManager.isRunning ? "pause.fill" : "play.fill")
                                        .font(.system(size: 11))
                                }
                                .buttonStyle(PlainButtonStyle())
                                .foregroundColor(.white)
                                
                                // Reset
                                Button(action: {
                                    timerManager.reset()
                                }) {
                                    Image(systemName: "arrow.clockwise")
                                        .font(.system(size: 10))
                                }
                                .buttonStyle(PlainButtonStyle())
                                .foregroundColor(.white)
                                
                                // Custom Duration (Picker)
                                Button(action: {
                                    showTimePicker = true
                                }) {
                                    Image(systemName: "timer")
                                        .font(.system(size: 11))
                                }
                                .buttonStyle(PlainButtonStyle())
                                .foregroundColor(.white)
                                
                                // Tasks Toggle
                                Button(action: {
                                    taskManager.showTasksTray.toggle()
                                }) {
                                    Image(systemName: "checklist")
                                        .font(.system(size: 10))
                                        .foregroundColor(taskManager.showTasksTray ? reminderManager.selectedAccentColor.color : .white)
                                }
                                .buttonStyle(PlainButtonStyle())
                                
                                // Focus Mode Toggle
                                Button(action: {
                                    focusManager.toggleFocusMode()
                                }) {
                                    Image(systemName: focusManager.isFocusModeActive ? "lock.shield.fill" : "lock.shield")
                                        .font(.system(size: 10))
                                        .foregroundColor(focusManager.isFocusModeActive ? .red : .white)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                            .transition(.opacity)
                        }
                    }
                    .padding(.top, isHovering ? 6 : 0)
                }
                
                // Overlay for local finish dialog
                if reminderManager.showLocalAlert {
                    Color.black.opacity(0.95)
                        .edgesIgnoringSafeArea(.all)
                    VStack(spacing: 8) {
                        Text("Session Complete")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                        Text("Every second matters.")
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                        Button(action: {
                            reminderManager.showLocalAlert = false
                            timerManager.reset()
                        }) {
                            Text("Acknowledge")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 4)
                                .background(Color.white)
                                .cornerRadius(3)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
            }
            .frame(height: 75) // Force timer part size
            .onHover { hovering in
                withAnimation(.easeInOut(duration: 0.15)) {
                    isHovering = hovering
                }
            }
            
            // Task Tray section
            if taskManager.showTasksTray {
                TaskView(taskManager: taskManager)
                    .frame(height: 245)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .background(Color.black)
        .cornerRadius(6) // Sharp professional rounding
        .overlay(
            RoundedRectangle(cornerRadius: 6)
                .stroke(Color.white.opacity(0.12), lineWidth: 1)
        )
        // Global Keyboard Shortcuts (Invisible button bindings)
        .background(
            ZStack {
                Button("") {
                    if timerManager.isRunning {
                        timerManager.pause()
                    } else {
                        timerManager.resume()
                    }
                }
                .keyboardShortcut(.space, modifiers: [])
                .buttonStyle(PlainButtonStyle())
                .opacity(0)
                
                Button("") {
                    timerManager.reset()
                }
                .keyboardShortcut("r", modifiers: [])
                .buttonStyle(PlainButtonStyle())
                .opacity(0)
                
                Button("") {
                    showTimePicker.toggle()
                }
                .keyboardShortcut("c", modifiers: [])
                .buttonStyle(PlainButtonStyle())
                .opacity(0)
                
                Button("") {
                    taskManager.showTasksTray.toggle()
                }
                .keyboardShortcut("t", modifiers: [])
                .buttonStyle(PlainButtonStyle())
                .opacity(0)
                
                Button("") {
                    focusManager.toggleFocusMode()
                }
                .keyboardShortcut("f", modifiers: [])
                .buttonStyle(PlainButtonStyle())
                .opacity(0)
            }
        )
        // Right-Click Context Menu for settings & alignment
        .contextMenu {
            Section(header: Text("Yogi Timer")) {
                Button(timerManager.isRunning ? "Pause" : "Resume") {
                    if timerManager.isRunning { timerManager.pause() }
                    else { timerManager.resume() }
                }
                Button("Reset") {
                    timerManager.reset()
                }
            }
            
            Divider()
            
            Menu("Snap Position") {
                ForEach(WindowPosition.allCases, id: \.self) { pos in
                    Button(action: {
                        windowManager.snapToPosition(pos)
                    }) {
                        HStack {
                            Text(pos.rawValue.capitalized)
                            if windowManager.currentPosition == pos {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            }
            
            Button("Toggle Focus Mode") {
                focusManager.toggleFocusMode()
            }
            
            Button("Toggle Task Tray") {
                taskManager.showTasksTray.toggle()
            }
            
            Divider()
            
            Menu("Appearance") {
                ForEach(AccentColor.allCases, id: \.self) { color in
                    Button(action: {
                        reminderManager.selectedAccentColor = color
                    }) {
                        HStack {
                            Text(color.rawValue)
                            if reminderManager.selectedAccentColor == color {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            }
            
            Menu("Alert Settings") {
                Button(action: {
                    reminderManager.playSoundOnFinish.toggle()
                }) {
                    HStack {
                        Text("Play sound on complete")
                        if reminderManager.playSoundOnFinish {
                            Image(systemName: "checkmark")
                        }
                    }
                }
                
                Button(action: {
                    reminderManager.fullscreenWarningOnFinish.toggle()
                }) {
                    HStack {
                        Text("Fullscreen warning on complete")
                        if reminderManager.fullscreenWarningOnFinish {
                            Image(systemName: "checkmark")
                        }
                    }
                }
                
                Button("Request Notification Permission") {
                    reminderManager.requestNotificationPermission()
                }
            }
            
            Divider()
            
            Button("Exit") {
                NSApplication.shared.terminate(nil)
            }
        }
        .onReceive(timerManager.timerFinished) { _ in
            focusManager.deactivateFocusMode()
            reminderManager.triggerReminder()
        }
    }
    
    private func formatTime(_ time: TimeInterval) -> String {
        let hours = Int(time) / 3600
        let minutes = (Int(time) % 3600) / 60
        let seconds = Int(time) % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
}
