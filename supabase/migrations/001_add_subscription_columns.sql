-- Migration to add subscription and onboarding columns to user_profiles table
-- This fixes the "13 issues" in Supabase by adding all required columns

-- Add columns if they don't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS onboardingCompleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS isPremium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscriptionPlan TEXT,
ADD COLUMN IF NOT EXISTS stripeSubscriptionId TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripeCustomerId TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS nextDueDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trialStartDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trialEndDate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS quiz_answers JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripeCustomerId);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription ON user_profiles(stripeSubscriptionId);
CREATE INDEX IF NOT EXISTS idx_user_profiles_premium ON user_profiles(isPremium);

-- Add RLS policies if table has RLS enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE user_profiles IS 'User profile data including subscription and onboarding status';
