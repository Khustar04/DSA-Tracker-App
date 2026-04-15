-- ============================================================
-- DSA Tracker - Feature Updates Migration
-- ============================================================
-- Adds required columns for:
-- - public/private custom sheets
-- - custom problem external links
-- - profile enrichment fields
-- Also updates RLS so users can browse/clone public sheets.
-- Run in Supabase SQL Editor.

-- 1) Custom sheets visibility
ALTER TABLE IF EXISTS public.custom_sheets
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Custom sheet problem metadata links
ALTER TABLE IF EXISTS public.custom_sheet_problems
ADD COLUMN IF NOT EXISTS leetcode_link TEXT;

ALTER TABLE IF EXISTS public.custom_sheet_problems
ADD COLUMN IF NOT EXISTS gfg_link TEXT;

-- 3) Profile minimal expansion fields
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS college_name TEXT;

ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS target_companies TEXT[] NOT NULL DEFAULT '{}';

-- Optional safety constraint for graduation year
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_graduation_year_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_graduation_year_check
    CHECK (
      graduation_year IS NULL
      OR (graduation_year >= 2000 AND graduation_year <= 2100)
    );
  END IF;
END $$;

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE IF EXISTS public.custom_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_sheet_problems ENABLE ROW LEVEL SECURITY;

-- 4) Allow public sheet browsing while preserving owner access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'custom_sheets'
      AND policyname = 'Public sheets are viewable'
  ) THEN
    CREATE POLICY "Public sheets are viewable"
      ON public.custom_sheets
      FOR SELECT
      USING (is_public = TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'custom_sheet_problems'
      AND policyname = 'Problems of public sheets are viewable'
  ) THEN
    CREATE POLICY "Problems of public sheets are viewable"
      ON public.custom_sheet_problems
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.custom_sheets cs
          WHERE cs.id = custom_sheet_problems.sheet_id
            AND cs.is_public = TRUE
        )
      );
  END IF;
END $$;

-- Refresh PostgREST schema cache so new columns appear immediately
NOTIFY pgrst, 'reload schema';
