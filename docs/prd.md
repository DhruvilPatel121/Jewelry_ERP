# Jewelry Accounting / ERP Web App Requirements Document

## 1. Application Overview

### 1.1 Application Name
Jewelry Accounting / ERP Web App
\n### 1.2 Application Description
A complete, production-ready Progressive Web App (PWA) for jewelry business accounting and ERP management. The application provides comprehensive features for managing sales, purchases, customer ledgers, inventory, payments, and financial reports with real-time calculations and offline support.

### 1.3 Target Users
Jewelry business owners, accountants, and staff members who need to manage daily transactions, customer accounts, inventory, and financial reporting.

## 2. Technical Requirements

### 2.1 Frontend Technology Stack
- React + Vite
- PWA enabled with offline support
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form management
- Zod for validation
- Recharts for data visualization
- Lucide Icons for UI icons

### 2.2 Backend Technology Stack
- Firebase Spark Plan (Free tier)
- Firebase Authentication (Email/Password)
- Firebase Firestore (NoSQL Database)
- Firebase Hosting
- Firebase Cloud Functions (Free tier only)

### 2.3 Technical Constraints
- Must use only free services (Firebase Spark Plan)\n- No paid APIs or services
- No AWS, Stripe, or paid databases
- No credit card required for any service
- 100% free forever\n
## 3. Application Structure

### 3.1 Bottom Navigation (Mobile-First)
- Home
- Dashboard
- Items
- More

## 4. Core Features
\n### 4.1 Home Page - Transaction Details
\n#### 4.1.1 Daily Summary Section
- Display daily sale summary
- Display daily purchase summary
\n#### 4.1.2 Quick Action Buttons
- Add Sale\n- Sale Report
- Day Book
- Add Item
\n#### 4.1.3 Recent Transactions List
- Show recent transactions with details
- Scrollable list view

#### 4.1.4 Floating Action Button
- Add New Sale (sticky button)

### 4.2 Dashboard

#### 4.2.1 Charts and Analytics
- Sale vs Purchase comparison chart
- Monthly trend chart
- Cash summary\n- Bank summary

#### 4.2.2 Data Visualization
- Use Recharts for all charts
- Interactive and responsive charts

### 4.3 Party Details (Customer Ledger)

#### 4.3.1 Customer List View
- Display all customers
- Show for each customer:\n  - Customer Name
  - Closing Amount (DR/CR)
  - Closing Fine (DR/CR)
\n#### 4.3.2 Customer Detail View
- Click customer to view full transaction history
- Display all transactions with dates and amounts

#### 4.3.3 Add New Customer
- Button: Add New Customer
- Form fields:
  - Name (required)
  - Mobile No (required)
  - City
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
\n#### 4.4.2 Calculation Logic
- Total Ghat = (Net Weight × Ghat) / 1000
- Fine = (Net Weight + Total Ghat) × (Touch + Wastage) / 100
- Amount = (Net Weight × Rate) / 1000 OR Pics × Rate
- Closing Amount = O/P Amount + Amount
- Closing Fine = O/P Fine + Fine
\n#### 4.4.3 Data Operations
- Save to Firestore sales or purchases collection
- Update customer closing amounts
- Real-time calculation updates

### 4.5 Payment / Receipt

#### 4.5.1 Payment Types\n- Fine
- Cash
- Bank
- Rate Cut Fine
- Rate Cut Amount
- Roopu

#### 4.5.2 Form Fields
- Invoice No (auto-generated)
- Date (date picker)
- Customer (dropdown)
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
- Closing Amount = O/P Amount + Amount\n- Closing Fine = O/P Fine + Fine

#### 4.5.4 Data Operations
- Save to Firestore payments collection
- Update customer balances
\n### 4.6 Reports

#### 4.6.1 Report Types
- Sale Report
- Purchase Report
- Day Book
\n#### 4.6.2 Filter Options
- Date range filter
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
\n#### 4.7.2 Data Operations
- CRUD operations on Firestore items collection
\n### 4.8 More Menu

#### 4.8.1 Menu Options
- Sale
- Purchase
- Expenses
- Cash in Hand
- Bank\n- Reports
- Manage Company
- Settings

## 5. Authentication & Security

### 5.1 Authentication
- Firebase Email/Password authentication
- Single company account per user
- Secure login/logout functionality

### 5.2 Firestore Security Rules
- User-based access control
- Secure read/write rules
- Data isolation per company

### 5.3 Data Backup Strategy
- Free backup strategy using Firebase\n- Data export functionality

## 6. Database Structure

### 6.1 Firestore Collections
- users\n- customers
- items\n- sales
- purchases\n- payments
- expenses
- company
\n### 6.2 Data Operations
- Real CRUD operations (not mock)\n- Real-time data synchronization
- Offline data persistence

## 7. UI/UX Requirements

### 7.1 Design Principles
- Clean accounting-style UI
- Mobile-first responsive design
- Professional and attractive interface
- Matches accounting app standards (Vyapar/Khatabook style)

### 7.2 UI Components
- Sticky action buttons
- Toast notifications for user feedback
- Skeleton loaders for loading states
- Comprehensive error handling
- Light and Dark mode support

### 7.3 Responsive Design
- Mobile-optimized layouts
- Tablet-friendly views
- Desktop-compatible interface

## 8. PWA Features

### 8.1 Offline Support
- Offline-first architecture
- Service worker implementation
- Local data caching
- Sync when online

### 8.2 Installation
- Add to Home Screen capability
- App-like experience
- Splash screen
\n## 9. Advanced Features

### 9.1 Multi-Company Support
- Support for multiple company accounts
- Company switching functionality
\n### 9.2 Android APK
- Generate Android APK from PWA
- Distribution capability

## 10. Deliverables

### 10.1 Source Code
- Complete project source code
- Frontend code (React + Vite)
- Firebase backend configuration
- All components and utilities

### 10.2 Documentation
- README with setup instructions
- Firebase configuration guide
- Deployment instructions
- User guide

### 10.3 Deployment
- Ready to deploy on Firebase Hosting
- Production-ready configuration
- Environment setup guide

### 10.4 Code Download
- Full source code downloadable
- No restrictions on code access
\n## 11. Quality Requirements

### 11.1 Functionality
- Fully working end-to-end
- All calculations must be real and accurate
- No dummy-only UI
- Complete logic implementation

### 11.2 Performance
- Fast loading times
- Optimized bundle size
- Efficient data queries

### 11.3 Scalability
- Production-ready architecture
- Scalable database structure
- Maintainable code structure

### 11.4 Cost\n- Zero running cost forever
- Uses only Firebase Spark Plan (free tier)
- No hidden costs

## 12. Constraints and Restrictions

### 12.1 Prohibited Elements
- Do NOT generate Excel UI
- Do NOT leave logic incomplete
- Do NOT require paid services
- Do NOT generate dummy-only UI
- Do NOT use AWS, Stripe, or paid APIs

### 12.2 Mandatory Requirements
- Must use specified tech stack only
- Must implement all calculations
- Must provide complete working solution
- Must be deployable and downloadable