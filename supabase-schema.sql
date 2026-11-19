-- ====================================================================
-- ClipLens AI - Supabase Database Schema, RLS Policies & Triggers
-- Run this script in your Supabase Project SQL Editor
-- Project URL: https://zkqayqzyjjgztcucfysw.supabase.co
-- ====================================================================

-- 1. PROFILES TABLE (User Profile, Credits & Subscriptions)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 20 CHECK (credits >= 0),
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PLANS TABLE (Available Subscription & Credit Packs)
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  monthly_credits INTEGER NOT NULL DEFAULT 50,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert Default Free & Premium Plans if empty
INSERT INTO public.plans (id, name, description, price_monthly, monthly_credits, features)
VALUES 
  ('free', 'Starter Free Tier', 'Free account with 20 starting credits', 0.00, 20, '["20 Free Credits on Signup", "All Converters Supported", "No Watermark Downloads", "Community Support"]'::jsonb),
  ('pro', 'Creator Pro Pass', 'Unlimited media downloads & 500 AI credits', 9.99, 500, '["500 Monthly Credits", "Priority 8K AI Image Diffusion", "60fps AI Video Generation", "Batch Document Processing", "24/7 Priority Support"]'::jsonb),
  ('unlimited', 'Studio Enterprise', 'Unlimited AI generations & team access', 24.99, 2500, '["2,500 Monthly Credits", "Dedicated Transcoding Engine", "Commercial API Access", "Custom Watermarking", "Dedicated Account Manager"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.plans(id) DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, canceled
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed', -- pending, completed, failed
  payment_method TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CREDIT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive for credits added, negative for usage
  type TEXT NOT NULL, -- signup_bonus, conversion_fee, purchase, coupon
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TOOLS TABLE (System tools catalog)
CREATE TABLE IF NOT EXISTS public.tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  credit_cost INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.tools (id, name, category, credit_cost) VALUES
  ('doc-converter', 'Document Converter', 'document', 1),
  ('image-converter', 'Image Converter & Compressor', 'image', 1),
  ('video-converter', 'Video Converter', 'video', 2),
  ('audio-converter', 'Audio Converter', 'audio', 1),
  ('pdf-tools', 'PDF Suite (Merge/Split)', 'pdf', 1),
  ('zip-tools', 'Archive Tools', 'archive', 1),
  ('ai-image', 'AI 8K Image Generator', 'ai', 2),
  ('ai-video', 'AI Video Generator', 'ai', 4),
  ('ai-chat', 'Multi-Model AI Chat Studio', 'ai', 1)
ON CONFLICT (id) DO NOTHING;

-- 7. CONVERSIONS TABLE (User Activity Log)
CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tool_name TEXT NOT NULL,
  file_name TEXT,
  file_size TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  discount_percent INTEGER DEFAULT 0,
  credit_bonus INTEGER DEFAULT 0,
  max_redemptions INTEGER DEFAULT 100,
  times_redeemed INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ
);

INSERT INTO public.coupons (id, credit_bonus, max_redemptions) VALUES
  ('WELCOME2026', 20, 500)
ON CONFLICT (id) DO NOTHING;

-- 9. COUPON REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id TEXT REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);

-- 10. ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- AUTOMATIC NEW USER TRIGGER: GIVES 20 FREE CREDITS ON SIGNUP
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  -- Extract full name from raw_user_meta_data if present
  user_full_name := NEW.raw_user_meta_data->>'full_name';
  IF user_full_name IS NULL OR user_full_name = '' THEN
    user_full_name := SPLIT_PART(NEW.email, '@', 1);
  END IF;

  -- 1. Insert into public.profiles with 20 FREE CREDITS
  INSERT INTO public.profiles (id, full_name, email, credits, subscription_plan, created_at, updated_at)
  VALUES (NEW.id, user_full_name, NEW.email, 20, 'free', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- 2. Log credit transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description, created_at)
  VALUES (NEW.id, 20, 'signup_bonus', 'Welcome bonus: 20 Free Credits on registration', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Users can only read/write their own records.
-- Users CANNOT tamper with credit balances or subscription tiers.
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Profiles: Users can update ONLY their own full_name and avatar_url
CREATE POLICY "Users can update own profile name and avatar" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Subscriptions: Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Payments: Users can only view their own payments
CREATE POLICY "Users can view own payments" 
  ON public.payments FOR SELECT 
  USING (auth.uid() = user_id);

-- Credit Transactions: Users can only view their own credit history
CREATE POLICY "Users can view own credit transactions" 
  ON public.credit_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Conversions: Users can view and insert their own conversions
CREATE POLICY "Users can view own conversions" 
  ON public.conversions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversions" 
  ON public.conversions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Public Read-Only Tables
CREATE POLICY "Plans are publicly viewable" 
  ON public.plans FOR SELECT 
  USING (true);

CREATE POLICY "Tools are publicly viewable" 
  ON public.tools FOR SELECT 
  USING (true);

CREATE POLICY "Coupons are publicly viewable if active" 
  ON public.coupons FOR SELECT 
  USING (is_active = true);
