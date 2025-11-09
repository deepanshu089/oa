import { useState, useEffect, useRef } from 'react'
import { questions, getTotalQuestions } from '../data/questions'
import { saveAnswer, getAnswer, updateAssessmentState, logAuditEvent, getAuditSummary, clearCameraDenialEvents } from '../utils/storage'
import { captureFrame, detectMultipleFaces } from '../utils/camera'
import { getCandidateData } from '../utils/storage'
import { requestFullscreen, exitFullscreen, isFullscreen, addFullscreenChangeListener } from '../utils/fullscreen'

function ExamScreen({ onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [answers, setAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState(new Set())
  const [stream, setStream] = useState(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const videoRef = useRef(null)
  const intervalRef = useRef(null)
  const cameraCheckRef = useRef(null)
  const autoSaveRef = useRef(null)
  const answersRef = useRef({}) // Ref to track current answers for auto-save

  useEffect(() => {
    // Request fullscreen when exam starts
    const enterFullscreen = async () => {
      if (!isFullscreen()) {
        try {
          await requestFullscreen()
        } catch (error) {
          console.warn('Fullscreen request failed:', error)
          logAuditEvent('fullscreen_denied', { reason: error })
        }
      }
    }
    enterFullscreen()

    // Monitor fullscreen changes and log exits
    const handleFullscreenChange = () => {
      if (!isFullscreen()) {
        // User exited fullscreen - log it as a violation
        logAuditEvent('fullscreen_exit', { timestamp: new Date().toISOString() })
        // Note: We don't force re-entry as it's intrusive, but we log it for audit
      }
    }
    const removeListener = addFullscreenChangeListener(handleFullscreenChange)

    // Load existing answers
    const savedAnswers = {}
    questions.forEach(q => {
      const saved = getAnswer(q.id)
      if (saved) savedAnswers[q.id] = saved
    })
    setAnswers(savedAnswers)

    // Get camera stream
    const candidateData = getCandidateData()
    if (candidateData) {
      // Check camera permissions first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        })
          .then(camStream => {
            setStream(camStream)
            if (videoRef.current) {
              videoRef.current.srcObject = camStream
            }
            // Camera is working - clear any previous denial events
            clearCameraDenialEvents()
          })
          .catch(error => {
            // Only log if it's a permission denial and not already logged recently
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
              const auditLog = JSON.parse(localStorage.getItem('flipkart_oa_audit') || '[]')
              const hasRecentDenial = auditLog.some(e => 
                e.type === 'camera_denied' && 
                new Date(e.timestamp) > new Date(Date.now() - 60000) // Within last minute
              )
              if (!hasRecentDenial) {
                logAuditEvent('camera_denied', { reason: error.name })
              }
            }
            // For other errors (no device, etc.), don't log as denial
          })
      }
    }

    // Set up timer
    const state = updateAssessmentState({ started: true })
    const startTime = state.startTime ? new Date(state.startTime) : new Date()
    const elapsed = Math.floor((new Date() - startTime) / 1000)
    const remaining = Math.max(0, 30 * 60 - elapsed)
    setTimeLeft(remaining)

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Set up tab visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logAuditEvent('tab_switch', { timestamp: new Date().toISOString() })
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Set up beforeunload warning
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Set up camera monitoring (every 60 seconds)
    cameraCheckRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4 && stream) {
        try {
          const frame = captureFrame(videoRef.current)
          detectMultipleFaces(frame).then(result => {
            if (result.suspicious) {
              logAuditEvent('suspicious_snapshot', {
                faceCount: result.faceCount,
                variance: result.variance,
                avgBrightness: result.avgBrightness
              })
            }
          }).catch(() => {
            // Silently fail if detection fails
          })
        } catch (error) {
          // Silently fail if capture fails
        }
      }
    }, 60000)

    // Auto-save every 10 seconds
    autoSaveRef.current = setInterval(() => {
      // Save current answers from ref (which is updated with state)
      Object.keys(answersRef.current).forEach(qId => {
        if (answersRef.current[qId]) {
          saveAnswer(qId, answersRef.current[qId])
        }
      })
    }, 10000)

    return () => {
      removeListener()
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (cameraCheckRef.current) clearInterval(cameraCheckRef.current)
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update ref when answers change
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // Update answers when state changes (debounced auto-save)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.keys(answers).length > 0) {
        Object.keys(answers).forEach(qId => {
          saveAnswer(qId, answers[qId])
        })
      }
    }, 500) // Small delay to avoid excessive saves
    
    return () => clearTimeout(timeoutId)
  }, [answers])

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < getTotalQuestions()) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleMarkForReview = () => {
    setMarkedForReview(prev => new Set([...prev, currentQuestion]))
  }

  const handleUnmarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev)
      newSet.delete(currentQuestion)
      return newSet
    })
  }

  const handleQuestionClick = (questionId) => {
    setCurrentQuestion(questionId)
  }

  const handleAutoSubmit = () => {
    // Save all answers before submitting
    Object.keys(answers).forEach(qId => {
      saveAnswer(qId, answers[qId])
    })
    updateAssessmentState({ submitted: true, submittedAt: new Date().toISOString() })
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (cameraCheckRef.current) clearInterval(cameraCheckRef.current)
    if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    
    // Exit fullscreen on submit
    exitFullscreen().catch(() => {
      // Silent fail if already exited
    })
    
    onSubmit()
  }

  const handleManualSubmit = () => {
    setShowSubmitModal(true)
  }

  const handleConfirmSubmit = () => {
    // Save all answers before submitting
    Object.keys(answers).forEach(qId => {
      saveAnswer(qId, answers[qId])
    })
    setShowSubmitModal(false)
    
    // Exit fullscreen on submit
    exitFullscreen().catch(() => {
      // Silent fail if already exited
    })
    
    handleAutoSubmit()
  }

  const handleCancelSubmit = () => {
    setShowSubmitModal(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQ = questions.find(q => q.id === currentQuestion)
  const isMarked = markedForReview.has(currentQuestion)

  // Disable right-click and text selection
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
    }
    const handleCopy = (e) => {
      e.preventDefault()
    }
    const handlePaste = (e) => {
      e.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar Navigation */}
      <div className="w-72 bg-gray-800 border-r border-gray-700 p-5 pl-6 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">Flipkart</h2>
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-600/50 rounded-lg p-3 mb-4 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-red-300 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time Remaining
              </span>
            </div>
            <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-red-300'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="mb-4 flex-1 overflow-y-auto pr-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Questions ({questions.length})
          </h3>
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map(q => {
              const hasAnswer = answers[q.id] && answers[q.id] !== ''
              const isCurrent = q.id === currentQuestion
              const isMarkedQ = markedForReview.has(q.id)
              
              return (
                <button
                  key={q.id}
                  onClick={() => handleQuestionClick(q.id)}
                  className={`w-9 h-9 rounded-md text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800 shadow-lg scale-105'
                      : hasAnswer
                      ? 'bg-green-500 text-white border-2 border-green-600 hover:bg-green-600'
                      : isMarkedQ
                      ? 'bg-yellow-500 text-white border-2 border-yellow-600 hover:bg-yellow-600'
                      : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                  }`}
                >
                  {q.id}
                </button>
              )
            })}
          </div>
        </div>

        {/* Camera Preview */}
        {stream && (
          <div className="mt-4 mb-4">
            <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Camera Monitoring
            </div>
            <div className="w-full rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg ring-2 ring-blue-500/30">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleManualSubmit}
          className="mt-auto w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          Submit Assessment
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Question Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-400">Question {currentQuestion} of {getTotalQuestions()}</span>
              <h2 className="text-xl font-bold text-gray-100 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {currentQ.type === 'mcq' && 'Multiple Choice'}
                {currentQ.type === 'numerical' && 'Numerical Answer'}
                {currentQ.type === 'text' && 'Short Answer'}
              </h2>
            </div>
            {isMarked && (
              <span className="px-3 py-1.5 bg-yellow-600/20 text-yellow-300 rounded-full text-sm font-semibold border border-yellow-600/50 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Marked for Review
              </span>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 mb-6">
              <p className="text-lg text-gray-100 mb-6 font-mono leading-relaxed">
                {currentQ.question}
              </p>

              {currentQ.type === 'mcq' && (
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        answers[currentQ.id] === index.toString()
                          ? 'border-blue-500 bg-blue-600/20 ring-2 ring-blue-500/50 shadow-lg'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={index}
                        checked={answers[currentQ.id] === index.toString()}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                        className="mt-1 mr-3 w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-200 flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.type === 'numerical' && (
                <div>
                  <input
                    type="number"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono text-gray-100 placeholder-gray-400 transition-all"
                    placeholder="Enter your answer"
                  />
                </div>
              )}

              {currentQ.type === 'text' && (
                <div>
                  <textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= currentQ.maxLength) {
                        handleAnswerChange(currentQ.id, value)
                      }
                    }}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-100 placeholder-gray-400 transition-all"
                    placeholder="Type your answer here..."
                  />
                  <div className="mt-2 text-sm text-gray-400 text-right">
                    <span className={answers[currentQ.id]?.length >= currentQ.maxLength * 0.9 ? 'text-yellow-400' : ''}>
                      {(answers[currentQ.id] || '').length}
                    </span>
                    <span className="text-gray-500"> / {currentQ.maxLength} characters</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-gray-800 border-t border-gray-700 p-6 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  currentQuestion === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestion === getTotalQuestions()}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  currentQuestion === getTotalQuestions()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
                }`}
              >
                Next
              </button>
            </div>
            <div className="flex gap-3">
              {isMarked ? (
                <button
                  onClick={handleUnmarkForReview}
                  className="px-6 py-2.5 bg-yellow-600/20 text-yellow-300 rounded-lg font-semibold hover:bg-yellow-600/30 border border-yellow-600/50 transition-all"
                >
                  Unmark Review
                </button>
              ) : (
                <button
                  onClick={handleMarkForReview}
                  className="px-6 py-2.5 bg-yellow-600/20 text-yellow-300 rounded-lg font-semibold hover:bg-yellow-600/30 border border-yellow-600/50 transition-all"
                >
                  Mark for Review
                </button>
              )}
              <button
                onClick={() => {
                  saveAnswer(currentQ.id, answers[currentQ.id] || '')
                  handleNext()
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-block bg-yellow-600/20 rounded-full p-3 mb-4 border border-yellow-500/50">
                <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Confirm Submission</h2>
              <p className="text-gray-400 text-sm">
                Are you sure you want to submit your assessment?
              </p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600">
              <p className="text-sm text-gray-300 text-center leading-relaxed">
                Once you submit, you will not be able to make any changes to your answers. Please review all questions before proceeding.
              </p>
            </div>

            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Questions Answered:</span>
                <span className="font-semibold text-blue-300">
                  {Object.keys(answers).filter(qId => answers[qId] && answers[qId] !== '').length} / {getTotalQuestions()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-400">Time Remaining:</span>
                <span className="font-semibold text-blue-300">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelSubmit}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-all border border-gray-600 hover:border-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamScreen

