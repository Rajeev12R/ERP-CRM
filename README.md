# Mini ERP

A modern, full-stack Enterprise Resource Planning (ERP) web application built to streamline customer management, product inventory and sales challan processing. 

##  Architecture

Mini ERP uses a robust and scalable **PERN/MERN-style** architecture:

*   **Frontend**: React (Vite) + Tailwind CSS + Lucide React (Icons) + React Router (DOM)
*   **State Management & Data Fetching**: React Query (TanStack Query) + Axios
*   **Backend API**: Node.js + Express.js
*   **Database**: PostgreSQL
*   **ORM**: Prisma (for schema management, migrations, and type-safe database queries)
*   **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies and bcrypt for password hashing.

## Setup & Deployment Instructions

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL running locally or on a cloud provider (e.g., Supabase, Neon)

### 1. Database Setup
1. Create a PostgreSQL database.
2. Navigate to the `server` directory: `cd server`
3. Create a `.env` file in the `server` directory and add your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mini_erp?schema=public"
   JWT_SECRET="your_super_secret_jwt_key"
   PORT=3000
   ```
4. Run Prisma migrations to set up the schema:
   ```bash
   npx prisma migrate dev --name init
   ```

### 2. Backend Setup
1. Stay in the `server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend development server:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:3000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` directory: `cd client`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 🔗 Live URLs (Development)

*   **Live Frontend URL**: [http://localhost:5173](http://localhost:5173)
*   **Live Backend API URL**: [http://localhost:3000](http://localhost:3000)

---

## Test Login Credentials

Use the following credentials to test different role-based workflows in the application:

**Admin Role**
*   **Email**: admin@erpcrm.com
*   **Password**: Admin@123

**Sales Role**
*   **Email**: sales@erpcrm.com
*   **Password**: Sales@123

**Warehouse Role**
*   **Email**: warehouse@erpcrm.com
*   **Password**: Warehouse@123

**Accounts Role**
*   **Email**: accounts@erpcrm.com
*   **Password**: Accounts@123

---

## Known Limitations / Incomplete Parts

*   **Analytics / Activity Feed**: The "Recent Activity" on the dashboard currently shows the last 5 stock movements, but deeper analytics and reporting charts are not yet fully implemented.
*   **Pagination**: While the backend API supports pagination for lists (Customers, Products, Challans), the frontend UI currently relies on scrolling/limits rather than a full multi-page navigation component.
*   **Role-Based Access Control (RBAC)**: Roles (Admin, Sales) exist in the database and registration flow, but granular route protection (preventing Sales from accessing Admin-only settings) is minimally enforced on the frontend.
*   **PDF Export Formatting**: The "Export PDF" feature relies on browser-native printing (`react-to-print`). Complex page breaks on extremely large invoices might require further CSS `@media print` optimization.
