export const PLAN_PRICING = {
  starter: {
    INR: {
      amount: 0, // Free trial
      originalAmount: 0,
      discount: 0,
      durationInDays: 3,
    },
    USD: {
      amount: 0, // Free trial
      originalAmount: 0,
      discount: 0,
      durationInDays: 3,
    }
  },
  fifteen: {
    INR: {
      amount: 17900, // ₹179 in paise
      originalAmount: 17900,
      discount: 0,
      durationInDays: 15,
    },
    USD: {
      amount: 199, // $1.99 in cents
      originalAmount: 199,
      discount: 0,
      durationInDays: 15,
    }
  },
  monthly: {
    INR: {
      amount: 29900, // ₹299 in paise (after 40% discount)
      originalAmount: 50000, // ₹500 in paise
      discount: 40, // 40% off
      durationInDays: 30,
    },
    USD: {
      amount: 499, // $4.99 in cents
      originalAmount: 499,
      discount: 0,
      durationInDays: 30,
    }
  },
  yearly: {
    INR: {
      amount: 200000, // ₹2000 in paise
      originalAmount: 200000,
      discount: 0,
      durationInDays: 365,
    },
    USD: {
      amount: 3999, // $39.99 in cents
      originalAmount: 3999,
      discount: 0,
      durationInDays: 365,
    }
  },
};

// Helper function to get pricing based on currency
export const getPlanPricing = (planType, currency = 'INR') => {
  const plan = PLAN_PRICING[planType];
  if (!plan) {
    throw new Error(`Invalid plan type: ${planType}`);
  }

  const pricing = plan[currency];
  if (!pricing) {
    throw new Error(`Invalid currency: ${currency}`);
  }

  return pricing;
};
