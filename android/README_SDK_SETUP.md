# Android SDK Setup Instructions

## Problem
If you're seeing the error: "SDK location not found", you need to configure the Android SDK path.

## Solution Options

### Option 1: Install Android Studio (Recommended)
1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, it will install the Android SDK
3. After installation, find your SDK path:
   - Open Android Studio
   - Go to: **File > Settings** (or **Android Studio > Preferences** on Mac)
   - Navigate to: **Appearance & Behavior > System Settings > Android SDK**
   - Copy the "Android SDK Location" path
4. Update `local.properties` file in `TROT/android/` with your SDK path:
   ```
   sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
   ```
   (Use double backslashes `\\` in the path)

### Option 2: Set ANDROID_HOME Environment Variable
1. Find your Android SDK location (usually installed with Android Studio)
2. Set the `ANDROID_HOME` environment variable:
   - **Windows**: 
     - Open System Properties > Environment Variables
     - Add new System Variable: `ANDROID_HOME` = `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - **Mac/Linux**: Add to `~/.bashrc` or `~/.zshrc`:
     ```bash
     export ANDROID_HOME=$HOME/Library/Android/sdk
     export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
     ```
3. Restart your terminal/IDE

### Option 3: Manual SDK Installation
If you prefer not to install Android Studio:
1. Download the [Android SDK Command Line Tools](https://developer.android.com/studio#command-tools)
2. Extract to a location like `C:\Android\Sdk`
3. Update `local.properties`:
   ```
   sdk.dir=C:\\Android\\Sdk
   ```

## Verify Setup
After setting up, try building the project:
```bash
cd TROT/android
./gradlew build
```

## Common SDK Locations
- **Windows**: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
- **Mac**: `~/Library/Android/sdk`
- **Linux**: `~/Android/Sdk`

## Note
The `local.properties` file is git-ignored, so each developer needs to set it up on their machine.

