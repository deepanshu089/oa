# Project Summary - Flipkart Business Analyst OA Platform

## Files Created

### Configuration Files
- `package.json` - Project dependencies and scripts
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.gitignore` - Git ignore rules
- `index.html` - HTML entry point

### Source Files

#### Core Application
- `src/main.jsx` - React entry point
- `src/App.jsx` - Main app router/screen manager
- `src/index.css` - Global styles and Tailwind imports

#### Components (`src/components/`)
- `CandidateForm.jsx` - Registration form with validation
- `InstructionsScreen.jsx` - Instructions page with camera setup
- `ExamScreen.jsx` - Main exam interface (timer, questions, monitoring)
- `SubmissionScreen.jsx` - Results page with rejection modal

#### Utilities (`src/utils/`)
- `storage.js` - localStorage management (candidate data, answers, audit log)
- `camera.js` - Camera access and face detection utilities

#### Data (`src/data/`)
- `questions.js` - Mock questions (12 questions: 4 MCQ, 3 numerical, 3 text, 2 more)

### Documentation
- `README.md` - Comprehensive documentation with setup, features, testing checklist
- `PROJECT_SUMMARY.md` - This file

## Quick Start

```bash
npm install
npm start
```

The app will open automatically at `http://localhost:3000`

## Main Logic Locations

1. **Form Handling**: `src/components/CandidateForm.jsx` + `src/utils/storage.js` → `saveCandidateData()`
2. **Camera Access**: `src/components/InstructionsScreen.jsx` + `src/utils/camera.js` → `requestCameraAccess()`
3. **Timer**: `src/components/ExamScreen.jsx` (lines ~48-57)
4. **Tab Detection**: `src/components/ExamScreen.jsx` (lines ~59-65)
5. **Camera Monitoring**: `src/components/ExamScreen.jsx` (lines ~80-100) + `src/utils/camera.js` → `detectMultipleFaces()`
6. **Answer Saving**: `src/components/ExamScreen.jsx` → `handleAnswerChange()` + `src/utils/storage.js` → `saveAnswer()`
7. **Submission**: `src/components/SubmissionScreen.jsx` + `src/utils/storage.js` → `getAuditSummary()`

## Key Features Implemented

✅ Candidate registration form with validation
✅ Instructions screen with camera access
✅ 30-minute timer with auto-submit
✅ Tab switching detection (Page Visibility API)
✅ Camera monitoring with placeholder face detection
✅ Answer auto-save (every 10 seconds)
✅ Question navigation sidebar
✅ 12 mock Business Analyst questions
✅ Submission screen with rejection modal
✅ All data persisted in localStorage
✅ Security features (disabled right-click, copy/paste)
✅ beforeunload warning

## Ethical Reminder

**⚠️ This project is for demonstration purposes only. Always obtain explicit consent before using camera/surveillance features. Misuse could violate privacy laws.**

