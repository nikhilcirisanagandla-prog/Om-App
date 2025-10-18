# Stripe Webhook Deployment Guide

## 🚀 Your webhook function is ready! Now follow these steps:

### **Step 1: Set Environment Variables in Supabase**

You need to add two environment secrets to your Supabase project:

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project** (fabgigjxgczadxokjxte)
3. **Go to**: Settings → Edge Functions → Add new secret

**Add these two secrets:**

#### Secret 1: STRIPE_SECRET_KEY
- **Name**: `STRIPE_SECRET_KEY`
- **Value**: Your Stripe secret key (starts with `sk_test_...`)
  - Find it at: https://dashboard.stripe.com/test/apikeys

#### Secret 2: STRIPE_WEBHOOK_SECRET
- **Name**: `STRIPE_WEBHOOK_SECRET`
- **Value**: `whsec_8f379d0a544d773fffe5586fe72db5a5deed7cac2d30e6399b11c011e88e128e`
  - ⚠️ **IMPORTANT**: This is the webhook signing secret from your Stripe CLI output
  - When you deploy to production, you'll get a different secret from Stripe Dashboard

---

### **Step 2: Deploy the Function to Supabase**

1. **Install Supabase CLI** (if not already installed):
```bash
npm install -g supabase
```

2. **Login to Supabase**:
```bash
supabase login
```

3. **Link your project**:
```bash
supabase link --project-ref fabgigjxgczadxokjxte
```

4. **Deploy the webhook function**:
```bash
supabase functions deploy stripe-webhook
```

---

### **Step 3: Test the Webhook**

After deployment, restart your Stripe CLI:

```bash
.\stripe.exe listen --forward-to https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook
```

Then trigger a test event:

```bash
.\stripe.exe trigger checkout.session.completed
```

**You should now see**:
- ✅ `[200]` responses instead of `[401]`
- ✅ "Received event: checkout.session.completed" in logs

---

### **Step 4: Verify Everything Works**

Run this to see your function logs:
```bash
supabase functions logs stripe-webhook
```

---

## 🎯 **What We Fixed**

The 401 errors were happening because:
1. ❌ The webhook function didn't exist in your codebase
2. ❌ Supabase didn't know how to verify Stripe's webhook signature

Now:
1. ✅ You have a proper webhook function that verifies signatures
2. ✅ The function handles all Stripe events
3. ✅ It's configured to work without requiring user authentication

---

## 📝 **Next Steps (After Deployment Works)**

Once you see 200 responses, you'll want to:

1. **Connect to your database** in the webhook function to:
   - Update user subscriptions when payments succeed
   - Track payment history
   - Handle subscription cancellations

2. **Update your app** to include `userId` in Stripe metadata:
```javascript
// When creating checkout session
metadata: {
  userId: user.id
}
```

3. **For production**, create a webhook endpoint in Stripe Dashboard:
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook`
   - Copy the new signing secret and update STRIPE_WEBHOOK_SECRET

---

## 🆘 **Troubleshooting**

### If deployment fails:
- Make sure Supabase CLI is installed: `npm install -g supabase`
- Try: `supabase login` again
- Check you have the correct project reference

### If still getting 401:
- Verify secrets are set in Supabase Dashboard
- Make sure the webhook secret matches your Stripe CLI output
- Check function logs: `supabase functions logs stripe-webhook`

### Need help?
- Check Supabase docs: https://supabase.com/docs/guides/functions
- Check Stripe docs: https://stripe.com/docs/webhooks
