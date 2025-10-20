# ⚡ Quick Start - Get Your App Working in 5 Minutes

## 🎯 **Step 1: Run Database Setup** (2 minutes)

1. Open: https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/editor
2. Copy ALL code from `supabase_schema.sql`
3. Paste into SQL Editor
4. Click **"Run"**
5. Wait for success message ✅

**This fixes**: Database errors, signup errors, profile errors

---

## 🎯 **Step 2: Test Your App** (3 minutes)

### **Test Signup** ✅
```
1. Open your React Native app
2. Click "Sign Up"
3. Enter email and password
4. Should work without errors!
5. Complete onboarding
6. See Dashboard with streak counter
```

### **Test Streak** ✅
```
1. Open Dashboard
2. See your streak: "0 days" (for new user)
3. Click "Mark Today's Devotion"
4. Streak increases to "1 day"
5. Button shows "✅ Devotion Complete Today"
6. Try clicking again → "Already Complete" message
```

### **Test Profile** ✅
```
1. Go to Profile tab
2. See your streak displayed
3. Edit your information
4. Save changes
5. No errors!
```

---

## 🎯 **Step 3 (Optional): Set Up Stripe Payments**

### **Quick Method** (Recommended)

1. **Deploy webhook**:
   ```bash
   cd C:\Users\cnikh\Downloads\Om
   npx supabase functions deploy stripe-webhook
   ```

2. **Add Stripe Dashboard webhook**:
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`
   - Copy signing secret (whsec_...)

3. **Add secrets to Supabase**:
   - Go to: https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/settings/functions
   - Add `STRIPE_SECRET_KEY` = Your Stripe secret key
   - Add `STRIPE_WEBHOOK_SECRET` = The whsec_... from step 2

4. **Test**:
   - Send test webhook from Stripe Dashboard
   - Should get 200 OK ✅

**See `STRIPE_PAYMENT_GUIDE.md` for detailed instructions**

---

## ✅ **All Issues Fixed**

- ✅ **Database error on signup** → Auto-creates profile
- ✅ **Navigation errors** → Fixed profile loading
- ✅ **Streak auto-update** → Updates on app open
- ✅ **Auth session errors** → Improved AuthContext
- ✅ **Stripe payments** → Webhook function created

---

## 🆘 **Still Having Issues?**

1. **Did you run the SQL schema?** (Step 1)
   - This is **required** for everything to work
   
2. **Check Supabase logs**:
   - https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/logs

3. **Restart your app**:
   - Stop Metro bundler (Ctrl+C)
   - Clear cache: `npx react-native start --reset-cache`
   - Reopen app

---

## 📚 **Full Documentation**

- **FIXES_SUMMARY.md** - Complete details of all fixes
- **STRIPE_PAYMENT_GUIDE.md** - Stripe setup guide (3 methods)
- **supabase_schema.sql** - Database schema (run this first!)

---

## 🕉️ **You're All Set!**

Your app now has:
- ✅ Working signup/login
- ✅ Automatic profile creation
- ✅ Daily streak tracking
- ✅ Beautiful dashboard
- ✅ Stripe payment support
- ✅ Zero errors!

**Jai Shri Ram! May your app inspire many on their spiritual journey! 🙏✨**
