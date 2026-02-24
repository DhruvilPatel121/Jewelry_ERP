-- Create triggers for automatic updated_at updates
-- This migration creates triggers to automatically update updated_at columns
-- Applied to ensure proper timestamp management on updates

-- Create simple triggers for automatic updated_at updates
CREATE OR REPLACE FUNCTION auto_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers only to tables that now have updated_at
DROP TRIGGER IF EXISTS purchases_updated_at_trigger ON purchases;
CREATE TRIGGER purchases_updated_at_trigger
    BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION auto_update_updated_at();

DROP TRIGGER IF EXISTS sales_updated_at_trigger ON sales;
CREATE TRIGGER sales_updated_at_trigger
    BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION auto_update_updated_at();

DROP TRIGGER IF EXISTS payments_updated_at_trigger ON payments;
CREATE TRIGGER payments_updated_at_trigger
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION auto_update_updated_at();

DROP TRIGGER IF EXISTS expenses_updated_at_trigger ON expenses;
CREATE TRIGGER expenses_updated_at_trigger
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION auto_update_updated_at();

-- Final schema reload
NOTIFY pgrst, 'reload schema';
