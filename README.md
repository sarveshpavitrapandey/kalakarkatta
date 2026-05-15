# KalakarKatta 🎨 — The Ultimate Artist Platform

> A premium full-stack platform for artists, creators, and professionals to showcase portfolios, discover opportunities, connect with the community, and grow their creative career.

---

## ✅ Platform Status

All core services are **live and verified working**:

| Service | Status |
|---|---|
| 🔐 Authentication (JWT + Email Verification) | ✅ Operational |
| 📧 Email Notifications (Nodemailer) | ✅ Operational |
| 💬 Real-time Messaging (Socket.io) | ✅ Operational |
| 🔔 Notifications System | ✅ Operational |
| 🤖 AI Chatbot | ✅ Operational |
| 🖼️ Image Uploads (Cloudinary) | ✅ Operational |
| 💳 Payments (Razorpay) | ✅ Operational |
| 🗄️ Database (MongoDB) | ✅ Operational |

---

## 🚀 Features

- **🔐 Secure Authentication** — JWT-based login, registration, password reset, and email verification via Nodemailer.
- **🤖 AI Chatbot** — Integrated AI assistant to help users navigate the platform and answer creative queries.
- **💬 Real-time Messaging** — Direct messaging between creators powered by Socket.io with live delivery.
- **🔔 Notifications** — In-app notification system for likes, messages, and activity updates.
- **🖼️ Creator Portfolio** — Showcase your best work with high-quality image uploads via Cloudinary.
- **📝 Social Feed** — Post, edit, and delete your work. Like and interact with the community feed.
- **💼 Job Board** — Find and apply for creative roles or post your own listings.
- **🎭 Events Management** — Discover upcoming art events and pay for tickets securely via Razorpay.
- **👤 Profile Management** — Update your profile, avatar, bio, and portfolio links.
- **🎨 Premium UI** — Glassmorphic design with animated mesh gradients and smooth transitions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 18, Vite, Vanilla CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | Socket.io |
| **File Storage** | Cloudinary |
| **Payments** | Razorpay |
| **Email** | Nodemailer |
| **AI** | AI Gateway (OpenAI-compatible API) |
| **Auth** | JSON Web Tokens (JWT) + bcryptjs |

---

## 🏃 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (Local instance or MongoDB Atlas)
- Accounts for: Cloudinary, Razorpay, an AI Gateway provider, and an SMTP email provider.

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/sarveshpavitrapandey/kalakarkatta.git
cd kalakarkatta
```

**2. Setup the Backend:**
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret

# Cloudinary
CLOUDINARY_URL=your_cloudinary_url

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AI Chatbot
AI_GATEWAY_API_KEY=your_ai_gateway_api_key
TAVILY_API_KEY=your_tavily_api_key

# Email (Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

# CORS
CLIENT_ORIGIN=http://localhost:5173
```

**3. Setup the Frontend:**
```bash
cd ../client
npm install
```

### Running the Application

**Terminal 1 — Start Backend:**
```bash
cd server
node server.js
# Backend runs at http://localhost:5000
```

**Terminal 2 — Start Frontend:**
```bash
cd client
npm run dev
# Frontend runs at http://localhost:5173
```

> Open your browser at **http://localhost:5173** to access the platform.

---

## 📁 Project Structure

```
kalakarkatta/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route-level page components
│       └── ...
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Route handler logic
│   │   ├── middleware/      # Auth guards, validators
│   │   ├── models/          # Mongoose data models
│   │   └── routes/          # API route definitions
│   └── server.js            # App entry point
└── README.md
```

---

## 📡 API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/posts` | Protected | Get all community posts |
| POST | `/api/posts` | Protected | Create a new post |
| GET | `/api/events` | Public | Get all events |
| GET | `/api/jobs` | Public | Get all job listings |
| GET | `/api/messages/:id` | Protected | Get conversation messages |
| GET | `/api/notifications` | Protected | Get user notifications |
| POST | `/api/chatbot/chat` | Protected | Send message to AI chatbot |

---

## 📄 License

This project is licensed under the **MIT License**.
