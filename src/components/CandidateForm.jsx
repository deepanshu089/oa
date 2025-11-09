import { useState } from 'react'
import { saveCandidateData } from '../utils/storage'

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


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 border-b-2 border-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
            <div className="flex items-center gap-4">
              <img 
                src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/flipkart-plus_8d85f4.png" 
                alt="Flipkart Logo" 
                className="h-12 md:h-14 object-contain"
                style={{ filter: 'brightness(1.1) saturate(1.2)' }}
              />
              <div className="h-12 w-px bg-gray-600 hidden md:block"></div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent tracking-wide">
                FLIPKART ONLINE ASSESSMENT
              </h1>
              <div className="flex flex-col md:flex-row items-center md:items-baseline gap-1 md:gap-2 mt-1">
                <p className="text-sm md:text-base text-gray-400 font-semibold tracking-wider">
                  2025
                </p>
                <span className="hidden md:inline text-gray-600">•</span>
                <p className="text-sm md:text-base text-gray-300 font-medium">
                  Business Analyst
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-900 py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Welcome Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8 mb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Candidate Registration</h2>
              <p className="text-gray-300 text-sm">
                You have been shortlisted for the Business Analyst position
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Please fill in your details to proceed with the assessment
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-200 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.fullName && errors.fullName ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.email && errors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="college" className="block text-sm font-semibold text-gray-200 mb-2">
                    College/University <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.college && errors.college ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your college name"
                  />
                  {touched.college && errors.college && (
                    <p className="text-red-400 text-xs mt-1">{errors.college}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-semibold text-gray-200 mb-2">
                    Branch <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.branch && errors.branch ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="e.g., Computer Science, Business"
                  />
                  {touched.branch && errors.branch && (
                    <p className="text-red-400 text-xs mt-1">{errors.branch}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cgpa" className="block text-sm font-semibold text-gray-200 mb-2">
                    CGPA <span className="text-red-400">*</span>
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
                    className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.cgpa && errors.cgpa ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="0.00 - 10.00"
                  />
                  {touched.cgpa && errors.cgpa && (
                    <p className="text-red-400 text-xs mt-1">{errors.cgpa}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-200 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      touched.phone && errors.phone ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="10-digit phone number"
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                  Set Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    touched.password && errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Minimum 6 characters"
                />
                {touched.password && errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-4 px-4 rounded-md font-semibold text-base transition-all mt-6 ${
                  isFormValid()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-400">
            © 2024 Flipkart. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CandidateForm

