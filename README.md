# Flipkart Business Analyst - Online Assessment Platform

A complete, runnable single-page web application (React + Tailwind CSS) that simulates an online assessment platform similar to HackerRank/HackerEarth, themed for a "Flipkart Business Analyst" role.

## ⚠️ **IMPORTANT ETHICAL DISCLAIMER**

**This project is for demonstration and educational purposes only. This prank must be used only with explicit consent. Do not use camera/surveillance capabilities without informed permission. Misuse could violate privacy laws and may result in legal consequences.**

- Always obtain explicit consent before using this application
- Inform users about camera access and monitoring features
- Do not use this application for actual recruitment without proper legal review
- Respect privacy laws and regulations in your jurisdiction

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   npm run dev
   ```

   The application will automatically open in your browser at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📋 Features

### 1. Candidate Registration Form
- Professional landing page with Flipkart-like branding
- Form fields: Full Name, Email, College, Branch, CGPA, Phone, Password
- Client-side validation for all fields
- Password hashing (simple client-side hash)
- Data stored in localStorage

### 2. Instructions Screen
- Comprehensive assessment rules and guidelines
- Camera access request with live preview
- Agreement checkbox and "Start Assessment" button
- Handles camera denial gracefully

### 3. Exam Environment
- **Timer**: 30-minute countdown timer (starts at 30:00)
- **Tab Switching Detection**: Uses Page Visibility API to detect when user switches tabs
- **Camera Monitoring**: 
  - Live camera preview in sidebar
  - Periodic snapshots every 60 seconds
  - Placeholder face detection heuristic (can be replaced with face-api.js)
- **Answer Management**:
  - Auto-save every 10 seconds
  - Manual "Save & Next" button
  - "Mark for Review" functionality
- **Security Features**:
  - Disabled right-click context menu
  - Disabled copy/paste
  - beforeunload warning on page close/reload
- **Question Navigation**: Left sidebar with question grid showing status

### 4. Questions (10-12 Mock Questions)
- **4 Multiple Choice Questions**: Business case / data interpretation
- **3 Numerical Answer Questions**: Calculations (revenue growth, CLV, etc.)
- **3 Short Text Answers**: Justification/approach questions (max 200 chars)

### 5. Submission & Results
- Auto-submit when timer reaches 00:00
- Manual submit with confirmation
- Professional submission confirmation screen
- **Rejection Modal**: Shows "rejection" message with audit details
- Displays: tab switches, camera denials, suspicious snapshots

## 📁 Project Structure

```
oa/
├── src/
│   ├── components/
│   │   ├── CandidateForm.jsx       # Registration form component
│   │   ├── InstructionsScreen.jsx  # Instructions and camera setup
│   │   ├── ExamScreen.jsx          # Main exam interface with timer
│   │   └── SubmissionScreen.jsx    # Results and rejection modal
│   ├── data/
│   │   └── questions.js            # Mock questions data (JSON-like)
│   ├── utils/
│   │   ├── storage.js              # localStorage management
│   │   └── camera.js               # Camera utilities and face detection
│   ├── App.jsx                     # Main app router
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind CSS imports
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔍 Key Logic Locations

### Form Handling
- **File**: `src/components/CandidateForm.jsx`
- **Storage**: `src/utils/storage.js` → `saveCandidateData()`

### Camera Access
- **File**: `src/components/InstructionsScreen.jsx` (initial request)
- **File**: `src/utils/camera.js` → `requestCameraAccess()`

### Timer & Tab Detection
- **File**: `src/components/ExamScreen.jsx`
- Timer: `useEffect` with `setInterval` (lines ~50-60)
- Tab detection: `visibilitychange` event listener (lines ~70-75)

### Camera Monitoring
- **File**: `src/components/ExamScreen.jsx` (periodic checks)
- **File**: `src/utils/camera.js` → `detectMultipleFaces()` (placeholder heuristic)
- **Note**: The face detection is a placeholder. See comments in `camera.js` for integration with face-api.js

### Answer Saving
- **File**: `src/components/ExamScreen.jsx` → `handleAnswerChange()`
- **File**: `src/utils/storage.js` → `saveAnswer()`
- Auto-save: `setInterval` every 10 seconds

### Submission & Audit
- **File**: `src/components/SubmissionScreen.jsx`
- **File**: `src/utils/storage.js` → `getAuditSummary()`, `logAuditEvent()`

