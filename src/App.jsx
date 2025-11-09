import { useState, useEffect } from 'react'
import CandidateForm from './components/CandidateForm'
import InstructionsScreen from './components/InstructionsScreen'
import ExamScreen from './components/ExamScreen'
import SubmissionScreen from './components/SubmissionScreen'
import { getCandidateData, getAssessmentState } from './utils/storage'

function App() {
  const [currentScreen, setCurrentScreen] = useState('form')
  const [candidateData, setCandidateData] = useState(null)

  useEffect(() => {
    // Check if candidate data exists
    const stored = getCandidateData()
    const state = getAssessmentState()
    
    if (stored) {
      setCandidateData(stored)
      // Navigate to appropriate screen based on state
      if (state?.started && !state?.submitted) {
        setCurrentScreen('exam')
      } else if (state?.submitted) {
        setCurrentScreen('submission')
      } else if (state?.instructionsViewed) {
        setCurrentScreen('instructions')
      } else {
        setCurrentScreen('form')
      }
    }
  }, [])

  const handleFormSubmit = (data) => {
    setCandidateData(data)
    setCurrentScreen('instructions')
  }

  const handleInstructionsComplete = () => {
    setCurrentScreen('exam')
  }

  const handleExamSubmit = () => {
    setCurrentScreen('submission')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {currentScreen === 'form' && (
        <CandidateForm onSubmit={handleFormSubmit} />
      )}
      {currentScreen === 'instructions' && (
        <InstructionsScreen onComplete={handleInstructionsComplete} />
      )}
      {currentScreen === 'exam' && (
        <ExamScreen onSubmit={handleExamSubmit} />
      )}
      {currentScreen === 'submission' && (
        <SubmissionScreen candidateData={candidateData} />
      )}
    </div>
  )
}

export default App

