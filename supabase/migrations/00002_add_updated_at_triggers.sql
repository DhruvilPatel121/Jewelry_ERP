-- Add updated_at triggers for automatic timestamp updates
-- This migration ensures that updated_at columns are automatically managed
-- Only creates triggers for tables that actually have updated_at columns

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists in the table
    IF TG_TABLE_NAME = 'profiles' THEN
        NEW.updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'customers' THEN
        NEW.updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'items' THEN
        NEW.updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'sales' THEN
        NEW.updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'purchases' THEN
        NEW.updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'payments' THEN
        NEW.updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'expenses' THEN
        NEW.updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'company_settings' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;

-- Create triggers only for tables that have updated_at column
-- Check if column exists before creating trigger
DO $$
BEGIN
    -- Profiles trigger
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Customers trigger
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_customers_updated_at 
            BEFORE UPDATE ON customers 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Items trigger
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'items' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_items_updated_at 
            BEFORE UPDATE ON items 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Sales trigger
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sales' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_sales_updated_at 
            BEFORE UPDATE ON sales 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Purchases trigger
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'purchases' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_purchases_updated_at 
            BEFORE UPDATE ON purchases 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Payments trigger
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'payments' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_payments_updated_at 
            BEFORE UPDATE ON payments 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Expenses trigger
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'expenses' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_expenses_updated_at 
            BEFORE UPDATE ON expenses 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Company settings trigger
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'company_settings' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_company_settings_updated_at 
            BEFORE UPDATE ON company_settings 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Refresh schema cache to ensure PostgREST recognizes updated_at columns
NOTIFY pgrst, 'reload schema';
