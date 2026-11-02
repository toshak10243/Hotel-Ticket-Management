# QR-Based Hotel Service Request and Complaint Management System
## Hotel Arya Niwas, Jaipur

An academic full-stack web application designed for hotel guests to submit requests and complaints by scanning a QR code located in their room, and for hotel staff/management to track, assign, update, and resolve tickets through a dashboard.

---

## 1. Features

- **Guest Interface (No login required)**:
  - Submit service requests (Housekeeping, Maintenance, Room Service, Front Office, Other) or complaints.
  - Automatic room pre-fill via QR code query parameter (e.g. `/guest/request?room=101`).
  - Priority selection (Low, Medium, High).
  - Generation of a unique Ticket ID (e.g., `AN-2026-3507`).
  - Real-time Ticket Tracking view with visual stage progression and historical status timeline.
  - Built-in Room QR Standee Generator to preview and print custom room QR codes.

- **Staff & Admin Dashboard (JWT Protected)**:
  - Overview statistics: Total Requests, Pending, In Progress, Resolved, High Priority.
  - Request table with multi-factor filtering (Status, Category, Priority) and real-time search.
  - Ticket management: update status (`Pending`, `Assigned`, `InProgress`, `Resolved`, `Closed`), assign departments, and add staff audit remarks.
  - Request history tracking: every status change is logged into `RequestHistory` with user association.
  - **Manager Features**: Monitor critical high-priority complaints, add escalation notes, and formally close resolved tickets.
  - **Admin Features**: Create and manage staff accounts (`Admin`, `Manager`, `Staff`).

- **Theme & UI**:
  - Clean, light/white corporate aesthetic with zero dark/purple accents, adhering to academic presentation standards.
  - Responsive layout for mobile (guests) and desktop (staff).

---

## 2. Technology Stack

- **Frontend**: React.js (Vite), React Router DOM v7, Tailwind CSS v4, Lucide React, Axios, SweetAlert2, qrcode.react.
- **Backend**: Node.js, Express.js, REST API, JWT Authentication, bcryptjs password hashing.
- **Database & ORM**: PostgreSQL, Prisma ORM with automated push and seed workflows.

---

## 3. Demo Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Admin** | `admin@aryaniwas.com` | `password123` | Full control, User creation, Management |
| **Manager** | `manager@aryaniwas.com` | `password123` | Escalations, Ticket closing, Monitoring |
| **Staff** | `amit@aryaniwas.com` | `password123` | Housekeeping request updates |
| **Staff** | `vikram@aryaniwas.com` | `password123` | Maintenance request updates |

*(Quick-fill buttons are also available directly on the login page for convenience during evaluation).*

---

## 4. Setup and Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running on port 5432
  - Default connection used: `postgresql://postgres:Root%40123@localhost:5432/arya_niwas_db`

### Step 1: Clone / Open Repository
```bash
cd "Arya Nivaas"
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Configure `.env` in `backend/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:Root%40123@localhost:5432/arya_niwas_db?schema=public"
JWT_SECRET="arya_niwas_super_secret_jwt_key_2026"
```

### Step 3: Run Database Migrations & Seed
Run Prisma to auto-generate the schema and load the 10 demo requests:
```bash
npx prisma db push
npm run seed
```

### Step 4: Start Backend Server
```bash
npm start
# Runs at http://localhost:5000
```

### Step 5: Frontend Setup & Launch
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

---

## 5. Major URLs & Testing Workflow

1. **Guest Request Page**: `http://localhost:5173/guest/request`
   - Test pre-filled room link: `http://localhost:5173/guest/request?room=302`
2. **Track Request**: `http://localhost:5173/guest/track`
   - Try tracking demo ticket: `AN-2026-1022`
3. **Room QR Generator**: `http://localhost:5173/guest/qr-generator`
4. **Staff Login**: `http://localhost:5173/login`
5. **Staff Dashboard**: `http://localhost:5173/dashboard`
6. **Request Management**: `http://localhost:5173/dashboard/requests`
7. **Manager Oversight**: `http://localhost:5173/dashboard/manager`
8. **Staff Management**: `http://localhost:5173/dashboard/staff-management`

