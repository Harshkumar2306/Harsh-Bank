<div align="center">
  <h1>🏦 Harsh Bank Web Portal</h1>
  <p><strong>The Cloud Command Center for Harsh Pay</strong></p>
</div>

<br/>

## 🌟 Overview

**Harsh Bank Web Portal** is the centralized cloud dashboard for the Harsh Pay ecosystem. It serves as the primary gateway for users to manage their wallets, view synced transactions, and securely download the latest version of the Harsh Pay Android application. 

Built with modern web technologies, it features a stunning, responsive, dark-mode design that prioritizes both aesthetics and robust security.

---

## 🚀 Key Features

* **🔐 Secure Authentication**: Integrated with Clerk for seamless, secure user sign-up and sign-in flows.
* **☁️ Real-time Synchronization**: Acts as the source of truth for the Harsh Pay mobile app, syncing offline balances and transactions to the cloud.
* **📥 Direct App Distribution**: Bypasses traditional app stores by securely hosting and serving the latest Android APK directly to users, with built-in cache-busting to ensure users always get the freshest build.
* **📊 Premium Dashboard**: A beautiful, glassmorphism-inspired UI built with Tailwind CSS that displays wallet balances and transaction history.
* **⚡ Blazing Fast**: Built on Next.js 14 (App Router) for incredibly fast page loads and optimal SEO.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 14 (React)
* **Styling:** Tailwind CSS & Framer Motion (for micro-animations)
* **Authentication:** Clerk
* **Icons:** Lucide React
* **Deployment:** Vercel (Recommended)

---

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18 or higher)
* A Clerk Account for Authentication
* A Supabase Account (or preferred database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshkumar2306/Harsh-Bank.git
   cd Harsh-Bank
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Clerk & Database keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🌐 Ecosystem Connection

This web portal is designed to work in tandem with the **[Harsh Pay Mobile App](https://github.com/Harshkumar2306/Harsh-Pay-App)**. Users create their accounts here on the web bank, load their initial balances, and then sync those balances to the mobile app for offline peer-to-peer transfers.

---

<div align="center">
  <p>Built with ❤️ by Harsh Kumar</p>
</div>
