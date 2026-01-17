# Jewelry Accounting / ERP Web App Requirements Document

## 1. Application Overview

### 1.1 Application Name
Jewelry Accounting / ERP Web App
\n### 1.2 Application Description
A complete, production-ready Progressive Web App (PWA) for jewelry business accounting and ERP management. The application provides comprehensive features for managing sales, purchases, customer ledgers, inventory, payments, and financial reports with real-time calculations and offline support. The system supports multi-company architecture where each company can only access their own data through secure authentication.

### 1.3 Target Users
Jewelry business owners, accountants, and staff members who need to manage daily transactions, customer accounts, inventory, and financial reporting.

## 2. Technical Requirements
\n### 2.1 Frontend Technology Stack
- React + Vite
- PWA enabled with offline support
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form management
- Zod for validation
- Recharts for data visualization
- Lucide Icons for UI icons\n
### 2.2 Backend Technology Stack
- Firebase Spark Plan (Free tier)
- Firebase Authentication (Email/Password)\n- Firebase Firestore (NoSQL Database)
- Firebase Hosting
- Firebase Cloud Functions (Free tier only)

### 2.3 Technical Constraints\n- Must use only free services (Firebase Spark Plan)
- No paid APIs or services
- No AWS, Stripe, or paid databases
- No credit card required for any service
- 100% free forever

## 3. Application Structure

### 3.1 Bottom Navigation (Mobile-First)
- Home
- Dashboard
- Items
- More

## 4. Core Features
\n### 4.1 Home Page - Transaction Details

#### 4.1.1 Daily Summary Section
- Display daily sale summary
- Display daily purchase summary

#### 4.1.2 Quick Action Buttons
- Add Sale
- Sale Report
- Day Book
- Add Item
\n#### 4.1.3 Recent Transactions List
- Show recent transactions with details
- Scrollable list view
\n#### 4.1.4 Floating Action Button
- Add New Sale (sticky button)

### 4.2 Dashboard

#### 4.2.1 Charts and Analytics
- Sale vs Purchase comparison chart
- Monthly trend chart
- Cash summary
- Bank summary

#### 4.2.2 Data Visualization\n- Use Recharts for all charts
- Interactive and responsive charts

### 4.3 Party Details (Customer Ledger)

#### 4.3.1 Customer List View
- Display all customers
- Show for each customer:
  - Customer Name
  - Closing Amount (DR/CR)
  - Closing Fine (DR/CR)

#### 4.3.2 Customer Detail View
- Click customer to view full transaction history
- Display all transactions with dates and amounts

#### 4.3.3 Add New Customer
- Button: Add New Customer
- Form fields:
  - Name (required)\n  - Mobile No (required)\n  - City
  - GST No
  - Address
  - Opening Amount (O/P AMT)
  - Opening Fine (O/P FINE)
- Form validation using Zod
- Save to Firestore customers collection

### 4.4 New Sale / New Purchase

#### 4.4.1 Form Fields
- Invoice No (auto-generated)
- Date (date picker)
- Customer (dropdown, fetch O/P values)
- Item Name (add/edit capability)
- Weight (numeric input)
- Bag (numeric input)
- Net Weight (numeric input)
- Ghat per KG (numeric input)
- Total Ghat (auto-calculated)
- Touch (numeric input)
- Wastage (numeric input)
- Fine (auto-calculated)
- Pics (numeric input)
- Rate (numeric input)
- Amount (auto-calculated)
- Remarks (text area)

#### 4.4.2 Calculation Logic
- Total Ghat = (Net Weight × Ghat) / 1000
- Fine = (Net Weight + Total Ghat) × (Touch + Wastage) / 100\n- Amount = (Net Weight × Rate) / 1000 OR Pics × Rate
- Closing Amount = O/P Amount + Amount
- Closing Fine = O/P Fine + Fine

#### 4.4.3 Data Operations
- Save to Firestore sales or purchases collection
- Update customer closing amounts\n- Real-time calculation updates\n
### 4.5 Payment / Receipt

#### 4.5.1 Payment Types
- Fine
- Cash
- Bank
- Rate Cut Fine
- Rate Cut Amount
- Roopu

#### 4.5.2 Form Fields\n- Invoice No (auto-generated)
- Date (date picker)\n- Customer (dropdown)
- Payment / Receipt (toggle)
- Gross (numeric input)
- Purity (numeric input)
- Wast Badi / KG (numeric input)
- Fine (auto-calculated)
- Rate (numeric input)
- Amount (numeric input)
- Remarks (text area)

#### 4.5.3 Calculation Logic
- Fine = Gross × Purity / 100
- Rate Cut Fine = (Fine × Rate) / 1000
- Closing Amount = O/P Amount + Amount
- Closing Fine = O/P Fine + Fine

#### 4.5.4 Data Operations
- Save to Firestore payments collection
- Update customer balances

### 4.6 Reports

#### 4.6.1 Report Types
- Sale Report\n- Purchase Report
- Day Book

#### 4.6.2 Filter Options\n- Date range filter
- Party (customer) filter
\n#### 4.6.3 Export Functionality
- UI prepared for PDF export
- UI prepared for Excel export

### 4.7 Items Management

#### 4.7.1 Features
- Add Item
- Item List view
- Edit Item
- Delete Item

#### 4.7.2 Data Operations
- CRUD operations on Firestore items collection

### 4.8 More Menu

#### 4.8.1 Menu Options
- Sale
- Purchase
- Expenses
- Cash in Hand
- Bank
- Reports
- Manage Company\n- Settings

## 5. Authentication & Security

### 5.1 Authentication
- Firebase Email/Password authentication
- Multi-company support with company-specific credentials
- Each company account isolated with unique companyId
- Secure login/logout functionality

