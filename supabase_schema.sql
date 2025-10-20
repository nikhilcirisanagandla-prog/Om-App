-- Supabase Database Schema for Om Hindu Faith App
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/fabgigjxgczadxokjxte/editor

-- ============================================
-- User Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER,
  race TEXT,
  family_size INTEGER,
  goals TEXT,
  religion TEXT,
  hinduism_knowledge TEXT,
  deity TEXT,
  spiritual_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Streaks Table
-- ============================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 1,
  last_update DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own streak
CREATE POLICY "Users can view own streak"
  ON streaks
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own streak
CREATE POLICY "Users can insert own streak"
  ON streaks
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own streak
CREATE POLICY "Users can update own streak"
  ON streaks
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Subscriptions Table (for Stripe)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- Function: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers for auto-updating timestamps
-- ============================================
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_streaks_updated_at ON streaks;
CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  
  INSERT INTO public.streaks (id, count, last_update, created_at, updated_at)
  VALUES (NEW.id, 0, CURRENT_DATE, NOW(), NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;
GRANT ALL ON streaks TO anon, authenticated;
GRANT ALL ON subscriptions TO anon, authenticated;
