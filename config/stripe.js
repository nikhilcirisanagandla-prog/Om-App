// Stripe Configuration for Om App
// Replace these with your actual Stripe Price IDs from Stripe Dashboard

export const STRIPE_CONFIG = {
  // TODO: Replace with your actual Price IDs from Stripe Dashboard
  // Get these from: https://dashboard.stripe.com/test/products
  priceIds: {
    monthly: 'price_xxxxxxxxxxxxx', // Replace with your Monthly Plan Price ID
    yearly: 'price_xxxxxxxxxxxxx',  // Replace with your Yearly Plan Price ID
  },
  
  // Return URLs for payment success/cancel
  returnUrls: {
    success: 'yourapp://payment-success',
    cancel: 'yourapp://payment-cancelled',
  },
};

// Instructions:
// 1. Go to https://dashboard.stripe.com/test/products
// 2. Create two products (Monthly $9.99 and Yearly $24.99)
// 3. Copy the Price IDs (they start with "price_")
// 4. Replace the xxxxxxxxxxxxx above with your actual Price IDs
// 5. See STRIPE_SETUP_GUIDE.md for detailed instructions
