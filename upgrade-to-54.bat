@echo off
echo ========================================
echo Upgrading to Expo SDK 54
echo ========================================
echo.

echo Step 1: Cleaning old files...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo Step 2: Creating updated package.json...
(
echo {
echo   "name": "canada-mortgage-calc",
echo   "version": "1.0.0",
echo   "main": "expo/AppEntry.js",
echo   "scripts": {
echo     "start": "expo start",
echo     "android": "expo start --android",
echo     "ios": "expo start --ios",
echo     "web": "expo start --web"
echo   },
echo   "dependencies": {
echo     "expo": "~54.0.33",
echo     "expo-status-bar": "~2.0.1",
echo     "react": "19.1.0",
echo     "react-native": "0.81.5",
echo     "@react-navigation/native": "^7.1.8",
echo     "@react-navigation/stack": "^7.3.8",
echo     "react-native-gesture-handler": "~2.28.0",
echo     "react-native-safe-area-context": "~5.6.0",
echo     "react-native-screens": "~4.16.0"
echo   },
echo   "devDependencies": {
echo     "@babel/core": "^7.20.0"
echo   },
echo   "private": true
echo }
) > package.json

echo Step 3: Installing dependencies...
call npm install

echo Step 4: Clearing Metro cache...
call npx expo start -c

echo.
echo ========================================
echo Upgrade Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure your phone has Expo Go v54
echo 2. Run: npm start
echo 3. Scan QR code with Expo Go app
echo.
pause