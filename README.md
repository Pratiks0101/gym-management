# Multi-Tenant Gym Management SaaS Platform

A production-ready multi-tenant SaaS application designed for gym owners and administrators to streamline membership workflows, track recurring subscriptions, analyze revenue metrics, and prevent unauthorized gym access using a dynamic verification engine.

## Key Features

- **Multi-Tenant Architecture:** Isolated data access for separate gym branches, managing member profiles, active subscriptions, and administrative roles.
- **Dynamic QR Check-in Engine:** Real-time access verification system featuring 10-second auto-regenerating QR tokens and mobile verification to eliminate proxy check-ins.
- **Analytics Dashboard:** Visual performance tracking for monthly recurring revenue (MRR), total active members, subscription expirations, and attendance trends.
- **Web Accessibility (a11y):** Built with strict keyboard navigation, high-contrast UI patterns, and ARIA-compliant component structures.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** React, Tailwind CSS
- **Database & Auth:** PostgreSQL, Supabase
- **Deployment & Tooling:** Git, GitHub, Netlify / Vercel

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm / pnpm / yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/Pratiks0101/gym-management.git](https://github.com/Pratiks0101/gym-management.git)
   cd gym-management

2. Install dependencies:
   ```bash
   npm install

3. Set up environment variables:
    Create a .env.local file in the root directory and add your Supabase credentials:

   ```code snippet
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Run the development server:
    ```bash
   npm run dev

5. Open http://localhost:3000 in your browser to view the application.