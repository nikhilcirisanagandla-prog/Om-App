# ✅ Deployment Successful!

## 🚀 Functions Deployed

Both Supabase Edge Functions have been successfully deployed to your project!

### Function URLs

**1. Stripe Webhook Handler**
```
https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook
```

**2. Create Checkout Session**
```
https://fabgigjxgczadxokjxte.supabase.co/functions/v1/create-checkout-session
```

### View in Dashboard
https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/functions

---

## 🔐 CRITICAL NEXT STEPS

### 1. Set Your Stripe Secrets

You **MUST** set these secrets before the functions will work:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

**Get your Stripe keys:**
- Secret Key: https://dashboard.stripe.com/test/apikeys
- Webhook Secret: You'll get this in step 2

### 2. Configure Stripe Webhook

**Set up the webhook endpoint in Stripe:**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter URL:
   ```
   https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Set it:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### 3. Redeploy After Setting Secrets

After setting your secrets, you should redeploy the webhook function:

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

---

## 💻 Using the Functions in Your App

### Example: Create a Checkout Session

Add this to your React Native app:

```javascript
import { supabase } from './utils/supabase';
import { Linking } from 'react-native';

async function subscribeToPremium() {
  try {
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    // Call the function to create a checkout session
    const response = await fetch(
      'https://fabgigjxgczadxokjxte.supabase.co/functions/v1/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId: 'price_xxxxx', // Replace with your Stripe Price ID
          successUrl: 'yourapp://payment-success',
          cancelUrl: 'yourapp://payment-cancelled',
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      Alert.alert('Error', data.error);
      return;
    }

    // Open Stripe Checkout in browser
    await Linking.openURL(data.url);
    
  } catch (error) {
    console.error('Subscription error:', error);
    Alert.alert('Error', 'Failed to start checkout');
  }
}
```

### Example: Button Component

```javascript
import { Button, Alert } from 'react-native';

function SubscribeButton() {
  return (
    <Button
      title="Subscribe to Premium"
      onPress={subscribeToPremium}
    />
  );
}
```

---

## 🧪 Testing

### Test the Webhook Function

```bash
# View real-time logs
supabase functions logs stripe-webhook --follow

# In another terminal, trigger a test event from Stripe CLI
stripe trigger checkout.session.completed
```

### Test the Checkout Function

You can test it with curl:

```bash
# First, get a user access token from your app
# Then test:
curl -X POST \
  https://fabgigjxgczadxokjxte.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_xxxxx",
    "successUrl": "https://yourapp.com/success",
    "cancelUrl": "https://yourapp.com/cancel"
  }'
```

---

## 📊 Monitoring

### View Logs

```bash
# Stream logs for webhook function
supabase functions logs stripe-webhook --follow

# Stream logs for checkout function
supabase functions logs create-checkout-session --follow

# View specific number of recent logs
supabase functions logs stripe-webhook --limit 50
```

### Check Function Status

```bash
# List all functions
supabase functions list

# View function details in dashboard
# https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/functions
```

---

## 🎯 Complete Setup Checklist

- [x] ✅ Functions deployed
- [ ] ⚠️ Set `STRIPE_SECRET_KEY` secret
- [ ] ⚠️ Create Stripe webhook endpoint
- [ ] ⚠️ Set `STRIPE_WEBHOOK_SECRET` secret
- [ ] ⚠️ Redeploy webhook function
- [ ] Create Stripe products and prices
- [ ] Integrate checkout into your app
- [ ] Test checkout flow
- [ ] Test webhook events
- [ ] Handle subscription status in your database

---

## 🔄 Updating Functions

When you make changes to the function code:

```bash
# Deploy specific function
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session

# Or deploy all functions
supabase functions deploy
```

---

## 🆘 Troubleshooting

### Function returning errors?
- Check secrets are set: `supabase secrets list`
- View logs: `supabase functions logs stripe-webhook`
- Verify Stripe keys are correct

### Webhook not receiving events?
- Verify webhook URL in Stripe Dashboard
- Check signing secret is correct
- Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Checkout session not creating?
- Ensure user is authenticated
- Verify Stripe Price ID exists
- Check function logs for errors

---

## 📞 Support Resources

- **Supabase Functions Docs:** https://supabase.com/docs/guides/functions
- **Stripe Webhooks Guide:** https://stripe.com/docs/webhooks
- **Your Function Dashboard:** https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/functions
- **Stripe Dashboard:** https://dashboard.stripe.com/test/webhooks

---

## 🎉 You're All Set!

Your Supabase Edge Functions are deployed and ready to handle Stripe payments!

**Next:** Set your Stripe secrets and configure the webhook endpoint in Stripe.

Need help? Check the documentation files in your project:
- `WINDOWS_SUPABASE_FIX.md` - CLI troubleshooting
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `supabase/README.md` - Functions documentation
