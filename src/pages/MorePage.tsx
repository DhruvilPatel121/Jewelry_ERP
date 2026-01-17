import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Receipt,
  Wallet,
  Building2,
  FileText,
  Settings,
  Users,
  ChevronRight,
} from 'lucide-react';

export default function MorePage() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Transactions',
      items: [
        { icon: ShoppingCart, label: 'Sale', path: '/new-sale', color: 'text-success' },
        { icon: ShoppingBag, label: 'Purchase', path: '/new-purchase', color: 'text-warning' },
        { icon: CreditCard, label: 'Payment / Receipt', path: '/payment', color: 'text-primary' },
        { icon: Receipt, label: 'Expenses', path: '/expenses', color: 'text-destructive' },
      ],
    },
    {
      title: 'Accounts',
      items: [
        { icon: Wallet, label: 'Cash in Hand', path: '/cash-bank', color: 'text-secondary' },
        { icon: Building2, label: 'Bank', path: '/cash-bank', color: 'text-secondary' },
        { icon: Users, label: 'Customers', path: '/customers', color: 'text-accent' },
      ],
    },
    {
      title: 'Reports',
      items: [
        { icon: FileText, label: 'Sale Report', path: '/sale-report', color: 'text-primary' },
        { icon: FileText, label: 'Purchase Report', path: '/purchase-report', color: 'text-primary' },
        { icon: FileText, label: 'Day Book', path: '/day-book', color: 'text-primary' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Settings, label: 'Company Settings', path: '/company-settings', color: 'text-muted-foreground' },
      ],
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">More</h1>

      {menuItems.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground px-2">{section.title}</h2>
          <Card>
            <CardContent className="p-0">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
