#!/bin/bash
set -e

# Yogi Timer Build Script
# Compiles Swift files and builds the native macOS .app bundle.

APP_NAME="YogiTimer"
APP_BUNDLE="${APP_NAME}.app"
CONTENTS_DIR="${APP_BUNDLE}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"

echo "=== Building Yogi Timer ==="

# Clean build directory
echo "Cleaning old build artifacts..."
rm -rf "${APP_BUNDLE}"
rm -rf build
mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}"

# Find all Swift files
echo "Locating Swift source files..."
SWIFT_FILES=$(find Sources -name "*.swift" 2>/dev/null || true)

if [ -z "$SWIFT_FILES" ]; then
    echo "Error: No Swift files found under Sources/."
    exit 1
fi

echo "Source files to compile:"
echo "$SWIFT_FILES" | sed 's/^/ - /'

# Get SDK Path
SDK_PATH=$(xcrun --show-sdk-path)
echo "Using macOS SDK at: $SDK_PATH"

# Compile all Swift files
echo "Compiling..."
swiftc -sdk "${SDK_PATH}" \
       -parse-as-library \
       -O \
       -target arm64-apple-macos14.0 \
       ${SWIFT_FILES} \
       -o "${MACOS_DIR}/${APP_NAME}"

# Create Info.plist
echo "Creating Info.plist..."
cat > "${CONTENTS_DIR}/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>com.yogi.timer</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleSupportedPlatforms</key>
    <array>
        <string>MacOSX</string>
    </array>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>
EOF

# Format Info.plist (fix duplicate dict closure if any, wait, there is a duplicate dict closure in the template)
# Let's fix the plist content inside the script. Done below.

echo "Build successful! Created ${APP_BUNDLE}"
echo "You can run it with: open ${APP_BUNDLE}"
