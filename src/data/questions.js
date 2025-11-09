// Mock questions for Business Analyst role

export const questions = [
  {
    id: 1,
    type: 'mcq',
    question: 'A retail company noticed a 15% increase in online sales but a 10% decrease in in-store sales. If the total revenue increased by 5%, what can be inferred about the sales mix?',
    options: [
      'Online sales represent more than 50% of total sales',
      'In-store sales represent more than 50% of total sales',
      'Both channels contribute equally',
      'Cannot be determined from the given information'
    ],
    correctAnswer: 0 // Placeholder - not used in assessment
  },
  {
    id: 2,
    type: 'numerical',
    question: 'If a product costs $50 to manufacture and is sold at a 40% markup, what is the selling price? (Enter only the number)',
    correctAnswer: 70 // Placeholder
  },
  {
    id: 3,
    type: 'text',
    question: 'Describe in 2-3 sentences: How would you approach analyzing customer churn for an e-commerce platform?',
    maxLength: 200
  },
  {
    id: 4,
    type: 'mcq',
    question: 'In a cohort analysis, if Cohort A (January) has a 60% retention rate in month 2 and Cohort B (February) has a 55% retention rate in month 2, what does this suggest?',
    options: [
      'Customer satisfaction is improving',
      'Customer satisfaction is declining',
      'The cohorts are too small to draw conclusions',
      'Retention rates are consistent across cohorts'
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    type: 'numerical',
    question: 'A crucible contains 200 grams of metal A and 300 grams of metal B. During heating, 10% of metal A and 5% of metal B evaporate. What is the total mass of the mixture left in the crucible after heating? (Enter only the number)',
    correctAnswer: 465
  },
  {
    id: 6,
    type: 'text',
    question: 'What metrics would you track to measure the success of a new product launch? List 3-4 key metrics.',
    maxLength: 200
  },
  {
    id: 7,
    type: 'mcq',
    question: 'If conversion rate increases from 2% to 2.5% and traffic remains constant, what is the percentage increase in conversions?',
    options: [
      '20%',
      '25%',
      '0.5%',
      'Cannot be determined'
    ],
    correctAnswer: 1
  },
  {
    id: 8,
    type: 'numerical',
    question: 'A business analyst needs to calculate the Customer Lifetime Value (CLV). If average order value is $100, purchase frequency is 4 times per year, and customer lifespan is 3 years, what is the CLV? (Enter only the number)',
    correctAnswer: 1200
  },
  {
    id: 9,
    type: 'text',
    question: 'Explain the difference between leading and lagging indicators in business analytics. Provide one example of each.',
    maxLength: 200
  },
  {
    id: 10,
    type: 'mcq',
    question: 'When analyzing A/B test results, a p-value of 0.03 indicates:',
    options: [
      'The results are not statistically significant',
      'There is a 3% chance the results occurred by chance',
      'The test should be run longer',
      'The sample size is too small'
    ],
    correctAnswer: 1
  },
  {
    id: 11,
    type: 'numerical',
    question: 'If a company\'s revenue grew from $1M to $1.5M over one year, what is the year-over-year growth rate? (Enter only the number, as a percentage)',
    correctAnswer: 50
  },
  {
    id: 12,
    type: 'text',
    question: 'How would you prioritize features for a product roadmap? Describe your approach in 2-3 sentences.',
    maxLength: 200
  },
  {
    id: 13,
    type: 'mcq',
    question: 'A company wants to reduce customer acquisition cost (CAC). Which strategy would be most effective?',
    options: [
      'Increase marketing spend across all channels',
      'Focus on improving conversion rates and customer retention',
      'Reduce product prices to attract more customers',
      'Expand to new markets immediately'
    ],
    correctAnswer: 1
  },
  {
    id: 14,
    type: 'numerical',
    question: 'If a website has 50,000 visitors per month, a bounce rate of 40%, and an average session duration of 3 minutes, how many visitors actually engage meaningfully? (Enter only the number)',
    correctAnswer: 30000
  },
  {
    id: 15,
    type: 'text',
    question: 'What is the difference between correlation and causation? Provide a business example where correlation does not imply causation.',
    maxLength: 200
  },
  {
    id: 16,
    type: 'mcq',
    question: 'In a funnel analysis, if 1000 users visit a product page, 300 add to cart, and 150 complete purchase, what is the cart abandonment rate?',
    options: [
      '15%',
      '50%',
      '70%',
      '85%'
    ],
    correctAnswer: 1
  },
  {
    id: 17,
    type: 'numerical',
    question: 'A subscription service has 5000 subscribers paying $20/month. If the monthly churn rate is 5%, how many subscribers will remain after 3 months? (Round to nearest whole number)',
    correctAnswer: 4287
  },
  {
    id: 18,
    type: 'text',
    question: 'Explain the concept of "statistical significance" in the context of A/B testing. Why is sample size important?',
    maxLength: 200
  },
  {
    id: 19,
    type: 'mcq',
    question: 'Which metric is best for measuring long-term customer value?',
    options: [
      'Average order value (AOV)',
      'Customer Lifetime Value (CLV)',
      'Monthly Recurring Revenue (MRR)',
      'Customer Acquisition Cost (CAC)'
    ],
    correctAnswer: 1
  },
  {
    id: 20,
    type: 'numerical',
    question: 'If a business has a gross margin of 60%, operating expenses of $200,000, and wants a net profit of $100,000, what should be the minimum revenue? (Enter only the number)',
    correctAnswer: 500000
  },
  {
    id: 21,
    type: 'text',
    question: 'Describe how you would use segmentation analysis to improve marketing campaign effectiveness. Give an example.',
    maxLength: 200
  },
  {
    id: 22,
    type: 'mcq',
    question: 'What does a negative net promoter score (NPS) indicate?',
    options: [
      'More promoters than detractors',
      'More detractors than promoters',
      'Equal number of promoters and detractors',
      'Insufficient data to calculate'
    ],
    correctAnswer: 1
  },
  {
    id: 23,
    type: 'numerical',
    question: 'If a product\'s price is reduced by 20% and sales volume increases by 30%, what is the percentage change in total revenue? (Enter only the number, as a percentage. Use positive for increase, negative for decrease)',
    correctAnswer: 4
  },
  {
    id: 24,
    type: 'text',
    question: 'What is the difference between descriptive analytics and predictive analytics? Provide a brief example of each in the context of e-commerce.',
    maxLength: 200
  },
  {
    id: 25,
    type: 'mcq',
    question: 'In a time series analysis, if sales show a consistent upward trend with seasonal variations, which forecasting method would be most appropriate?',
    options: [
      'Simple moving average',
      'Exponential smoothing with trend and seasonality',
      'Linear regression only',
      'Random walk model'
    ],
    correctAnswer: 1
  }
]

export function getQuestionById(id) {
  return questions.find(q => q.id === parseInt(id))
}

export function getTotalQuestions() {
  return questions.length
}

