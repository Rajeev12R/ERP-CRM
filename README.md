# Mini ERP + CRM Operations Portal

A modern, full-stack Enterprise Resource Planning (ERP) web application built to streamline customer management, product inventory and sales challan processing. 

## Short Explanation of Architecture

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

### How the server was set up
The backend server is an Express.js application using Prisma as an ORM to interact with PostgreSQL. It uses JWT for authentication, bcrypt for password hashing, and CORS/cookie-parser for cross-origin requests and session management.

### How Environment Variables are Managed
Environment variables are managed using `.env` files. Both `client` and `server` directories have `.env` files for configuration.
*   `server/.env`: Contains `DATABASE_URL`, `JWT_SECRET`, and `PORT`.
*   `client/.env`: Contains `VITE_API_URL` to point to the backend server.

### 1. Database Setup
1. Create a PostgreSQL database.
2. Navigate to the `server` directory: `cd server`
3. Create a `.env` file in the `server` directory and add your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mini_erp?schema=public"
   JWT_SECRET="your_super_secret_jwt_key"
   PORT=3000
   ```
4. Run Prisma migrations to set up the schema:
   ```bash
   npx prisma migrate dev --name init
   ```

### 2. How to run the project locally (Backend)
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

### 3. How to run the project locally (Frontend)
1. Open a new terminal and navigate to the `client` directory: `cd client`
2. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL="http://localhost:3000/api"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## How to Deploy the Project

*   **Database**: Use a managed PostgreSQL provider like Supabase, Neon, or Render Postgres. Get the connection string and add it to the backend's environment variables.
*   **Backend (Render, Railway, Fly.io, etc.)**: 
    1. Connect your GitHub repository to the deployment platform.
    2. Set the build command to `npm install && npx prisma generate`.
    3. Set the start command to `npm start`.
    4. Add the `DATABASE_URL` and `JWT_SECRET` environment variables.
*   **Frontend (Vercel, Netlify, Render Static Site, etc.)**:
    1. Connect your GitHub repository.
    2. Set the root directory to `client`.
    3. Set the build command to `npm run build`.
    4. Set the output directory to `dist`.
    5. Add the `VITE_API_URL` environment variable pointing to the deployed backend API URL.

---

## 🔗 Live URLs & Documentation

*   **Live Frontend URL**: [https://erp-crm-pi.vercel.app/](https://erp-crm-pi.vercel.app)
*   **Live Backend API URL**: [https://erp-crm-ds1i.onrender.com/](http://localhost:3000)


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

## Assumptions Made
*   Users are pre-registered or created by an Admin (no public signup route).
*   Challans reduce stock immediately upon confirmation.
*   Stock cannot go negative; any attempt to create a challan with insufficient stock is rejected.
*   Follow-up notes and customer history are simplistic, tied directly to the customer model or a basic related table.

## Known Limitations / Incomplete Parts

*   **Analytics / Activity Feed**: The "Recent Activity" on the dashboard currently shows the last 5 stock movements, but deeper analytics and reporting charts are not yet fully implemented.
*   **Pagination**: While the backend API supports pagination for lists (Customers, Products, Challans), the frontend UI currently relies on scrolling/limits rather than a full multi-page navigation component.
*   **Role-Based Access Control (RBAC)**: Roles (Admin, Sales) exist in the database and registration flow, but granular route protection (preventing Sales from accessing Admin-only settings) is minimally enforced on the frontend.
*   **PDF Export Formatting**: The "Export PDF" feature relies on browser-native printing (`react-to-print`). Complex page breaks on extremely large invoices might require further CSS `@media print` optimization.
