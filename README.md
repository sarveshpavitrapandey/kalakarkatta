# KalakarKatta - The Ultimate Artist Platform

KalakarKatta is a premium full-stack platform designed for artists, creators, and professionals to showcase their portfolios, discover job opportunities, join events, and build a vibrant community.

## 🚀 Features

- **Dynamic Hero Section:** Beautifully animated mesh gradient background for a premium feel.
- **Creator Portfolio:** Showcase your best work with high-quality image uploads (Cloudinary integrated).
- **Job Board:** Find and apply for creative roles or post your own listings.
- **Events Management:** Discover upcoming art events and pay for tickets securely via Razorpay.
- **AI Chatbot:** Integrated AI assistant to help users navigate the platform and answer queries.
- **Real-time Messaging:** Connect with other creators through an interactive chat system.
- **Secure Authentication:** JWT-based auth with password reset and email verification.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Vanilla CSS (Premium Glassmorphic Design).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **File Storage:** Cloudinary.
- **Payments:** Razorpay.
- **AI:** AI Gateway (OpenAI-compatible).

## 🏃 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas)
- Accounts for Cloudinary, Razorpay, and an AI Gateway provider.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sarveshpavitrapandey/kalakarkatta.git
   cd kalakarkatta
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   RAZORPAY_KEY_ID=your_razorpay_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   AI_GATEWAY_API_KEY=your_ai_key
   tavily_api_key=your_tavily_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. **Setup Frontend:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd client
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## 📄 License

This project is licensed under the MIT License.
# kalakarkatta
