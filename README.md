# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-8zur1sisfyf5

# Jewelry ERP - Complete Accounting System

A comprehensive, production-ready Progressive Web App (PWA) for jewelry business accounting and ERP management built with React, TypeScript, and Supabase.

## 🌟 Features

### Core Functionality
- **Customer Management**: Complete customer ledger with opening/closing balances for both amount and fine (gold weight)
- **Sales & Purchases**: Full transaction management with automatic calculations for weight, fine, and amounts
- **Payment & Receipt**: Multiple payment types (Cash, Bank, Fine, Rate Cut, Roopu) with automatic balance updates
- **Items Management**: CRUD operations for jewelry items catalog
- **Expenses Tracking**: Record and manage business expenses
- **Cash & Bank**: Real-time tracking of cash in hand and bank balances

### Reports & Analytics
- **Dashboard**: Visual analytics with charts showing sales vs purchases trends
- **Sale Report**: Filterable sales transactions with date range and customer filters
- **Purchase Report**: Comprehensive purchase history with filters
- **Day Book**: Complete daily transaction summary across all transaction types
- **Export Ready**: UI prepared for PDF and Excel export functionality

### User Experience
- **Mobile-First Design**: Optimized for mobile devices with bottom navigation
- **PWA Support**: Installable app with offline capabilities
- **Professional UI**: Accounting-style interface with clean, modern design
- **Real-time Calculations**: Automatic calculation of fine, ghat, and amounts
- **Dark Mode**: Full dark mode support

## 🎨 Design System

### Color Scheme
- **Primary (Deep Blue)**: Trust & Professionalism - `hsl(217, 91%, 35%)`
- **Secondary (Teal)**: Money & Growth - `hsl(174, 62%, 47%)`
- **Accent (Gold)**: Jewelry & Luxury - `hsl(43, 96%, 56%)`
- **Success (Green)**: Profit & Positive Balance - `hsl(142, 71%, 45%)`
- **Warning (Orange)**: Alerts - `hsl(38, 92%, 50%)`
- **Destructive (Red)**: Loss & Negative Balance - `hsl(0, 84%, 60%)`

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Hook Form** + **Zod** for form validation
- **Recharts** for data visualization
- **React Router** for navigation
- **Lucide Icons** for iconography

### Backend
- **Supabase** (Free Tier)
  - PostgreSQL Database
  - Authentication (Username/Password)
  - Row Level Security (RLS)
  - Real-time capabilities

### PWA Features
- Service Worker for offline support
- Web App Manifest
- Installable on mobile devices
- Offline-first architecture

## 📊 Database Schema

### Tables
1. **profiles** - User profiles with role-based access
2. **customers** - Customer information with opening/closing balances
3. **items** - Jewelry items catalog
4. **sales** - Sales transactions with automatic calculations
5. **purchases** - Purchase transactions
6. **payments** - Payment and receipt transactions
7. **expenses** - Business expenses
8. **company_settings** - Company information

### Calculation Logic

#### Sales/Purchase Calculations
```
Total Ghat = (Net Weight × Ghat per KG) / 1000
Fine = (Net Weight + Total Ghat) × (Touch + Wastage) / 100
Amount = (Net Weight × Rate) / 1000 OR Pics × Rate
Closing Amount = Opening Amount + Amount
Closing Fine = Opening Fine + Fine
```

#### Payment Calculations
```
Fine = Gross × Purity / 100
Rate Cut Fine = (Fine × Rate) / 1000
Closing Amount = Opening Amount ± Amount (based on payment/receipt)
Closing Fine = Opening Fine ± Fine (based on payment/receipt)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- pnpm package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd app-8zur1sisfyf5
```

2. Install dependencies
```bash
pnpm install
```

3. Environment Setup
The Supabase credentials are already configured in the `.env` file:
- Supabase URL: `https://uhssbgfecgakimtkdikg.supabase.co`
- Supabase Anon Key: Already configured

4. Run the development server
```bash
pnpm dev
```

5. Build for production
```bash
pnpm build
```

## 📱 Usage Guide

### First Time Setup

1. **Register**: Create your account (first user becomes admin)
2. **Company Settings**: Set up your company information
3. **Add Items**: Create your jewelry items catalog
4. **Add Customers**: Add customer details with opening balances

### Daily Operations

1. **Record Sales**: Use "Add Sale" to record customer purchases
2. **Record Purchases**: Track inventory purchases from suppliers
3. **Payments/Receipts**: Record all payment transactions
4. **Track Expenses**: Log business expenses

### Reports & Analytics

1. **Dashboard**: View overall business performance
2. **Reports**: Generate filtered reports by date range and customer
3. **Day Book**: Review all daily transactions

## 🔐 Authentication & Security

- Username/password authentication via Supabase Auth
- Row Level Security (RLS) ensures data isolation per user
- First registered user automatically becomes admin
- Secure password hashing and session management

## 📦 Project Structure

```
src/
├── components/
│   ├── layouts/          # Main layout with bottom navigation
│   ├── ui/               # shadcn/ui components
│   └── common/           # Shared components
├── contexts/             # React contexts (Auth)
├── db/
│   ├── api.ts           # Database API layer
│   └── supabase.ts      # Supabase client
├── pages/               # All application pages
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── lib/                 # Utility functions
```

## 🎯 Key Features Implementation

### Real-time Calculations
All financial calculations are performed in real-time as users input data, with automatic updates to customer balances.

### Customer Balance Tracking
- Dual balance system: Amount (₹) and Fine (grams)
- Automatic updates on every transaction
- Opening and closing balance management
- DR/CR indicator for positive/negative balances

### Transaction Management
- Auto-generated invoice numbers
- Date-based filtering
- Customer-wise transaction history
- Complete audit trail

### Responsive Design
- Mobile-first approach
- Bottom navigation for easy thumb access
- Optimized for various screen sizes
- Touch-friendly interface

## 🌐 PWA Features

### Offline Support
- Service worker caches essential resources
- Offline-first data strategy
- Background sync when connection restored

### Installation
- Add to Home Screen on mobile devices
- Standalone app experience
- Custom splash screen
- Theme color integration

## 💰 Cost

**100% FREE** - Uses only free tier services:
- Supabase Free Tier
- No paid APIs
- No credit card required
- Zero running costs

## 🔄 Future Enhancements

- PDF/Excel export functionality
- Multi-company support
- Advanced reporting with custom date ranges
- Inventory management
- Barcode scanning
- SMS/Email notifications
- Backup and restore functionality

## 📝 License

This project is built for jewelry business accounting and ERP management.

## 🤝 Support

For issues or questions, please refer to the documentation or contact support.

---

**Built with ❤️ for Jewelry Businesses**

© 2026 Jewelry ERP - All Rights Reserved
