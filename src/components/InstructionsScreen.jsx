import { useState, useEffect, useRef } from 'react'
import { requestCameraAccess, stopCameraStream } from '../utils/camera'
import { updateAssessmentState, logAuditEvent, clearCameraDenialEvents } from '../utils/storage'
import { requestFullscreen } from '../utils/fullscreen'

function InstructionsScreen({ onComplete }) {
  const [cameraGranted, setCameraGranted] = useState(false)
  const [cameraDenied, setCameraDenied] = useState(false)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    // Request camera access on mount
    requestCameraAccess().then(({ stream: camStream, error }) => {
      if (camStream) {
        setStream(camStream)
        setCameraGranted(true)
        setCameraDenied(false) // Ensure denied state is cleared if granted
        // Clear any previous denial events since camera is working now
        clearCameraDenialEvents()
        if (videoRef.current) {
          videoRef.current.srcObject = camStream
        }
      } else {
        // Only set denied if it's actually a permission denial
        if (error === 'NotAllowedError' || error === 'PermissionDeniedError') {
          setCameraDenied(true)
          setCameraGranted(false)
          // Only log if we don't already have a denial for this session
          const auditLog = JSON.parse(localStorage.getItem('flipkart_oa_audit') || '[]')
          const hasRecentDenial = auditLog.some(e => 
            e.type === 'camera_denied' && 
            new Date(e.timestamp) > new Date(Date.now() - 60000) // Within last minute
          )
          if (!hasRecentDenial) {
            logAuditEvent('camera_denied', { reason: error })
          }
        } else {
          // For other errors (like no camera device), don't show as denied
          setCameraDenied(false)
        }
      }
    })

    // Mark instructions as viewed
    updateAssessmentState({ instructionsViewed: true })

    return () => {
      if (stream) {
        stopCameraStream(stream)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = async () => {
    try {
      // Re-check camera status before starting (user might have allowed it)
      const { stream: camStream, error } = await requestCameraAccess()
      if (camStream) {
        // Camera is working - clear any denied state and denial events
        setCameraGranted(true)
        setCameraDenied(false)
        clearCameraDenialEvents() // Remove any previous denial events
        // Stop the old stream if it exists
        if (stream) {
          stopCameraStream(stream)
        }
        setStream(camStream)
        // Update video element if it exists
        if (videoRef.current) {
          videoRef.current.srcObject = camStream
        }
      } else if (error === 'NotAllowedError' || error === 'PermissionDeniedError') {
        // Camera is actually denied - only log if not already logged recently
        setCameraDenied(true)
        setCameraGranted(false)
        const auditLog = JSON.parse(localStorage.getItem('flipkart_oa_audit') || '[]')
        const hasRecentDenial = auditLog.some(e => 
          e.type === 'camera_denied' && 
          new Date(e.timestamp) > new Date(Date.now() - 60000) // Within last minute
        )
        if (!hasRecentDenial) {
          logAuditEvent('camera_denied', { reason: error })
        }
      }
      
      // Request fullscreen before starting assessment
      await requestFullscreen()
      updateAssessmentState({ started: true, startTime: new Date().toISOString() })
      onComplete()
    } catch (error) {
      // If fullscreen fails, log it but continue with assessment
      console.warn('Fullscreen request failed:', error)
      logAuditEvent('fullscreen_denied', { reason: error })
      updateAssessmentState({ started: true, startTime: new Date().toISOString() })
      onComplete()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Flipkart</h1>
              <p className="text-gray-300 text-sm mt-1">Business Analyst Assessment</p>
            </div>
            {/* Camera Preview */}
            <div className="relative">
              {cameraGranted && videoRef.current && (
                <div className="w-32 h-24 rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg ring-2 ring-blue-500/50">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {cameraDenied && (
                <div className="w-32 h-24 rounded-lg border-2 border-red-500 bg-gray-700 flex items-center justify-center opacity-60">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-red-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <p className="text-xs text-red-400">Camera Denied</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Assessment Instructions
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-semibold mb-1 text-gray-100">No External Help</p>
                <p className="text-sm text-gray-400">You must complete this assessment independently without any external assistance, resources, or communication.</p>
              </div>
            </div>

            <div className="flex items-start bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-semibold mb-1 text-gray-100">Camera Monitoring</p>
                <p className="text-sm text-gray-400">Your camera will be enabled throughout the assessment to ensure test integrity. Please ensure good lighting and keep your face visible.</p>
              </div>
            </div>

            <div className="flex items-start bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-semibold mb-1 text-gray-100">No Tab Switching</p>
                <p className="text-sm text-gray-400">Do not switch tabs, minimize the browser, or navigate away from the assessment page. All such actions will be logged and may result in disqualification.</p>
              </div>
            </div>

            <div className="flex items-start bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <div>
                <p className="font-semibold mb-1 text-gray-100">No Copying or Pasting</p>
                <p className="text-sm text-gray-400">Copying, pasting, or using keyboard shortcuts to access external content is prohibited. The assessment interface has these features disabled.</p>
              </div>
            </div>

            <div className="flex items-start bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                <span className="text-white font-bold text-sm">5</span>
              </div>
              <div>
                <p className="font-semibold mb-1 text-gray-100">Time Limit</p>
                <p className="text-sm text-gray-400">You have 30 minutes to complete the assessment. The timer will start when you click "Start Assessment".</p>
              </div>
            </div>

            <div className="flex items-start bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                <span className="text-white font-bold text-sm">6</span>
              </div>
              <div>
                <p className="font-semibold mb-1 text-gray-100">Auto-Save</p>
                <p className="text-sm text-gray-400">Your answers are automatically saved every 10 seconds. You can also use "Save & Next" to manually save your progress.</p>
              </div>
            </div>

            <div className="flex items-start bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                <span className="text-white font-bold text-sm">7</span>
              </div>
              <div>
                <p className="font-semibold mb-1 text-gray-100">Fullscreen Mode</p>
                <p className="text-sm text-gray-400">The assessment will be conducted in fullscreen mode. Do not exit fullscreen mode during the assessment as it will be logged and may result in disqualification.</p>
              </div>
            </div>
          </div>

          {cameraDenied && (
            <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
              <p className="text-yellow-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <strong>Warning:</strong> Camera access was denied. The assessment will continue, but this may affect your evaluation.
              </p>
            </div>
          )}
        </div>

        {/* Agreement Button */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-center mb-4">
            <input
              type="checkbox"
              id="agree"
              className="w-5 h-5 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-gray-700 focus:ring-2"
            />
            <label htmlFor="agree" className="ml-3 text-gray-300 text-sm">
              I have read and understood all the instructions above. I agree to abide by the assessment rules.
            </label>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg transform hover:scale-[1.02]"
          >
            I Agree — Start Assessment
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstructionsScreen

