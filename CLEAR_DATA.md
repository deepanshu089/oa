# How to Clear Stored Data / Start Over

## Option 1: Browser DevTools (Recommended)

1. Open the app in your browser
2. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac) to open DevTools
3. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click on **Local Storage** in the left sidebar
5. Select your domain (`http://localhost:3000`)
6. Right-click and select **Clear** or click the **Clear All** button
7. Refresh the page

## Option 2: Console Command

1. Open browser DevTools (`F12`)
2. Go to the **Console** tab
3. Run this command:
   ```javascript
   localStorage.clear()
   ```
4. Refresh the page

## Option 3: Developer Clear Data Button (Development Only)

When running in development mode (`npm start`), a red "Clear Data" button appears in the top-right corner of the registration form. Simply click it to clear all data and restart.

## Option 4: Keyboard Shortcut (Development Only)

Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac) from anywhere in the app to clear all data. A confirmation dialog will appear.

## What Gets Cleared

- Candidate registration data (name, email, password hash, etc.)
- Assessment state (started, submitted, etc.)
- All answers
- Audit log (tab switches, camera events, etc.)

After clearing, you'll be taken back to the registration form.

