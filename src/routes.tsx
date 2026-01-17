import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import MorePage from './pages/MorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import AddCustomerPage from './pages/AddCustomerPage';
import NewSalePage from './pages/NewSalePage';
import NewPurchasePage from './pages/NewPurchasePage';
import PaymentPage from './pages/PaymentPage';
import SaleReportPage from './pages/SaleReportPage';
import PurchaseReportPage from './pages/PurchaseReportPage';
import DayBookPage from './pages/DayBookPage';
import ExpensesPage from './pages/ExpensesPage';
import CashBankPage from './pages/CashBankPage';
import CompanySettingsPage from './pages/CompanySettingsPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    visible: false,
  },
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Items',
    path: '/items',
    element: <ItemsPage />,
  },
  {
    name: 'More',
    path: '/more',
    element: <MorePage />,
  },
  {
    name: 'Customers',
    path: '/customers',
    element: <CustomersPage />,
  },
  {
    name: 'Customer Detail',
    path: '/customers/:id',
    element: <CustomerDetailPage />,
    visible: false,
  },
  {
    name: 'Add Customer',
    path: '/add-customer',
    element: <AddCustomerPage />,
    visible: false,
  },
  {
    name: 'New Sale',
    path: '/new-sale',
    element: <NewSalePage />,
    visible: false,
  },
  {
    name: 'New Purchase',
    path: '/new-purchase',
    element: <NewPurchasePage />,
    visible: false,
  },
  {
    name: 'Payment',
    path: '/payment',
    element: <PaymentPage />,
    visible: false,
  },
  {
    name: 'Sale Report',
    path: '/sale-report',
    element: <SaleReportPage />,
    visible: false,
  },
  {
    name: 'Purchase Report',
    path: '/purchase-report',
    element: <PurchaseReportPage />,
    visible: false,
  },
  {
    name: 'Day Book',
    path: '/day-book',
    element: <DayBookPage />,
    visible: false,
  },
  {
    name: 'Expenses',
    path: '/expenses',
    element: <ExpensesPage />,
    visible: false,
  },
  {
    name: 'Cash & Bank',
    path: '/cash-bank',
    element: <CashBankPage />,
    visible: false,
  },
  {
    name: 'Company Settings',
    path: '/company-settings',
    element: <CompanySettingsPage />,
    visible: false,
  },
];

export default routes;
