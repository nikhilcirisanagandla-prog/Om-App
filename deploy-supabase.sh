#!/bin/bash
# Bash script to deploy Supabase functions on Linux/Mac
# Run this script: chmod +x deploy-supabase.sh && ./deploy-supabase.sh

echo "=== Supabase Functions Deployment Script ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo ""
    echo -e "${YELLOW}Installing Supabase CLI...${NC}"
    curl -sL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xz
    sudo mv supabase /usr/local/bin/supabase
    echo -e "${GREEN}✓ Supabase CLI installed${NC}"
else
    echo -e "${GREEN}✓ Supabase CLI found${NC}"
fi

echo ""

# Check if logged in
echo -e "${YELLOW}Checking authentication...${NC}"
if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Using SUPABASE_ACCESS_TOKEN environment variable${NC}"
else
    # Try to check if already logged in
    if supabase projects list &> /dev/null; then
        echo -e "${GREEN}✓ Already authenticated${NC}"
    else
        echo -e "${RED}❌ Not authenticated${NC}"
        echo ""
        echo -e "${YELLOW}Please set SUPABASE_ACCESS_TOKEN or run: supabase login${NC}"
        echo ""
        echo "To get your access token:"
        echo "1. Run: supabase login"
        echo "2. Or set: export SUPABASE_ACCESS_TOKEN=your_token"
        exit 1
    fi
fi

echo ""

# Check if project is linked
echo -e "${YELLOW}Checking project link...${NC}"
if ! supabase status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Project not linked. Linking now...${NC}"
    supabase link --project-ref fabgigjxgczadxokjxte
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to link project${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Project linked${NC}"
echo ""

# Check for Stripe secrets
echo -e "${YELLOW}⚠️  IMPORTANT: Make sure you've set your Stripe secrets:${NC}"
echo "  supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx"
echo "  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx"
echo ""
read -p "Have you set the Stripe secrets? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please set the secrets first, then run this script again.${NC}"
    exit 0
fi

# Deploy functions
echo ""
echo -e "${CYAN}Deploying functions...${NC}"
echo ""

echo -e "${YELLOW}1. Deploying stripe-webhook...${NC}"
if supabase functions deploy stripe-webhook; then
    echo -e "${GREEN}   ✓ stripe-webhook deployed successfully${NC}"
else
    echo -e "${RED}   ❌ Failed to deploy stripe-webhook${NC}"
fi

echo ""
echo -e "${YELLOW}2. Deploying create-checkout-session...${NC}"
if supabase functions deploy create-checkout-session; then
    echo -e "${GREEN}   ✓ create-checkout-session deployed successfully${NC}"
else
    echo -e "${RED}   ❌ Failed to deploy create-checkout-session${NC}"
fi

echo ""
echo -e "${CYAN}=== Deployment Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure Stripe webhook at: https://dashboard.stripe.com/test/webhooks"
echo "   URL: https://fabgigjxgczadxokjxte.supabase.co/functions/v1/stripe-webhook"
echo ""
echo "2. Select these events:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo ""
echo "3. Copy the webhook signing secret and set it:"
echo "   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx"
echo ""
echo "4. View function logs:"
echo "   supabase functions logs stripe-webhook"
echo "   supabase functions logs create-checkout-session"
echo ""
