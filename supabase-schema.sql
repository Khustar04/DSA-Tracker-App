-- ═══════════════════════════════════════════════════════════
-- DSA TRACKER — SUPABASE DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all required tables with Row Level Security
-- ═══════════════════════════════════════════════════════════

-- ─── 1. PROFILES TABLE ─────────────────────────────────────
-- Auto-populated from auth.users on signup
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 2. SOLVED PROBLEMS TABLE ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.solved_problems (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id TEXT NOT NULL,
  solved_at TIMESTAMPTZ DEFAULT NOW(),
  solved_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, problem_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_solved_user ON public.solved_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_solved_user_problem ON public.solved_problems(user_id, problem_id);

-- Enable RLS
ALTER TABLE public.solved_problems ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own solved problems"
  ON public.solved_problems
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own solved problems"
  ON public.solved_problems
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own solved problems"
  ON public.solved_problems
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own solved problems"
  ON public.solved_problems
  FOR DELETE
  USING (auth.uid() = user_id);


-- ─── 3. NOTES TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own notes"
  ON public.notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.notes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = user_id);


-- ─── 4. STREAKS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own streak"
  ON public.streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON public.streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.streaks
  FOR UPDATE
  USING (auth.uid() = user_id);


-- ─── 5. SOLVE HISTORY TABLE ────────────────────────────────
-- Tracks which problems were solved on each day (for "today's count")
CREATE TABLE IF NOT EXISTS public.solve_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  solve_date DATE NOT NULL DEFAULT CURRENT_DATE,
  problem_ids TEXT[] DEFAULT '{}',
  UNIQUE(user_id, solve_date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_history_user_date ON public.solve_history(user_id, solve_date);

-- Enable RLS
ALTER TABLE public.solve_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own solve history"
  ON public.solve_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own solve history"
  ON public.solve_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own solve history"
  ON public.solve_history
  FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- DONE! All tables created with Row Level Security.
-- Each user can only access their own data.
-- ═══════════════════════════════════════════════════════════
