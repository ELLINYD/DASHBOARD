# ELLI V1 - Monochrome Dashboard

A monochrome AP/AR (Accounts Payable/Accounts Receivable) dashboard for ELLI NY DESIGN.

## Features

- **Dashboard**: Real-time financial overview with KPIs
- **Purchase Orders**: View and manage POs with detailed information
- **Vendors**: Vendor directory and management
- **Projects**:
  - Current Project Numbers
  - Project Master List with Excel import
- **RFQs** (Request for Quotations):
  - View RFQ log with filtering
  - Create new RFQs with preview
  - Export to Word, Excel, or PDF
- **Change Orders**: (Coming soon)
- **Monthly Bills**: (Coming soon)

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Project Structure

```
/src
  /App.tsx          # Main application component
  /main.tsx         # Application entry point
  /index.css        # Global styles
/public             # Static assets
```

## Key Components

- **Dashboard**: Financial overview with KPIs and charts
- **POsView**: Purchase order management with search and pagination
- **VendorsView**: Vendor directory
- **CurrentProjectNumbersView**: Active project listing
- **ProjectMasterListView**: Excel-compatible project data import
- **RFQListView**: RFQ log with filtering
- **RFQCreateView**: RFQ creation with live preview and export options

## RFQ Features

The RFQ module allows you to:
- Create professional Request for Quotation documents
- Fill in project details, vendor information, scope of work
- Preview in real-time before finalizing
- Export to:
  - **Word (.doc)**: HTML-based Word document
  - **Excel (.xls)**: HTML-based spreadsheet
  - **PDF**: Print to PDF from browser
- Save drafts to the RFQ log
- View and manage all RFQs with status tracking

## Data Import

The Project Master List supports importing data from Excel:
- Paste directly from Excel (preserves tabs)
- Upload CSV/TSV files
- Upload .xlsx files (requires xlsx library)
- Schema validation ensures data integrity

## License

Proprietary - ELLI NY DESIGN
