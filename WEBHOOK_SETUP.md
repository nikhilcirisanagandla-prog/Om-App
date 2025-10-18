# 🎯 Fix Your Stripe Webhook 401 Errors

## **The Problem**
Your webhook function needs to verify Stripe's signature, but it's not deployed with the correct secret yet.

## **The Solution - Follow These Steps:**

### **Step 1: Set Your Webhook Secret in Supabase**

Your current webhook signing secret is:
```
whsec_8f379d0a544d773fffe5586fe72db5a5deed7cac2d30e6399b11c011e88e128e
```

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/fabgigjxgczadxokjxte
2. Click **Edge Functions** in the left sidebar
3. Click **Manage secrets** (top right)
4. Add these environment variables:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_8f379d0a544d773fffe5586fe72db5a5deed7cac2d30e6399b11c011e88e128e`
   
5. Also add your Stripe secret key if not already set:
   - Name: `STRIPE_SECRET_KEY`
   - Value: Your Stripe secret key (starts with `sk_test_...`)

### **Step 2: Deploy the Webhook Function**

In your terminal (in the Om directory):

```bash
npx supabase functions deploy stripe-webhook
```

If you don't have the Supabase CLI installed:
```bash
npm install -g supabase
npx supabase login
npx supabase link --project-ref fabgigjxgczadxokjxte
npx supabase functions deploy stripe-webhook
```

### **Step 3: Test Again**

1. Keep your Stripe CLI running:
```bash
.\stripe.exe listen --forward-to https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook
```

2. In a new terminal, trigger a test event:
```bash
.\stripe.exe trigger checkout.session.completed
```

3. You should now see `[200]` instead of `[401]`! ✅

---

## **Important Notes:**

⚠️ **The webhook secret changes each time you restart the Stripe CLI!**
- Every time you run `stripe listen`, you get a NEW `whsec_...` secret
- You need to update it in Supabase dashboard each time
- For production, you'll use the webhook secret from your Stripe Dashboard (not CLI)

### **For Production (Later):**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen to
4. Copy the signing secret and update in Supabase

---

## **Verification Checklist:**
- [ ] Webhook secret added to Supabase
- [ ] Stripe secret key added to Supabase
- [ ] Function deployed successfully
- [ ] Test shows `[200]` responses
- [ ] No more `[401]` errors

**Once you see 200 responses, your webhook is working!** 🎉
