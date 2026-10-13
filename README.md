# PropertyConnect — Direct Property Buying, Selling and Rental Platform

**PropertyConnect** is a full-stack real estate marketplace (peer-to-peer, zero-brokerage) built for direct property transactions between property owners, buyers, and tenants. It eliminates intermediary broker commissions by offering verified contact details, instant WhatsApp chats, direct calling, and private enquiry submissions.

---

## 📁 Repository Structure (Separated Frontend and Backend)

```
property-project/
├── frontend/                   # Frontend React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, Footer, PropertyCard, MapComponent, etc.
│   │   ├── context/            # AuthContext, FavoriteContext
│   │   ├── pages/              # Home, Browse, Details, PostProperty, Dashboards, Auth
│   │   ├── services/           # Axios API instance
│   │   ├── utils/              # formatPrice, formatDate, etc.
│   │   ├── App.jsx             # React Router structure
│   │   ├── main.jsx            # React root
│   │   └── index.css           # Tailwind v4, Leaflet styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # API proxy configuration
├── backend/                    # Backend Node.js + Express + MongoDB
│   ├── config/                 # db.js, upload.js
│   ├── controllers/            # auth, property, favorite, enquiry, report, admin
│   ├── middleware/             # auth.js (protect, authorize), errorHandler.js
│   ├── models/                 # User, Property, Favorite, Enquiry, PropertyReport, AdminAuditLog
│   ├── routes/                 # Express API routes
│   ├── scripts/                # seed.js, createAdmin.js
│   ├── services/               # dbStore.js (in-memory demo fallback)
│   ├── tests/                  # api.test.js
│   ├── uploads/                # Local file storage fallback
│   ├── app.js                  # Express middleware & route setup
│   ├── server.js               # Server entrypoint
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide (Windows 11)

Both the backend and frontend are pre-configured to run out of the box with zero external configuration. If local MongoDB is offline, the backend automatically boots with an active in-memory demo data store pre-populated with all 6 sample properties and demo accounts.

### 1. Start the Backend Server (Port 5000)
Open a PowerShell terminal in the project directory:
```powershell
cd backend
npm start
```
*Health Check URL:* `http://localhost:5000/api/health`

### 2. Start the Frontend Application (Port 5173)
Open a second PowerShell terminal in the project directory:
```powershell
cd frontend
npm run dev
```
*Application URL:* Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 🔑 Demo Accounts (1-Click Login Enabled)

On the `/login` page, you can click the **Instant Demo Logins** buttons to sign in with one click:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@propertyconnect.com` | `Admin@1234` | Moderate listings, approve/reject submissions, suspend users, audit logs |
| **Property Owner** | `owner@propertyconnect.com` | `Owner@1234` | Post properties, manage listings, mark sold/rented, view buyer enquiries |
| **Buyer / Tenant** | `buyer@propertyconnect.com` | `Buyer@1234` | Browse, filter, save favorites, submit enquiries, view inquiry history |

---

## 🏙️ Sample Marketplace Properties Preloaded

1. **Residential House in Hassan**: *Spacious 3 BHK Independent Villa with Private Garden in Hassan* (₹85 Lakh, Sale, Approved)
2. **Apartment in Bengaluru**: *Luxury 3 BHK High-Rise Apartment in Indiranagar, Bengaluru* (₹1.95 Cr, Sale, Approved)
3. **Residential Plot in Mysuru**: *Premium MUDA Approved 40x60 Residential Plot in Vijayanagar, Mysuru* (₹60 Lakh, Sale, Approved)
4. **Rental House in Mangaluru**: *Charming 2 BHK Sea-Breeze Rental Home in Kadri, Mangaluru* (₹22,000/mo, Rent, Approved)
5. **Commercial Shop in Bengaluru**: *High-Footfall Main Road Retail Commercial Shop in Koramangala, Bengaluru* (₹95,000/mo, Rent, Approved)
6. **Agricultural Land in Mandya**: *2-Acre Fertile Organic Agricultural Farmland with Canal Water in Mandya* (₹48 Lakh, Sale, **Pending Approval** for Admin demonstration)

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Leaflet & OpenStreetMap, React Hot Toast |
| **Backend** | Node.js (v24), Express.js, Helmet, CORS, Express-Rate-Limit, Multer |
| **Database** | MongoDB & Mongoose (with dual-mode fallback) |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs password hashing |
| **Image Storage** | Cloudinary integration with local disk fallback (`/uploads`) |
| **Testing** | Node.js native test runner (`node --test`) |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new owner or buyer account
- `POST /api/auth/login` — Sign in and receive a JWT token
- `POST /api/auth/logout` — Logout user session
- `GET /api/auth/me` — Retrieve authenticated user profile
- `PUT /api/auth/profile` — Update phone, name, and phone consent
- `PUT /api/auth/change-password` — Change password

### Properties (`/api/properties`)
- `GET /api/properties` — Search and filter approved public listings
- `GET /api/properties/featured` — Get featured listings for the homepage
- `GET /api/properties/:id` — View full details of a listing
- `GET /api/properties/:id/similar` — Get similar properties in the same city
- `GET /api/properties/my-listings` — View all listings owned by logged-in user
- `POST /api/properties` — Upload a new property listing with images (Multer/Cloudinary)
- `PUT /api/properties/:id` — Edit an existing listing
- `DELETE /api/properties/:id` — Delete a property listing
- `PATCH /api/properties/:id/availability` — Toggle status (`available`, `sold`, `rented`)

### Favorites (`/api/favorites`)
- `GET /api/favorites` — Get saved listings for authenticated user
- `POST /api/favorites` — Add property to favorites
- `DELETE /api/favorites/:propertyId` — Remove property from favorites

### Direct Enquiries (`/api/enquiries`)
- `POST /api/enquiries` — Send direct enquiry to property owner
- `GET /api/enquiries/received` — View enquiries received by owner
- `GET /api/enquiries/my` — View enquiries sent by buyer
- `PATCH /api/enquiries/:id/status` — Mark enquiry status (`pending`, `contacted`, `closed`)

### Administration (`/api/admin`)
- `GET /api/admin/dashboard` — Platform overview metrics
- `GET /api/admin/properties/pending` — List pending submissions
- `PATCH /api/admin/properties/:id/approve` — Approve a pending property
- `PATCH /api/admin/properties/:id/reject` — Reject a submission with mandatory reason
- `GET /api/admin/users` — List platform user accounts
- `PATCH /api/admin/users/:id/status` — Suspend/activate or verify owner
- `DELETE /api/admin/properties/:id` — Remove fraudulent listing
- `GET /api/admin/audit-logs` — Administrative audit trail

---

## 🧪 Automated Testing

To run the automated backend test suite:
```powershell
cd backend
npm test
```

---

## 🌐 Production Deployment Guide

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Add a Database User and allow IP Access (`0.0.0.0/0` or Render outbound IPs).
3. Copy the connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/propertyconnect?retryWrites=true&w=majority`.

### 2. Backend Deployment (Render)
1. Push this repository to GitHub.
2. In Render, create a new **Web Service** connected to your repo.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<random long string>`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
   - `CLOUDINARY_CLOUD_NAME`: `<your cloudinary name>` (optional)
   - `CLOUDINARY_API_KEY`: `<your cloudinary key>` (optional)
   - `CLOUDINARY_API_SECRET`: `<your cloudinary secret>` (optional)

### 3. Frontend Deployment (Vercel)
1. In Vercel, import the repository.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
