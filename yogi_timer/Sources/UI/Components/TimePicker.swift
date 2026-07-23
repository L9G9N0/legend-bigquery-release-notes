import SwiftUI

struct TimePicker: View {
    @Binding var isPresented: Bool
    let onSelect: (TimeInterval) -> Void
    
    @State private var minutes: Int = 25
    
    private let presets: [Int] = [15, 25, 50, 90]
    
    var body: some View {
        VStack(spacing: 8) {
            // Minutes adjuster
            HStack(spacing: 12) {
                Button(action: { if minutes > 1 { minutes -= 1 } }) {
                    Image(systemName: "minus")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                }
                .buttonStyle(PlainButtonStyle())
                .frame(width: 20, height: 20)
                .background(Color.white.opacity(0.1))
                .cornerRadius(4)
                
                Text("\(minutes) min")
                    .font(.system(size: 14, design: .monospaced))
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                    .frame(width: 60)
                
                Button(action: { if minutes < 999 { minutes += 1 } }) {
                    Image(systemName: "plus")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                }
                .buttonStyle(PlainButtonStyle())
                .frame(width: 20, height: 20)
                .background(Color.white.opacity(0.1))
                .cornerRadius(4)
            }
            .padding(.top, 4)
            
            // Presets
            HStack(spacing: 6) {
                ForEach(presets, id: \.self) { preset in
                    Button(action: {
                        self.minutes = preset
                    }) {
                        Text("\(preset)")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundColor(minutes == preset ? .black : .white)
                            .frame(width: 24, height: 16)
                            .background(minutes == preset ? Color.white : Color.white.opacity(0.1))
                            .cornerRadius(3)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            
            // Action buttons
            HStack(spacing: 10) {
                Button(action: {
                    isPresented = false
                }) {
                    Text("Cancel")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
                .buttonStyle(PlainButtonStyle())
                
                Button(action: {
                    onSelect(TimeInterval(minutes * 60))
                    isPresented = false
                }) {
                    Text("Set")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.black)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 3)
                        .background(Color.white)
                        .cornerRadius(3)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(.top, 2)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black)
    }
}
