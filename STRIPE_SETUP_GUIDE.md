# Stripe Setup Guide for Om App

## 🚨 CRITICAL: Create Stripe Products First

Before your app can process payments, you MUST create products and prices in Stripe.

## Step 1: Create Stripe Products (Test Mode)

1. Go to: https://dashboard.stripe.com/test/products
2. Click **"Add product"**

### Product 1: Monthly Subscription
- **Name:** Om App - Occuring Moments
- **Description:** Monthly spiritual guidance subscription
- **Pricing:**
  - **Model:** Recurring
  - **Price:** $9.99 USD
  - **Billing period:** Monthly
- Click **"Save product"**
- **COPY THE PRICE ID** (starts with `price_` like `price_1AbC2dEfGhIjKlMn`)

### Product 2: Yearly Subscription
- **Name:** Om App - Divine Life
- **Description:** Yearly spiritual guidance subscription (79% savings)
- **Pricing:**
  - **Model:** Recurring
  - **Price:** $24.99 USD
  - **Billing period:** Yearly
- Click **"Save product"**
- **COPY THE PRICE ID** (starts with `price_`)

## Step 2: Add Price IDs to Your App

Create a config file with your Stripe Price IDs:

```javascript
// config/stripe.js
export const STRIPE_PRICE_IDS = {
  monthly: 'price_xxxxxxxxxxxxx', // Replace with your actual Price ID
  yearly: 'price_xxxxxxxxxxxxx',  // Replace with your actual Price ID
};
```

## Step 3: Database Schema Required

Your `user_profiles` table needs these columns:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS onboardingCompleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS isPremium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscriptionPlan TEXT,
ADD COLUMN IF NOT EXISTS stripeSubscriptionId TEXT,
ADD COLUMN IF NOT EXISTS stripeCustomerId TEXT,
ADD COLUMN IF NOT EXISTS nextDueDate TIMESTAMP,
ADD COLUMN IF NOT EXISTS trialStartDate TIMESTAMP,
ADD COLUMN IF NOT EXISTS trialEndDate TIMESTAMP,
ADD COLUMN IF NOT EXISTS quiz_answers JSONB;
```

## Step 4: Configure Stripe Secrets in Supabase

```bash
# Set your Stripe secret key (from https://dashboard.stripe.com/test/apikeys)
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here

# Set webhook secret (from Step 5)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

## Step 5: Configure Stripe Webhook (REQUIRED)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. URL: `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook`
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Set it: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

## Step 6: Test Payment Flow

### Test Cards (Always use test mode):
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Auth:** 4000 0025 0000 3155

Use any future date for expiry, any 3-digit CVC, any ZIP.

## Production Checklist

When ready to go live:

1. ✅ Switch Stripe dashboard to **Live mode**
2. ✅ Create LIVE products and prices
3. ✅ Update Price IDs in app config
4. ✅ Get LIVE API keys from https://dashboard.stripe.com/apikeys
5. ✅ Update Supabase secrets with LIVE keys
6. ✅ Create LIVE webhook endpoint
7. ✅ Test with REAL card (small amount first!)
8. ✅ Set up proper customer support email

## Troubleshooting

### "No such price" error
- You haven't created products in Stripe
- Price ID is wrong/not copied correctly
- Using test Price ID in live mode (or vice versa)

### "Authentication required" error
- Missing Authorization header in API call
- User not logged in
- Invalid session token

### Webhook not receiving events
- Webhook URL is wrong
- Signing secret not set
- Events not selected in webhook configuration

### Database error
- Missing columns in user_profiles table
- Run the SQL from Step 3