## 🧪 Testing Checklist

### Testing Tab Switching Detection
1. Start the assessment
2. Switch to another tab (Alt+Tab or Cmd+Tab)
3. Return to the assessment tab
4. Check browser console or localStorage for audit events
5. Submit the assessment and verify tab switch count in rejection modal

### Testing Camera Denial
1. On the instructions screen, deny camera access when prompted
2. Verify the camera preview shows "Camera Denied" message
3. Verify you can still proceed with the assessment
4. Check localStorage for `camera_denied` audit event
5. Submit and verify camera denial appears in rejection details

### Testing Timer & Auto-Submit
1. Start the assessment
2. Wait for timer to reach 00:00 (or manually set timeLeft to 1 in code for testing)
3. Verify auto-submission triggers
4. Verify submission screen appears

### Testing Answer Persistence
1. Answer a few questions
2. Refresh the page (you'll get a warning, but proceed)
3. Verify answers are still present after refresh
4. Check localStorage for answer data

### Testing Face Detection (Placeholder)
1. Start assessment with camera enabled
2. Wait 60+ seconds for first camera check
3. Check browser console for detection results
4. Check localStorage audit log for `suspicious_snapshot` events

## 🔧 Customization

### Replacing Face Detection with face-api.js

1. Install face-api.js:
   ```bash
   npm install face-api.js
   ```

2. Update `src/utils/camera.js`:
   ```javascript
   import * as faceapi from 'face-api.js'
   
   // Load models (call once on app init)
   export async function loadFaceModels() {
     await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
   }
   
   // Replace detectMultipleFaces function
   export async function detectMultipleFaces(imageData) {
     const img = await faceapi.fetchImage(imageData)
     const detections = await faceapi.detectAllFaces(img, 
       new faceapi.TinyFaceDetectorOptions())
     
     return {
       faceCount: detections.length,
       suspicious: detections.length > 1,
       detections
     }
   }
   ```

3. Update `src/components/ExamScreen.jsx` to load models on mount

### Modifying Questions

Edit `src/data/questions.js` to add, remove, or modify questions. Each question object should have:
- `id`: Unique number
- `type`: 'mcq', 'numerical', or 'text'
- `question`: Question text
- For MCQ: `options`: Array of strings
- For text: `maxLength`: Maximum character count

### Changing Timer Duration

In `src/components/ExamScreen.jsx`, change:
```javascript
const [timeLeft, setTimeLeft] = useState(30 * 60) // Change 30 to desired minutes
```

## 🛠️ Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Browser APIs**: 
  - MediaDevices API (camera)
  - Page Visibility API (tab detection)
  - localStorage (data persistence)
  - beforeunload event (navigation warning)

## 📝 Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may require HTTPS for camera)
- Mobile browsers: Limited (camera access may vary)

## 🔐 Data Storage

All data is stored in browser localStorage:
- `flipkart_oa_candidate`: Candidate registration data
- `flipkart_oa_state`: Assessment state (started, submitted, etc.)
- `flipkart_oa_answers`: All question answers
- `flipkart_oa_audit`: Audit log (tab switches, camera events, etc.)

To clear all data, use browser DevTools → Application → Local Storage → Clear

## 🐛 Troubleshooting

### Camera not working
- **HTTPS Required**: Browsers require HTTPS for camera access (except localhost). If deploying, ensure your site uses HTTPS.
- **Browser Permissions**: Check browser settings → Site permissions → Camera
- **Browser Compatibility**: Try Chrome, Firefox, or Edge (Safari may have stricter requirements)
- **Console Errors**: Open DevTools (F12) → Console tab to see camera access errors
- **Development**: Camera works on `localhost` or `127.0.0.1` without HTTPS
- **Production**: Must use HTTPS (e.g., Vercel, Netlify, GitHub Pages with HTTPS enabled)

### Timer not counting down
- Check browser console for errors
- Verify localStorage is enabled
- Clear localStorage and restart

### Answers not saving
- Check browser console for errors
- Verify localStorage quota (should be sufficient for this app)
- Check network tab for any failed requests (shouldn't be any)

## 📄 License

This project is for educational/demonstration purposes only. Use at your own risk.

## 🙏 Acknowledgments

- Inspired by HackerRank and HackerEarth assessment platforms
- Uses placeholder/mock content (not affiliated with Flipkart)

---

**Remember**: Always obtain consent before using this application. Respect privacy and use responsibly.

