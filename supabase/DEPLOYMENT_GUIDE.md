# Supabase Edge Functions Deployment Guide

## Prerequisites

1. Supabase CLI installed
2. Stripe account with API keys
3. Supabase project created

## Setup Instructions

### 1. Link your Supabase project

```bash
supabase link --project-ref fabgigjxgczadxokjxte
```

### 2. Set up Stripe secrets

You need to configure these secrets in your Supabase project:

```bash
# Set your Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Set your Stripe webhook secret (get this after creating the webhook in Stripe)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Deploy the functions

```bash
# Deploy both functions
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
```

Or deploy all functions at once:
```bash
supabase functions deploy
```

### 4. Configure Stripe Webhook

After deploying the `stripe-webhook` function:

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter the webhook URL: `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook`
4. Select the events you want to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and set it:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Using the Functions in Your App

### Create Checkout Session

```javascript
import { supabase } from './utils/supabase';

async function createCheckoutSession(priceId) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    'https://fabgigjxgczadxokjxte.supabase.co/functions/v1/create-checkout-session',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        priceId: priceId, // Your Stripe price ID
        successUrl: 'yourapp://success',
        cancelUrl: 'yourapp://cancel',
      }),
    }
  );

  const { url } = await response.json();
  // Redirect user to Stripe Checkout
  window.open(url, '_blank');
}
```

## Troubleshooting

### Windows CLI Issues

If you're experiencing issues with `npx supabase` on Windows:

1. **Install Supabase CLI directly using Scoop:**
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. **Or use npm (not npx):**
   ```powershell
   # Don't install globally, use in project
   npm install supabase --save-dev
   npx supabase functions deploy
   ```

3. **Or use the Supabase Dashboard:**
   - Go to your project dashboard
   - Navigate to Edge Functions
   - You can deploy functions directly through the UI

### Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs stripe-webhook
supabase functions logs create-checkout-session
```

## Security Notes

- Never commit your `.env` file with real secrets
- Use environment variables for all sensitive data
- The webhook endpoint validates Stripe signatures for security
- The checkout session function requires user authentication
