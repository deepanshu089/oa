import { useState, useEffect } from 'react'
import { saveCandidateData, clearAllData } from '../utils/storage'

function CandidateForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    college: '',
    branch: '',
    cgpa: '',
    phone: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone.replace(/\D/g, ''))
  }

  const validateCGPA = (cgpa) => {
    const num = parseFloat(cgpa)
    return !isNaN(num) && num >= 0 && num <= 10
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return value && validateEmail(value) ? '' : 'Please enter a valid email address'
      case 'phone':
        return value && validatePhone(value) ? '' : 'Please enter a valid 10-digit phone number'
      case 'cgpa':
        return value && validateCGPA(value) ? '' : 'Please enter a valid CGPA (0-10)'
      case 'password':
        return value && value.length >= 6 ? '' : 'Password must be at least 6 characters'
      default:
        return value ? '' : 'This field is required'
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })
    
    setErrors(newErrors)
    setTouched({
      fullName: true,
      email: true,
      college: true,
      branch: true,
      cgpa: true,
      phone: true,
      password: true
    })
    
    if (Object.keys(newErrors).length === 0) {
      const candidateData = saveCandidateData(formData)
      onSubmit(candidateData)
    }
  }

  const isFormValid = () => {
    return Object.keys(formData).every(key => {
      if (key === 'cgpa') return validateCGPA(formData[key])
      if (key === 'email') return validateEmail(formData[key])
      if (key === 'phone') return validatePhone(formData[key])
      if (key === 'password') return formData[key].length >= 6
      return formData[key].trim() !== ''
    })
  }

  // Developer tool: Clear data button (only in development)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Press Ctrl+Shift+D to clear all data (developer shortcut)
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        if (window.confirm('Clear all assessment data? (Developer mode)')) {
          clearAllData()
          window.location.reload()
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset the entire assessment.')) {
      clearAllData()
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Developer Clear Data Button - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleClearData}
          className="fixed top-4 right-4 z-50 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-lg transition-all opacity-70 hover:opacity-100"
          title="Clear All Data (Ctrl+Shift+D)"
        >
          🗑️ Clear Data
        </button>
      )}
      
      {/* Flipkart-style Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">f</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  Flipkart
                  <span className="text-yellow-500 text-lg ml-1">✱</span>
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Explore Plus</p>
              </div>
            </div>
            <div className="ml-auto">
              <div className="h-10 w-px bg-gray-300 mx-4"></div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">Online Assessment</p>
              <p className="text-xs text-gray-500">Business Analyst</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Registration</h2>
              <p className="text-gray-600 text-sm">
                You have been shortlisted for the Business Analyst position
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Please fill in your details to proceed with the assessment
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.fullName && errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="college" className="block text-sm font-semibold text-gray-700 mb-2">
                    College/University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.college && errors.college ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your college name"
                  />
                  {touched.college && errors.college && (
                    <p className="text-red-500 text-xs mt-1">{errors.college}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.branch && errors.branch ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Computer Science, Business"
                  />
                  {touched.branch && errors.branch && (
                    <p className="text-red-500 text-xs mt-1">{errors.branch}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cgpa" className="block text-sm font-semibold text-gray-700 mb-2">
                    CGPA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="cgpa"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="0"
                    max="10"
                    step="0.01"
                    className={`w-full px-4 py-3 bg-white border-2 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.cgpa && errors.cgpa ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00 - 10.00"
                  />
                  {touched.cgpa && errors.cgpa && (
                    <p className="text-red-500 text-xs mt-1">{errors.cgpa}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10-digit phone number"
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Set Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-white border-2 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Minimum 6 characters"
                />
                {touched.password && errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-4 px-4 rounded-md font-semibold text-base transition-all mt-6 ${
                  isFormValid()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Flipkart. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CandidateForm

