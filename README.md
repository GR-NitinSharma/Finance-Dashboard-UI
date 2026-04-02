# 🚀 Gravity Finance Dashboard

A premium, interactive finance dashboard built with **React**, **TypeScript**, and **Vanilla CSS**. This project was developed as a frontend engineering assignment to demonstrate expertise in state management, data visualization, responsive design, and RBAC (Role-Based Access Control) simulation.

## ✨ Key Features

- **📊 Comprehensive Analytics**:
  - Real-time calculation of Total Balance, Income, and Expenses.
  - **Balance Trend**: Interactive Area Chart showing the last 15 days of financial activity.
  - **Spending Breakdown**: Categorical breakdown using a Pie Chart with dynamic legends.
- **💸 Transaction Management**:
  - Full CRUD operations (Add, Delete, View) simulated on the frontend.
  - Advanced filtering by **Category** and **Type** (Income/Expense).
  - Search functionality by description or category.
  - **CSV Export**: Export your filtered transactions for external use.
- **🔐 Simulated RBAC (Role-Based Access Control)**:
  - Toggle between **Admin** and **Viewer** roles.
  - UI adapts dynamically: Admin can modify data, while Viewer has a protected, read-only experience.
- **💡 Smart Insights**:
  - Automated observations: Highest spending category, Monthly growth, and Savings efficiency.
- **🌓 Dark Mode & Personalization**:
  - Seamless toggle between Light and Dark themes with persistence.
  - Fluid animations powered by `framer-motion`.
- **📱 Fully Responsive**:
  - Optimized for Desktop, Tablet, and Mobile.
  - Glassmorphic UI elements for a modern premium feel.

## 🛠️ Built With

- **React 18** (Vite template)
- **TypeScript** for robust typing
- **Vanilla CSS** (Custom CSS Variables & Modern Utility Classes)
- **Recharts** for data visualization
- **Lucide React** for consistent iconography
- **Framer Motion** for micro-interactions and transitions

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🧠 Approach & Decisions

- **State Management**: I used **React Context API** to maintain a "Single Source of Truth." This ensures that when a transaction is added or deleted, the charts and insights update instantly across the application.
- **Design System**: Instead of relying on a framework like Tailwind for everything, I built a custom **CSS Variable-based Design System**. This allows for effortless Dark/Light mode switching and precise control over the application's "Premium" aesthetic.
- **Persistence**: Used `localStorage` to ensure the user's data and preferred mode (Admin/Viewer and Dark/Light) remain consistent across sessions.
- **RBAC**: Implemented logic in the `FinanceProvider` that prevents mutations if the current role is not `admin`, providing a safe simulation of role-based security.

## 📝 Folder Structure

```
src/
├── components/     # Reusable UI & Section components
├── context/        # Global State & Logic (FinanceContext)
├── data/           # Mock data & Interfaces
├── styles/         # Global styles & Variable definitions
├── App.tsx         # Root component with Routing & Tab logic
└── main.tsx        # Entry point
```

---
*Created with ❤️ by Nitin Sharma for the Zorvyn Internship Selection.*
