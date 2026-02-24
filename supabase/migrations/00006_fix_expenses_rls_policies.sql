-- Fix expenses table RLS policies and add updated_at column
-- This migration fixes the 403 Forbidden error when creating expenses
-- Applied to ensure proper RLS policies and updated_at functionality

-- First, ensure RLS is enabled
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing expenses policies (if any)
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

-- Recreate expenses RLS policies
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Add updated_at to expenses table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE expenses ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
