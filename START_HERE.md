# 🚀 START HERE - Fix Your Om App Now!

## Your 3 Critical Errors:

1. ❌ **Database error** when creating accounts
2. ❌ **13 Supabase issues**
3. ❌ **Free trial/payment errors**

## ✅ Fix in 5 Minutes:

### 1️⃣ Fix Database (2 minutes)

**Go here NOW:** https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/editor

Click **SQL Editor** → **New Query** → Copy/Paste/Run this:

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS onboardingCompleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS isPremium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscriptionPlan TEXT,
ADD COLUMN IF NOT EXISTS stripeSubscriptionId TEXT,
ADD COLUMN IF NOT EXISTS stripeCustomerId TEXT,
ADD COLUMN IF NOT EXISTS nextDueDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trialStartDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trialEndDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS quiz_answers JSONB;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

**✅ Done! Database fixed. Your "13 issues" should be gone.**

---

### 2️⃣ Test Your App (1 minute)

```bash
# Restart Expo
npx expo start --clear
```

**Test:** Try creating a new account → Should work now! ✅

---

### 3️⃣ Setup Stripe for Payments (2 minutes) - OPTIONAL

**Only do this if you want payment integration!**

#### A. Create Products in TEST MODE:

Go to: https://dashboard.stripe.com/test/products

**Product 1:**
- Name: Om App Monthly
- Price: $9.99 recurring monthly
- **Copy Price ID:** `price_xxxxx`

**Product 2:**
- Name: Om App Yearly  
- Price: $24.99 recurring yearly
- **Copy Price ID:** `price_xxxxx`

#### B. Update Config:

Edit `config/stripe.js`:
```javascript
priceIds: {
  monthly: 'price_xxxxx', // Your monthly Price ID
  yearly: 'price_xxxxx',  // Your yearly Price ID
}
```

#### C. Set Secrets:

```bash
# Get keys from: https://dashboard.stripe.com/test/apikeys
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx

# Get from: https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/settings/api
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Get after creating webhook (next step)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### D. Setup Webhook:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
4. Copy signing secret → Run: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

#### E. Redeploy:

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

**✅ Done! Stripe is ready.**

---

## 🧪 Test Everything

### Test 1: Account Creation
- Create new account
- **Result:** Should work ✅

### Test 2: Onboarding
- Complete onboarding
- **Result:** No database errors ✅

### Test 3: Free Trial (if using payment version)
- Click "3-Day Free Trial"
- **Result:** Should activate ✅

### Test 4: Stripe Payment (if configured)
- Use test card: `4242 4242 4242 4242`
- **Result:** Should complete checkout ✅

---

## 📖 Questions?

**"Do I need Stripe for my app to work?"**
- NO! Database fix (Step 1) makes accounts work
- Stripe is only for payments/subscriptions

**"What about those payment links I created?"**
- Don't use payment links
- Use Price IDs instead (from products page)

**"Test mode or live mode?"**
- Always use TEST MODE for development
- Switch to live when launching

**"My OnboardingScreen doesn't have payment code?"**
- Your current file is basic version
- The error you showed has payment code
- You may have two different versions

**"Still getting errors?"**
- Read: `FIX_DATABASE_NOW.md`
- Or: `COMPLETE_FIX_SUMMARY.md`
- Or ask me!

---

## 📁 All Documentation Created:

1. **`START_HERE.md`** ← You are here! Quick start guide
2. **`FIX_DATABASE_NOW.md`** - Detailed database fix
3. **`COMPLETE_FIX_SUMMARY.md`** - All fixes explained
4. **`STRIPE_SETUP_GUIDE.md`** - Stripe setup details
5. **`DEPLOYMENT_SUCCESS.md`** - Function deployment info
6. **`config/stripe.js`** - Stripe config (update Price IDs!)
7. **`supabase/migrations/001_add_subscription_columns.sql`** - Database migration

---

## ⚡ Quick Summary:

- ✅ Your Supabase functions are deployed and live
- ✅ Webhook now updates database automatically
- ⚠️ Database needs migration (SQL above)
- ⚠️ Stripe needs Price IDs (if using payments)

**Do Step 1 (SQL) now → Test → Then configure Stripe if needed!** 🚀
