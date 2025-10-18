# Fix Supabase CLI Issues on Windows

## The Problem
```
'"C:\Users\cnikh\AppData\Local\npm-cache\_npx\aa8e5c70f9d8d161\node_modules\.bin\\..\supabase\bin\supabase.exe"' is not recognized as an internal or external command
```

This is a known issue with `npx supabase` on Windows due to path handling problems.

## Solutions (Choose One)

### ✅ Solution 1: Install via Scoop (RECOMMENDED)

This is the official and most reliable method for Windows.

```powershell
# 1. Install Scoop (if you don't have it)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 2. Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 3. Verify installation
supabase --version

# 4. Now you can use it directly
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
```

### ✅ Solution 2: Install via Chocolatey

```powershell
# 1. Install Chocolatey (if you don't have it)
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. Install Supabase CLI
choco install supabase

# 3. Verify and use
supabase --version
supabase functions deploy
```

### ✅ Solution 3: Use NPM Scripts (Quick Fix)

This solution uses npm scripts which handle paths better:

```powershell
# 1. Install Supabase CLI locally in your project
npm install supabase --save-dev

# 2. Use the npm scripts I've added to package.json
npm run supabase:deploy-all
npm run supabase:deploy-webhook
npm run supabase:deploy-checkout
npm run supabase:logs
```

### ✅ Solution 4: Manual Download

If package managers don't work:

1. Download the Windows binary from: https://github.com/supabase/cli/releases/latest
2. Look for `supabase_windows_amd64.zip`
3. Extract it to a folder (e.g., `C:\supabase`)
4. Add that folder to your PATH:
   - Open System Properties → Environment Variables
   - Edit PATH and add `C:\supabase`
   - Restart PowerShell
5. Use: `supabase functions deploy`

### ✅ Solution 5: Use WSL (Windows Subsystem for Linux)

If you have WSL installed:

```bash
# In WSL terminal
curl -sL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xz
sudo mv supabase /usr/local/bin/supabase

# Navigate to your project
cd /mnt/c/Users/cnikh/Downloads/Om

# Deploy
supabase functions deploy
```

## After Installation

Once you have Supabase CLI working, follow these steps:

### 1. Login to Supabase
```powershell
supabase login
```

### 2. Link Your Project
```powershell
supabase link --project-ref fabgigjxgczadxokjxte
```

### 3. Set Stripe Secrets

Get your Stripe keys from: https://dashboard.stripe.com/test/apikeys

```powershell
# Set your Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx

# Set webhook secret (you'll get this after creating webhook in Step 4)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 4. Deploy Functions
```powershell
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
```

### 5. Configure Stripe Webhook

After deployment, set up the webhook in Stripe:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - ✓ `checkout.session.completed`
   - ✓ `customer.subscription.updated`
   - ✓ `customer.subscription.deleted`
   - ✓ `invoice.payment_succeeded`
   - ✓ `invoice.payment_failed`
5. Copy the signing secret (starts with `whsec_`)
6. Set it: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
7. Redeploy webhook function: `supabase functions deploy stripe-webhook`

## Verify Deployment

```powershell
# List all functions
supabase functions list

# View logs
supabase functions logs stripe-webhook
supabase functions logs create-checkout-session

# Test the functions
# (Use the examples in DEPLOYMENT_GUIDE.md)
```

## Quick Reference

```powershell
# View all commands
supabase --help

# Function-specific help
supabase functions --help

# Check status
supabase status

# View function details
supabase functions list

# Stream logs in real-time
supabase functions logs stripe-webhook --follow
```

## Still Having Issues?

If none of these work:

1. **Use the Supabase Dashboard**:
   - Go to your project: https://supabase.com/dashboard/project/fabgigjxgczadxokjxte
   - Navigate to Edge Functions
   - Click "Deploy new function"
   - Upload your function code manually

2. **Use GitHub Actions**:
   - Set up CI/CD to deploy automatically
   - I can help you set this up if needed

3. **Contact me**: Share the error message and I'll help troubleshoot further.

## Pro Tips

- Use `supabase start` to test functions locally before deploying
- Use `supabase functions serve stripe-webhook` to test a specific function
- Add `--debug` flag to any command for verbose output: `supabase functions deploy --debug`
- Keep your Supabase CLI updated: `scoop update supabase` or `choco upgrade supabase`