### 5.2 Multi-Company Data Isolation
- Each user account linked to a specific companyId
- All Firestore queries filtered by companyId
- Complete data isolation between companies
- No cross-company data access

### 5.3 Firestore Security Rules
- User-based access control
- Company-based data isolation rules
- Secure read/write rules enforcing companyId matching
- Prevent unauthorized access to other company data

### 5.4 Data Backup Strategy
- Free backup strategy using Firebase
- Data export functionality\n\n## 6. Database Structure\n
### 6.1 Firestore Collections
- users (contains userId, email, companyId)\n- companies (contains company profile information)
- customers (filtered by companyId)
- items (filtered by companyId)
- sales (filtered by companyId)
- purchases (filtered by companyId)
- payments (filtered by companyId)
- expenses (filtered by companyId)
\n### 6.2 Data Operations
- Real CRUD operations (not mock)
- Real-time data synchronization
- Offline data persistence
- All queries include companyId filter

## 7. UI/UX Requirements
\n### 7.1 Design Principles
- Clean accounting-style UI
- Mobile-first responsive design
- Professional and attractive interface
- Matches accounting app standards (Vyapar/Khatabook style)

### 7.2 UI Components
- Sticky action buttons\n- Toast notifications for user feedback\n- Skeleton loaders for loading states
- Comprehensive error handling
- Light and Dark mode support

### 7.3 Responsive Design
- Mobile-optimized layouts
- Tablet-friendly views
- Desktop-compatible interface
- Fully responsive across all screen sizes

## 8. PWA Features

### 8.1 Offline Support
- Offline-first architecture
- Service worker implementation\n- Local data caching
- Sync when online
\n### 8.2 Installation
- Add to Home Screen capability
- App-like experience\n- Splash screen
- PWA manifest configuration

### 8.3 PWA Configuration
- manifest.json with app metadata
- Service worker for offline functionality
- Cache strategies for assets and data
- Background sync capabilities

## 9. Advanced Features

### 9.1 Multi-Company Support
- Support for multiple company accounts
- Company switching functionality
- Each company has isolated data access

### 9.2 Android APK
- Generate Android APK from PWA\n- Distribution capability

## 10. Deliverables

### 10.1 Source Code
- Complete project source code
- Frontend code (React + Vite)
- Firebase backend configuration
- All components and utilities

### 10.2 Documentation
- Complete setup and deployment guide
- Firebase project creation steps
- Firebase Authentication configuration
- Firestore database setup and security rules
- Multi-company architecture implementation guide
- PWA configuration and testing guide
- Environment variables setup
- Step-by-step deployment instructions
- User guide\n
### 10.3 Deployment
- Ready to deploy on Firebase Hosting
- Production-ready configuration
- Complete deployment documentation
\n### 10.4 Code Download
- Full source code downloadable
- No restrictions on code access
\n## 11. Quality Requirements\n
### 11.1 Functionality
- Fully working end-to-end
- All calculations must be real and accurate
- No dummy-only UI
- Complete logic implementation
- Multi-company data isolation working correctly

### 11.2 Performance
- Fast loading times
- Optimized bundle size
- Efficient data queries

### 11.3 Scalability
- Production-ready architecture
- Scalable database structure
- Maintainable code structure
\n### 11.4 Responsiveness
- Fully responsive on all devices
- Mobile, tablet, and desktop optimized
- Touch-friendly interface

### 11.5 Cost
- Zero running cost forever
- Uses only Firebase Spark Plan (free tier)
- No hidden costs\n
## 12. Constraints and Restrictions

### 12.1 Prohibited Elements
- Do NOT generate Excel UI
- Do NOT leave logic incomplete
- Do NOT require paid services
- Do NOT generate dummy-only UI
- Do NOT use AWS, Stripe, or paid APIs

### 12.2 Mandatory Requirements
- Must use specified tech stack only\n- Must implement all calculations
- Must provide complete working solution
- Must be deployable and downloadable
- Must include complete documentation for Firebase setup, deployment, and multi-company configuration
- Must be fully responsive\n- Must have PWA support working

## 13. Complete Documentation Requirements

### 13.1 Firebase Project Setup Documentation
- Step-by-step guide to create Firebase project
- How to enable Firebase Authentication
- How to create Firestore database
- How to configure Firebase Hosting
\n### 13.2 Firebase Authentication Setup
- Enable Email/Password authentication method
- User registration flow with companyId assignment
- Login flow with company data isolation
- Password reset functionality

### 13.3 Firestore Database Configuration
- Database structure with collections and fields
- Indexes required for queries
- Composite indexes for companyId filtering
\n### 13.4 Firestore Security Rules Documentation
- Complete security rules for multi-company isolation
- Rules for each collection (users, companies, customers, items, sales, purchases, payments, expenses)\n- Testing security rules

### 13.5 Multi-Company Architecture Documentation
- How companyId is assigned during registration
- How data is filtered by companyId in all queries
- How to ensure complete data isolation\n- User-company relationship management

### 13.6 Local Development Setup
- Clone repository steps
- Install dependencies
- Configure environment variables
- Firebase configuration file setup
- Run development server

### 13.7 PWA Configuration Documentation
- Service worker setup
- Manifest.json configuration
- Offline caching strategies
- Testing PWA functionality
- Add to Home Screen testing

### 13.8 Deployment Documentation
- Build production bundle
- Firebase Hosting deployment steps
- Environment variables for production
- Post-deployment verification

### 13.9 Testing Documentation
- How to test multi-company isolation
- How to test PWA offline functionality
- How to test responsive design
- How to verify all calculations\n
### 13.10 Troubleshooting Guide
- Common issues and solutions
- Firebase quota limits and workarounds
- Debugging tips