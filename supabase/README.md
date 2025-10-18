# Om App - Supabase Edge Functions

This directory contains Supabase Edge Functions for handling Stripe payments and webhooks.

## 📁 Functions

### 1. `stripe-webhook`
Handles incoming Stripe webhook events to keep your database in sync with Stripe.

**Events handled:**
- ✅ `checkout.session.completed` - User completes checkout
- ✅ `customer.subscription.updated` - Subscription changes
- ✅ `customer.subscription.deleted` - Subscription cancelled
- ✅ `invoice.payment_succeeded` - Successful payment
- ✅ `invoice.payment_failed` - Failed payment

**Endpoint:** `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook`

### 2. `create-checkout-session`
Creates a Stripe Checkout session for user subscriptions.

**Features:**
- 🔒 Requires user authentication
- 💳 Creates Stripe checkout session
- 🔄 Returns checkout URL for redirect

**Endpoint:** `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/create-checkout-session`

## 🚀 Quick Start

### Windows Users
```powershell
# Install Supabase CLI (choose one method)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or use the deployment script
.\deploy-supabase.ps1
```

### Linux/Mac Users
```bash
# Make script executable and run
chmod +x deploy-supabase.sh
./deploy-supabase.sh
```

### Using NPM Scripts
```bash
# Install Supabase locally
npm install supabase --save-dev

# Deploy using npm scripts
npm run supabase:link          # Link project
npm run supabase:deploy-all    # Deploy all functions
npm run supabase:logs          # View logs
npm run supabase:list          # List functions
```

## 📚 Documentation

- **WINDOWS_SUPABASE_FIX.md** - Complete guide for fixing Windows CLI issues (5 different solutions)
- **DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
- **.env.example** - Example environment variables

## 🔐 Required Secrets

Set these secrets before deploying:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## 💡 Usage Examples

### Create Checkout Session (from your React Native app)

```javascript
import { supabase } from './utils/supabase';

async function subscribeToPremium() {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Create checkout session
    const response = await fetch(
      'https://fabgigjxgczadxokjxte.supabase.co/functions/v1/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId: 'price_xxxxx', // Your Stripe Price ID
          successUrl: 'yourapp://success',
          cancelUrl: 'yourapp://cancel',
        }),
      }
    );

    const { url, sessionId } = await response.json();
    
    // Open Stripe Checkout
    // For React Native, use Linking or WebBrowser
    import { Linking } from 'react-native';
    await Linking.openURL(url);
    
  } catch (error) {
    console.error('Subscription error:', error);
  }
}
```

### Testing Webhooks Locally

```bash
# Install Stripe CLI
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## 🔍 Monitoring

```bash
# View real-time logs
supabase functions logs stripe-webhook --follow
supabase functions logs create-checkout-session --follow

# List all deployed functions
supabase functions list

# Check function status
supabase status
```

## 🛠️ Development

### Local Testing

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve stripe-webhook --env-file .env.local
supabase functions serve create-checkout-session --env-file .env.local
```

### Update Functions

```bash
# Deploy after making changes
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
```

## 📋 Checklist

- [ ] Install Supabase CLI
- [ ] Link project: `supabase link --project-ref fabgigjxgczadxokjxte`
- [ ] Get Stripe API keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- [ ] Set Stripe secrets in Supabase
- [ ] Deploy functions
- [ ] Create webhook endpoint in [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
- [ ] Copy webhook signing secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Supabase
- [ ] Test checkout flow
- [ ] Test webhook events

## 🆘 Troubleshooting

### Function not deploying?
```bash
# Add debug flag
supabase functions deploy stripe-webhook --debug

# Check if linked correctly
supabase status
```

### Webhook not receiving events?
1. Check webhook URL in Stripe Dashboard
2. Verify webhook secret is set correctly
3. Check function logs: `supabase functions logs stripe-webhook`
4. Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Windows CLI issues?
See **WINDOWS_SUPABASE_FIX.md** for 5 different solutions.

## 📞 Support

- Supabase Docs: https://supabase.com/docs/guides/functions
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Supabase CLI: https://github.com/supabase/cli

## 🎯 Next Steps

After deployment:
1. Create Stripe Products and Prices
2. Update database schema for subscriptions
3. Add subscription UI to your app
4. Test the complete payment flow
5. Switch to production keys for live deployment
