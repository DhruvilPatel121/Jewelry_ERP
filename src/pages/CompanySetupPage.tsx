import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanySetupPage() {
  const navigate = useNavigate();
  const { createCompany } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast.error('Please enter company name');
      return;
    }

    try {
      setLoading(true);
      await createCompany(companyName);
      toast.success('Company created successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Company creation error:', error);
      toast.error(error.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Setup Your Company</CardTitle>
          <CardDescription>
            Create your company to start managing your jewelry business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="e.g., Gold Jewelers Ltd."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Your company account will be created</li>
                <li>You'll be the admin of this company</li>
                <li>You can start adding customers, items, and transactions</li>
                <li>Your data will be completely isolated from other companies</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Company
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
