# 🔐 Stripe Payment Integration Guide

## ⚠️ Problem: Windows Blocking `stripe.exe`

Windows Defender or your antivirus is blocking `stripe.exe` as a harmful file. This is a false positive, but here are your options:

---

## **Solution 1: Use Stripe Dashboard (Recommended for Testing)**

Instead of using the Stripe CLI, you can test webhooks directly from your Stripe Dashboard:

### **Steps:**

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter your webhook URL**:
   ```
   https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook
   ```

4. **Select events to listen for**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Click "Add endpoint"**

6. **Copy the Signing Secret** (starts with `whsec_...`)

7. **Add to Supabase**:
   - Go to: https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/settings/functions
   - Add secret: `STRIPE_WEBHOOK_SECRET` = `whsec_your_secret_here`

8. **Test it**:
   - In Stripe Dashboard, go to your webhook endpoint
   - Click "Send test webhook"
   - Select event type: `checkout.session.completed`
   - Click "Send test webhook"
   - You should see a **200 Success** response!

---

## **Solution 2: Unblock stripe.exe (Windows)**

If you want to use the Stripe CLI:

### **Option A: Windows Defender Exception**

1. Open **Windows Security** (search in Start menu)
2. Go to **Virus & threat protection**
3. Click **Manage settings** under "Virus & threat protection settings"
4. Scroll to **Exclusions**
5. Click **Add or remove exclusions**
6. Click **Add an exclusion** → **File**
7. Browse to `C:\Users\cnikh\Downloads\Om\stripe.exe`
8. Click **Open**

### **Option B: SmartScreen Override**

1. Right-click `stripe.exe`
2. Select **Properties**
3. Check **Unblock** at the bottom
4. Click **OK**
5. Try running again

### **Option C: Download from Official Source**

Sometimes re-downloading helps:

1. Go to: https://github.com/stripe/stripe-cli/releases/latest
2. Download `stripe_X.X.X_windows_x86_64.zip`
3. Extract to a new folder
4. Try running the new `stripe.exe`

---

## **Solution 3: Use WSL (Windows Subsystem for Linux)**

If you have WSL installed:

```bash
# Install Stripe CLI in WSL
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook
```

---

## **Testing Your Payment Flow Without Stripe CLI**

You can test your entire payment flow without the Stripe CLI:

### **1. Test in Your React Native App**

1. Make sure your Stripe publishable key is set in your app
2. Run your app and go through the payment flow
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future expiry date, any 3-digit CVC
5. Any ZIP code

### **2. Check Stripe Dashboard**

After creating a test payment:

1. Go to https://dashboard.stripe.com/test/payments
2. You'll see your test payment
3. Go to https://dashboard.stripe.com/test/webhooks
4. Click on your endpoint
5. View recent webhook deliveries
6. Should show **200 OK** responses

### **3. Check Supabase Logs**

1. Go to https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/functions
2. Click on `stripe-webhook`
3. View the **Logs** tab
4. You'll see webhook events being processed

---

## **Quick Setup Checklist**

- [ ] Webhook function deployed to Supabase
- [ ] `STRIPE_SECRET_KEY` set in Supabase secrets
- [ ] `STRIPE_WEBHOOK_SECRET` set in Supabase secrets
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Webhook events selected (checkout.session.completed, etc.)
- [ ] Test webhook sent from Stripe Dashboard
- [ ] Test payment made in your app
- [ ] Check webhook logs in Supabase

---

## **🎉 Success!**

Once you see **200 OK** responses in your Stripe Dashboard webhook logs, your integration is working perfectly!

Your users can now:
- ✅ Complete checkout sessions
- ✅ Subscribe to plans
- ✅ Have their subscriptions tracked
- ✅ Receive invoice notifications

**No Stripe CLI needed for production!** The CLI is only for local testing. For your deployed app, the Stripe Dashboard webhook is the way to go.
