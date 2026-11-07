# 🌾 AgriConnect — Farmer-to-Buyer Marketplace (MERN)

A complete, production-ready full-stack marketplace connecting regional farmers directly with buyers and restaurants. Built with **React 18 + Vite**, **Node.js + Express**, and **MongoDB + Mongoose**.

---

## 🚀 Deploy on Render

1. Create a MongoDB database on [MongoDB Atlas](https://www.mongodb.com/atlas) and allow connections from Render. Copy its connection string.
2. Push this repository to GitHub and create a new Blueprint on [Render](https://render.com/) using the repository. Render reads the root `render.yaml` to create the API and static frontend.
3. When prompted, set `MONGO_URI` to the Atlas connection string. Render generates `JWT_SECRET` and connects the API and frontend automatically.
4. Wait for both services to finish deploying. The API health check is available at `/api/health`.

The deployed app intentionally includes the demo accounts below, including the fixed admin password `ChangeMe123!`. Treat this as a public demo only: anyone can use that admin account. Do not use the demo database for private or real customer data.

## ⚡ Quick Start (1-Click Run)

### Option A: Windows Double-Click (Easiest)
Simply double-click **`start.bat`** (or run `.\start.ps1` in PowerShell).  
It will automatically launch both the Backend server and Frontend Vite client in separate terminal windows!

### Option B: Manual Command Line
```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend
cd client
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login on UI)

The login page includes **1-Click Demo Buttons** for instant evaluation across all roles:

| Role | Email | Password | Details |
|---|---|---|---|
| **Farmer (Ramesh)** | `ramesh@farm.com` | `Farmer123!` | Verified producer with active crops & incoming orders |
| **Farmer (Gurpreet)** | `gurpreet@punjabfarms.com` | `Farmer123!` | Grain & pulse grower (Punjab) |
| **Farmer (Savitri)** | `savitri@hillsagro.com` | `Farmer123!` | Pending verification (Use Admin to verify!) |
| **Buyer (Priya)** | `priya@market.com` | `Buyer123!` | Has completed order & ready to leave reviews |
| **Buyer (Rahul)** | `rahul@kitchen.com` | `Buyer123!` | Restaurant buyer with pending & accepted orders |
| **Admin** | `admin@agriconnect.com` | `ChangeMe123!` | Marketplace moderator & verification officer |

To re-seed fresh demo data at any time:
```bash
cd server
npm run seed
```
*(The server also automatically auto-seeds initial data on first boot if the database is empty).*

---

## 🚀 Key Features

### 1. Fresh Produce Marketplace
- **Real-time Live Catalog**: Browse fresh crops directly from local farmers.
- **Instant Search & Regex Filtering**: Search by crop name, category, or description (e.g. `tomatoes`, `basmati`, `turmeric`).
- **Location Filtering**: Filter produce by state/city (e.g. `Punjab`, `Nashik`, `Himachal`).
- **Sorting**: Sort by Newly Listed, Price (Low to High), or Price (High to Low).
- **Stock Tracking**: Live indicator of available quantities in `kg` or `quintal`.

### 2. Farmer Experience
- **Crop Publishing**: Form with category selection, stock quantity, unit, price per unit, photo URL, and description.
- **Inventory Management**: Edit stock, update prices, or deactivate listings in real time.
- **Order Processing Workflow**:
  - Receive incoming orders in real time.
  - **Accept** or **Reject** pending orders (rejecting automatically restores crop stock).
  - Mark accepted orders **Fulfilled** once delivered.
- **Verified Farmer Badge**: Builds trust with consumers.

### 3. Buyer Experience
- **Direct Ordering**: Calculate total payable amount in real time (`quantity × pricePerUnit`).
- **Stock Protection**: Cannot order more than available stock; atomic reservation prevents overselling.
- **Order Tracking**: Track order status (`Pending`, `Accepted`, `Fulfilled`, `Cancelled`, `Rejected`).
- **Self-Service Cancellation**: Buyers can cancel pending orders; stock is instantly restored to the farmer.
- **Rating & Reviews**: Rate farmers with 1-5 stars and write feedback upon order fulfillment.

### 4. Admin Dashboard & Analytics
- **Marketplace KPIs**:
  - Total registered users
  - Active crop listings
  - Total platform orders
  - Total fulfilled GMV (Gross Merchandise Value sales in ₹)
- **User Management**: View all registered farmers and buyers.
- **Farmer Verification**: 1-click verification of producer credentials to display verified badges.

---

## 🧪 Automated End-to-End Acceptance Tests

AgriConnect includes a comprehensive automated test script that validates the entire business flow:
```bash
cd server
node -e "import('./server.js').then(async () => { await new Promise(r => setTimeout(r, 1500)); const { default: runTests } = await import('./test-flows.js'); await runTests(); process.exit(0); })"
```
**Tested Flows**:
1. Server health check
2. Farmer, Buyer, and Admin authentication
3. Crop catalog search and filtering
4. Buyer placing a stock-reserved order
5. Automatic atomic stock decrement verification
6. Farmer accepting the order
7. Farmer fulfilling the order
8. Buyer submitting a 5-star review
9. Admin verifying a pending farmer
10. Admin fetching aggregate sales and user reports

---

## 📁 Project Architecture

```
AgriConnect/
├── start.bat                   # 1-click Windows runner
├── start.ps1                   # PowerShell runner
├── package.json                # Root package scripts
├── README.md                   # Complete documentation
│
├── server/                     # Node.js + Express backend
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── adminController.js  # User management & metrics
│   │   ├── authController.js   # JWT authentication & registration
│   │   ├── cropController.js   # Crop CRUD, search & filters
│   │   ├── orderController.js  # Atomic stock reservation & orders
│   │   └── reviewController.js # Fulfilled-order review system
│   ├── middleware/
│   │   └── auth.js             # JWT verification & RBAC middleware
│   ├── models/
│   │   ├── Crop.js             # Crop schema & indexes
│   │   ├── Order.js            # Order lifecycle schema
│   │   ├── Review.js           # 1-per-order farmer reviews
│   │   └── User.js             # Farmer/Buyer/Admin user schema
│   ├── routes/                 # Express API routes
│   ├── seed.js                 # Automatic & CLI database seeder
│   ├── test-flows.js           # E2E acceptance test suite
│   ├── server.js               # Application entry point
│   └── .env                    # Environment configuration
│
└── client/                     # React 18 + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── CropCard.jsx    # Produce card with farmer verified badge
    │   │   └── Navbar.jsx      # Navigation bar with user profile
    │   ├── context/
    │   │   └── AuthContext.jsx # User session & token management
    │   ├── pages/
    │   │   ├── Auth.jsx        # Login & Register with 1-click demo logins
    │   │   ├── CropDetails.jsx # Produce details, reviews & order form
    │   │   ├── Dashboard.jsx   # Role-based Farmer, Buyer & Admin dashboard
    │   │   └── Home.jsx        # Marketplace homepage with live search & filters
    │   ├── services/
    │   │   └── api.js          # Axios instance with JWT interceptor
    │   ├── App.jsx             # Router and layout configuration
    │   └── styles.css          # Modern typography & responsive layout
    └── vite.config.js          # Vite build config
```

---

## 🌐 API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health status check |
| `POST` | `/api/auth/register` | Public | Register as Farmer or Buyer |
| `POST` | `/api/auth/login` | Public | JWT Login |
| `GET` | `/api/auth/me` | Authenticated | Current user profile |
| `GET` | `/api/crops` | Public | Search, filter, and sort active crops |
| `GET` | `/api/crops/:id` | Public | Get single crop details |
| `POST` | `/api/crops` | Farmer | Publish a new crop listing |
| `GET` | `/api/crops/mine` | Farmer | View all listings owned by farmer |
| `PATCH` | `/api/crops/:id` | Owner Farmer | Update stock, price, or details |
| `DELETE` | `/api/crops/:id` | Owner Farmer | Deactivate crop listing |
| `POST` | `/api/orders` | Buyer | Place order with atomic stock check |
| `GET` | `/api/orders/my` | Authenticated | View orders (Buyer or Farmer view) |
| `PATCH` | `/api/orders/:id/status`| Owning Farmer| Accept, Reject, or Fulfill order |
| `PATCH` | `/api/orders/:id/cancel`| Owning Buyer | Cancel pending order & restore stock |
| `POST` | `/api/reviews` | Buyer | Submit review for fulfilled order |
| `GET` | `/api/reviews/farmer/:id`| Public | Fetch reviews for a specific farmer |
| `GET` | `/api/admin/users` | Admin | List all registered users |
| `PATCH` | `/api/admin/farmers/:id/verify` | Admin | Verify a farmer account |
| `GET` | `/api/admin/reports` | Admin | Aggregate sales and user analytics |
