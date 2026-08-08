# ⚡ Kaduna Electric Token Vending System

A full-stack web application for purchasing prepaid electricity tokens for Kaduna Electric meters. Built with **Node.js**, **Express**, **MongoDB**, **React**, and **Paystack** payment integration.

---

## ✨ Features

### Customer Features
- 🔐 **Real User Accounts** — Secure registration & login with JWT
- 🔑 **Password Reset** — Email-based password recovery
- 👤 **Customer Profiles** — Manage personal information
- 📟 **Meter Management** — Add, save, and validate multiple meter numbers
- 💳 **Token Purchasing** — Buy electricity tokens with Paystack
- 🧾 **Transaction History** — View all past purchases with pagination
- 📄 **Downloadable Receipts** — PDF receipts for every transaction
- 📱 **Mobile-Friendly** — Fully responsive design

### Admin Features
- 📊 **Dashboard** — Real-time stats and analytics
- 👥 **User Management** — View and manage all customers
- 💰 **Transaction Monitoring** — Search and filter all payments
- 🔍 **Meter Search** — Find meters across the platform

### Security
- 🔒 **Bcrypt Password Hashing** — 12 salt rounds
- 🛡️ **JWT Authentication** — Stateless token-based auth
- 🚦 **Rate Limiting** — Protect against brute force & spam
- ✅ **Input Validation** — Zod + express-validator
- 🔐 **Helmet Headers** — Security headers
- 📡 **Webhook Signature Verification** — Secure Paystack webhooks

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS + Zustand |
| **Backend** | Node.js 20 + Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Payments** | Paystack (Nigeria) |
| **Vending** | VTpass / BuyPower API (simulated for dev) |
| **PDF** | PDFKit |
| **Email** | Nodemailer (SMTP) |
| **SMS** | Termii (structure ready) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Paystack account (free test keys)

### 1. Clone & Setup

```bash
cd kaduna-electric-vending
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Fill in your credentials:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB (get from mongodb.com/atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kaduna-electric

# JWT (generate a strong secret)
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Paystack (get from dashboard.paystack.com)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Email (Gmail SMTP or SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Fill in:
```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

Start the app:
```bash
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🧪 Testing Paystack Payments

Use Paystack test card details:
- **Card Number:** `4084084084084081`
- **CVV:** `000`
- **Expiry:** Any future date (e.g., 12/25)
- **PIN:** `0000`

---

## 📁 Project Structure

```
kaduna-electric-vending/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Paystack, vending, notifications
│   │   ├── utils/          # Receipt generator
│   │   └── app.js          # Express app entry
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/       # Login, Register, ForgotPassword
    │   │   ├── dashboard/  # User dashboard
    │   │   ├── meters/     # Meter management
    │   │   ├── payment/    # Buy token, payment callback
    │   │   ├── tokens/     # History, receipts
    │   │   ├── admin/      # Admin dashboard
    │   │   └── ui/         # Navbar, Loading, Toast
    │   ├── services/       # API client
    │   ├── store/          # Zustand auth store
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Meters
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meters` | Add meter |
| GET | `/api/meters` | List meters |
| DELETE | `/api/meters/:id` | Remove meter |
| POST | `/api/meters/validate` | Validate meter number |

### Payments & Tokens
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initialize` | Start Paystack payment |
| GET | `/api/payments/verify/:ref` | Verify payment |
| POST | `/api/payments/webhook` | Paystack webhook |
| GET | `/api/payments/history` | Transaction history |
| GET | `/api/payments/transactions/:id/receipt` | Download PDF |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/transactions` | All transactions |
| GET | `/api/admin/meters` | All meters |

---

## 🌐 Going Live

### 1. Get Real Vending API Access

The app currently uses a **simulated vending service** for development. To go live, you need a real token vending API:

**Option A: VTpass**
- Sign up at [vtpass.com](https://vtpass.com)
- Get API credentials
- Replace `vendingService.js` simulate methods with real API calls

**Option B: BuyPower**
- Sign up at [buypower.ng](https://buypower.ng)
- Request API access
- Integrate their vending endpoints

**Option C: Direct DISCO Partnership**
- Contact Kaduna Electric directly
- Request API access for token vending

### 2. Switch Paystack to Live

1. Complete Paystack business verification
2. Switch from test keys to live keys in `.env`
3. Update webhook URL to your production domain

### 3. Deploy

**Backend:** Deploy to [Render](https://render.com), [Railway](https://railway.app), or [DigitalOcean](https://digitalocean.com)

**Frontend:** Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

**Database:** Use MongoDB Atlas (already cloud-hosted)

**Domain:** Buy from [Namecheap](https://namecheap.com), point to Vercel

**SSL:** Automatic on Vercel/Render, or use Cloudflare

---

## 🔐 Security Checklist

- [ ] Change default JWT secret to 32+ random characters
- [ ] Use strong MongoDB password
- [ ] Enable Paystack webhook signature verification
- [ ] Set up rate limiting (already configured)
- [ ] Use HTTPS in production
- [ ] Store `.env` files securely (never commit to Git)
- [ ] Enable MongoDB IP whitelist
- [ ] Set up Sentry for error monitoring
- [ ] Regular database backups

---

## 📝 License

MIT License — Free for personal and commercial use.

---

## 🆘 Support

For issues or questions:
1. Check the API health: `GET /api/health`
2. Review server logs
3. Check Paystack dashboard for payment status
4. Verify MongoDB connection

---

Built with ❤️ for Kaduna Electric customers.
