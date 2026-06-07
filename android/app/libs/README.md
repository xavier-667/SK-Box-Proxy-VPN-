# Sing-box Library Folder

Place your compiled `.aar` core files (e.g. `libbox.aar`) in this directory before building in Android Studio. 

Ensure you download all ABI architectures as required (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`) up properly configured within the native library. The `build.gradle` file in this app module uses a `fileTree` inclusion out-of-the-box which will automatically locate any `.aar` file you place in this `libs/` folder.

Example:
`/android/app/libs/sing-box-client.aar`
