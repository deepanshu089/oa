import { useState, useEffect } from 'react'
import { getCandidateData, getAssessmentState, getAnswers, getAuditSummary, getAuditLog, logAuditEvent } from '../utils/storage'
import { questions, getTotalQuestions } from '../data/questions'
import { exitFullscreen } from '../utils/fullscreen'

function SubmissionScreen({ candidateData: propCandidateData }) {
  const [candidateData, setCandidateData] = useState(propCandidateData)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [auditSummary, setAuditSummary] = useState(null)
  const [llmUsed, setLlmUsed] = useState('')
  const [showLlmInput, setShowLlmInput] = useState(false)
  const [llmSubmitted, setLlmSubmitted] = useState(false)

  useEffect(() => {
    // Exit fullscreen when submission screen loads
    exitFullscreen().catch(() => {
      // Silent fail if already exited
    })

    if (!candidateData) {
      setCandidateData(getCandidateData())
    }
    const summary = getAuditSummary()
    setAuditSummary(summary)
    
    // Show rejection modal after a brief delay
    setTimeout(() => {
      setShowRejectionModal(true)
      // Show LLM input after rejection message is displayed
      setTimeout(() => {
        setShowLlmInput(true)
      }, 2000)
    }, 1000)
  }, [])

  const handleLlmSubmit = () => {
    if (llmUsed.trim()) {
      // Log the LLM information
      logAuditEvent('llm_reported', { llm: llmUsed.trim() })
      // Store in a separate key for easy retrieval
      localStorage.setItem('flipkart_oa_llm_used', JSON.stringify({
        llm: llmUsed.trim(),
        timestamp: new Date().toISOString(),
        candidateEmail: candidateData?.email
      }))
      setLlmSubmitted(true)
      // Hide input after a brief delay
      setTimeout(() => {
        setShowLlmInput(false)
      }, 2000)
    }
  }

  const state = getAssessmentState()
  const answers = getAnswers()
  const answeredCount = Object.keys(answers).filter(qId => answers[qId] && answers[qId] !== '').length

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateTimeTaken = () => {
    if (!state?.startTime || !state?.submittedAt) return 'N/A'
    const start = new Date(state.startTime)
    const end = new Date(state.submittedAt)
    const diff = Math.floor((end - start) / 1000)
    return formatTime(diff)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 mb-6 text-center">
          <div className="inline-block bg-green-600/20 rounded-full p-4 mb-4 border border-green-500/50">
            <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Submission Received</h1>
          <p className="text-gray-400">Thank you for completing the assessment</p>
        </div>

        {/* Summary */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Assessment Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4 bg-gray-700/30 rounded-r-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Candidate Name</p>
              <p className="text-lg font-semibold text-gray-100">{candidateData?.fullName || 'N/A'}</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 bg-gray-700/30 rounded-r-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-100">{candidateData?.email || 'N/A'}</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4 bg-gray-700/30 rounded-r-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Questions Answered</p>
              <p className="text-lg font-semibold text-gray-100">{answeredCount} / {getTotalQuestions()}</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4 bg-gray-700/30 rounded-r-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Time Taken</p>
              <p className="text-lg font-semibold text-gray-100">{calculateTimeTaken()}</p>
            </div>
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-4">
                <div className="inline-block bg-red-600/20 rounded-full p-2 mb-3 border border-red-500/50">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-red-400 mb-2">Assessment Rejected</h2>
              </div>

              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-200 text-center leading-relaxed">
                  <strong className="text-red-300">Result:</strong> Multiple instances of human interference detected during the assessment (tab switching, camera anomalies). Our analysis indicates that you have taken help from an external friend or used unauthorized assistance. Your OA has been rejected.
                </p>
              </div>

              {auditSummary && (
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4 border border-gray-600">
                  <h3 className="font-semibold text-gray-200 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Detection Details:
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tab switches detected:</span>
                      <span className="font-semibold text-red-400">{auditSummary.tabSwitches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Camera access denied:</span>
                      <span className="font-semibold text-red-400">
                        {auditSummary.cameraDenied ? `Yes (${auditSummary.cameraDenialCount || 0} times)` : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Suspicious camera snapshots:</span>
                      <span className="font-semibold text-red-400">{auditSummary.suspiciousSnapshots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fullscreen exits:</span>
                      <span className="font-semibold text-red-400">{auditSummary.fullscreenExits || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total interference events:</span>
                      <span className="font-semibold text-red-400">{auditSummary.totalEvents}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-200">
                  <strong>Note:</strong> If you believe this is an error, contact recruitment@flipkart.com with your candidate ID.
                </p>
              </div>

              {/* LLM Input Section */}
              {showLlmInput && (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-4">
                  {!llmSubmitted ? (
                    <>
                      <p className="text-sm text-gray-200 mb-3 font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Help us improve our systems:
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        Which LLM did your friend use during the exam? We are asking this to refine our detection systems.
                      </p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={llmUsed}
                          onChange={(e) => setLlmUsed(e.target.value)}
                          placeholder="e.g., ChatGPT, Claude, Gemini, Copilot, etc."
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && llmUsed.trim()) {
                              handleLlmSubmit()
                            }
                          }}
                        />
                        <button
                          onClick={handleLlmSubmit}
                          disabled={!llmUsed.trim()}
                          className={`w-full py-2 text-sm font-semibold rounded-lg transition-all ${
                            llmUsed.trim()
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Submit Response
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <div className="inline-block bg-green-600/20 rounded-full p-2 mb-2">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-green-400 font-semibold">Thank you for your response!</p>
                      <p className="text-xs text-gray-400 mt-1">Your feedback has been recorded.</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowRejectionModal(false)}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all text-sm border border-gray-600 hover:border-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubmissionScreen

