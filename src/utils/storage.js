// Storage utility functions for candidate data and assessment state

const CANDIDATE_KEY = 'flipkart_oa_candidate'
const ASSESSMENT_STATE_KEY = 'flipkart_oa_state'
const ANSWERS_KEY = 'flipkart_oa_answers'
const AUDIT_LOG_KEY = 'flipkart_oa_audit'

// Simple hash function for password (client-side only)
export function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export function saveCandidateData(data) {
  const candidateData = {
    ...data,
    password: hashPassword(data.password),
    registeredAt: new Date().toISOString()
  }
  localStorage.setItem(CANDIDATE_KEY, JSON.stringify(candidateData))
  return candidateData
}

export function getCandidateData() {
  const data = localStorage.getItem(CANDIDATE_KEY)
  return data ? JSON.parse(data) : null
}

export function saveAssessmentState(state) {
  localStorage.setItem(ASSESSMENT_STATE_KEY, JSON.stringify(state))
}

export function getAssessmentState() {
  const data = localStorage.getItem(ASSESSMENT_STATE_KEY)
  return data ? JSON.parse(data) : null
}

export function updateAssessmentState(updates) {
  const current = getAssessmentState() || {}
  const updated = { ...current, ...updates }
  saveAssessmentState(updated)
  return updated
}

export function saveAnswer(questionId, answer) {
  const answers = getAnswers()
  answers[questionId] = {
    answer,
    timestamp: new Date().toISOString()
  }
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
}

export function getAnswers() {
  const data = localStorage.getItem(ANSWERS_KEY)
  return data ? JSON.parse(data) : {}
}

export function getAnswer(questionId) {
  const answers = getAnswers()
  return answers[questionId]?.answer || ''
}

export function logAuditEvent(eventType, details = {}) {
  const log = getAuditLog()
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    ...details
  }
  log.push(event)
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log))
  return event
}

// Clear camera denial events if camera is working
export function clearCameraDenialEvents() {
  const log = getAuditLog()
  const filteredLog = log.filter(e => e.type !== 'camera_denied')
  if (filteredLog.length !== log.length) {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(filteredLog))
  }
}

export function getAuditLog() {
  const data = localStorage.getItem(AUDIT_LOG_KEY)
  return data ? JSON.parse(data) : []
}

export function getAuditSummary() {
  const log = getAuditLog()
  // Check if camera is actually working by checking if we have a recent denial
  // If camera is working, don't count old denials
  const cameraDenials = log.filter(e => e.type === 'camera_denied')
  const hasRecentCameraDenial = cameraDenials.length > 0
  
  const summary = {
    tabSwitches: log.filter(e => e.type === 'tab_switch').length,
    cameraDenied: hasRecentCameraDenial, // Boolean: true if any denial exists
    cameraDenialCount: cameraDenials.length, // Count of denial events
    suspiciousSnapshots: log.filter(e => e.type === 'suspicious_snapshot').length,
    fullscreenExits: log.filter(e => e.type === 'fullscreen_exit').length,
    totalEvents: log.length
  }
  return summary
}

export function clearAllData() {
  localStorage.removeItem(CANDIDATE_KEY)
  localStorage.removeItem(ASSESSMENT_STATE_KEY)
  localStorage.removeItem(ANSWERS_KEY)
  localStorage.removeItem(AUDIT_LOG_KEY)
  localStorage.removeItem('flipkart_oa_llm_used')
}

export function getLlmUsed() {
  const data = localStorage.getItem('flipkart_oa_llm_used')
  return data ? JSON.parse(data) : null
}

