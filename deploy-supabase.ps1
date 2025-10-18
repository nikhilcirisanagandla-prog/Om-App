# PowerShell script to deploy Supabase functions on Windows
# Run this script: .\deploy-supabase.ps1

Write-Host "=== Supabase Functions Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseExists = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseExists) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Supabase CLI first. Choose one method:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 1 - Scoop (Recommended):" -ForegroundColor Green
    Write-Host "  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    Write-Host "  scoop install supabase"
    Write-Host ""
    Write-Host "Method 2 - Chocolatey:" -ForegroundColor Green
    Write-Host "  choco install supabase"
    Write-Host ""
    Write-Host "Method 3 - NPM:" -ForegroundColor Green
    Write-Host "  npm install supabase --save-dev"
    Write-Host "  Then use: npm run supabase:deploy-all"
    Write-Host ""
    Write-Host "See WINDOWS_SUPABASE_FIX.md for detailed instructions." -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Check if project is linked
Write-Host "Checking project link..." -ForegroundColor Yellow
$linkStatus = supabase status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Project not linked. Linking now..." -ForegroundColor Yellow
    supabase link --project-ref fabgigjxgczadxokjxte
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link project. Please run: supabase login" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Project linked" -ForegroundColor Green
Write-Host ""

# Check for Stripe secrets
Write-Host "⚠️  IMPORTANT: Make sure you've set your Stripe secrets:" -ForegroundColor Yellow
Write-Host "  supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx" -ForegroundColor White
Write-Host "  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx" -ForegroundColor White
Write-Host ""
$continue = Read-Host "Have you set the Stripe secrets? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Please set the secrets first, then run this script again." -ForegroundColor Yellow
    exit 0
}

# Deploy functions
Write-Host ""
Write-Host "Deploying functions..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Deploying stripe-webhook..." -ForegroundColor Yellow
supabase functions deploy stripe-webhook
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ stripe-webhook deployed successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to deploy stripe-webhook" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Deploying create-checkout-session..." -ForegroundColor Yellow
supabase functions deploy create-checkout-session
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ create-checkout-session deployed successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to deploy create-checkout-session" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure Stripe webhook at: https://dashboard.stripe.com/test/webhooks" -ForegroundColor White
Write-Host "   URL: https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook" -ForegroundColor White
Write-Host ""
Write-Host "2. Select these events:" -ForegroundColor White
Write-Host "   - checkout.session.completed" -ForegroundColor White
Write-Host "   - customer.subscription.updated" -ForegroundColor White
Write-Host "   - customer.subscription.deleted" -ForegroundColor White
Write-Host "   - invoice.payment_succeeded" -ForegroundColor White
Write-Host "   - invoice.payment_failed" -ForegroundColor White
Write-Host ""
Write-Host "3. Copy the webhook signing secret and set it:" -ForegroundColor White
Write-Host "   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx" -ForegroundColor White
Write-Host ""
Write-Host "4. View function logs:" -ForegroundColor White
Write-Host "   supabase functions logs stripe-webhook" -ForegroundColor White
Write-Host "   supabase functions logs create-checkout-session" -ForegroundColor White
Write-Host ""
