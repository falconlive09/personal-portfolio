<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/icons/dark/android-chrome-192x192.png" />
  <img src="public/icons/light/android-chrome-192x192.png" alt="Project Logo" width="80" height="80" />
</picture>

# Neal Gautam — Technical Portfolio

### Engineering Real-Time Payment Systems, Scalable Microservices, and Distributed Data Platforms

[![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.187-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<!-- After the first deploy, add a Live Demo badge here:
[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Portfolio-6366f1?style=for-the-badge)](https://YOUR-SITE.vercel.app) -->
[![GitHub](https://img.shields.io/badge/GitHub-falconlive09-181717?style=for-the-badge&logo=github)](https://github.com/falconlive09)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/nealgautam)
[![LeetCode](https://img.shields.io/badge/LeetCode-Falcon09-FFA116?style=for-the-badge&logo=leetcode&logoColor=black)](https://leetcode.com/u/Falcon09/)

---

![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)

</div>

---

## Executive Summary

A production-grade, highly interactive portfolio and engineering blog for **Neal Gautam**, Software Development Engineer at the National Payments Corporation of India (NPCI), where he builds fraud detection and risk management systems for India's real-time payment rails (UPI, RuPay, IMPS, NETC).

The site goes beyond a static résumé: it combines physics-driven 3D scenes, a statically pre-rendered blog on system design and backend engineering, live GitHub activity, and an AI assistant that answers questions about Neal's work. Every page is fully responsive in portrait and landscape and is tuned for smooth rendering on phones.

---

## System Architecture & Technologies

### Core Framework
- **Next.js 16 (App Router):** Every page, project case study and blog post is pre-rendered at build time (SSG). Only the chat and contact API routes run on demand.
- **React 19 & TypeScript:** Strictly typed components with a single, typed content store (`src/data/`).

### 3D Graphics & Physics Simulation
- **Three.js & React Three Fiber (R3F):** Powers the WebGL rendering layer.
- **Rapier Physics:** Drives the interactive 3D lanyard on `/contact`, a rope-and-joint simulation you can grab and swing with a mouse or finger.
- **Spline:** Interactive 3D scenes on `/skills` and `/projects`.
- **Custom GLSL Shaders:** Procedural terrain behind `/gallery`, plus the Hyperspeed and warp backgrounds on the home page.

### UI/UX Choreography
- **Framer Motion & GSAP:** Scroll-linked choreography, micro-interactions and page transitions.
- **Tailwind CSS & Radix UI:** A utility-first design system with accessible primitives, plus light and dark themes.
- **Lenis:** Smooth, inertia-based scrolling.

### System Integrations & APIs
- **Dual-LLM AI Chatbot:** Groq (LLaMA 3.1) as the primary provider with automatic failover to Google Gemini. Its knowledge comes directly from `portfolio.ts`.
- **Contact Pipeline:** `/api/contact` delivers form submissions by email through Nodemailer and Gmail SMTP, with HTML-escaped content.
- **GitHub REST API:** Live profile, repository and recent-activity data for the GitHub showcase (public endpoints, no token required).
- **next-intl:** Centralised UI copy in `messages/en.json`.

---

## Project Structure

```text
PersonalBlog/
├── src/
│   ├── app/                          # Next.js 16 App Router Entry Points
│   │   ├── api/                      # Backend API Routes (Chatbot, Contact Form)
│   │   ├── projects/                 # Project Directory & Case Studies
│   │   ├── experience/               # Career & Education Timeline
│   │   ├── skills/                   # Skills, Tools & Tech Stack
│   │   ├── achievements/             # Certifications & Awards
│   │   ├── blog/                     # Block-Based Article Renderer
│   │   ├── gallery/                  # Photo Gallery (GLSL Terrain Hero)
│   │   ├── resume/                   # Custom PDF Rendering Engine (react-pdf)
│   │   └── contact/                  # Contact Form & 3D Lanyard
│   ├── components/
│   │   ├── three/                    # WebGL & R3F Components (Lanyard)
│   │   ├── blog/                     # Article Body Renderer
│   │   ├── sections/                 # Primary Page Layout Structures
│   │   ├── layout/                   # Navbar, Footer, Chatbot, Preloader
│   │   └── ui/                       # Custom Animated & Radix-Based Primitives
│   ├── data/
│   │   ├── portfolio.ts              # Centralized Profile, Experience & Project Store
│   │   ├── blogs.ts                  # Blog Articles
│   │   └── gallery.ts                # Gallery Photos & Captions
│   ├── hooks/                        # Custom React Hooks (Performance, Viewport)
│   └── styles/                       # Global CSS & Tailwind Directives
├── messages/                         # UI Copy (next-intl)
├── public/                           # Static Assets (Images, 3D Models, PDFs, Favicons)
├── scripts/                          # Asset Tooling (Lanyard Card Texture Builder)
├── next.config.ts                    # Next.js Optimization Configuration
└── tailwind.config.ts                # Custom Design System Configuration
```

---

## Key Features

### 1. Interactive 3D Lanyard
A physics-simulated identification badge built with `@react-three/fiber`, `@react-three/drei` and `@react-three/rapier`. It responds to drag velocity and gravity in real time, and supports touch dragging on phones without scrolling the page. The card artwork is packed into a single texture by `scripts/build-lanyard-card.mjs`.

### 2. Autonomous Portfolio Chatbot
A conversational assistant served from the `/api/chat` route. It builds its context from the `portfolio.ts` data store and answers natural-language questions through a redundant dual-LLM setup (Groq → Gemini).

### 3. Engineering Blog
Long-form articles on system design, Java and applied AI, written as typed content blocks (headings, code, tables, callouts) in `blogs.ts`. Each post is pre-rendered with its own SEO and Open Graph metadata, an auto-generated table of contents and read-time estimates.

### 4. Live GitHub Showcase
Pulls live profile statistics, repositories and recent activity from the GitHub API and renders them alongside a contribution calendar on the home page.

### 5. Interactive PDF Document Viewer
A custom document viewer built on `react-pdf`. Visitors can zoom, rotate, search and download the résumé inside the page without a browser plugin.

### 6. Performance-Aware Rendering
A `usePerformance` hook profiles the device at runtime and scales back expensive effects where needed. Heavy assets are trimmed (for example, the lanyard model was cut from 2.4 MB to 160 KB), images are served responsively through `next/image`, and above-the-fold media is preloaded for a fast Largest Contentful Paint.

---

## Local Development Setup

### Prerequisites
- Node.js >= 20.9.0
- npm >= 10.0.0

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/falconlive09/<repository-name>.git
   cd <repository-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the template and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   EMAIL_USER=your_gmail_address
   EMAIL_APP_PASSWORD=your_google_app_password
   GROQ_API_KEY=your_groq_key
   GEMINI_API_KEY=your_gemini_key
   ```

   `EMAIL_APP_PASSWORD` is a Google [App password](https://myaccount.google.com/apppasswords) (requires 2-Step Verification), not your account password. The site runs without these keys; only the contact form and chatbot need them.

4. **Initialize Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to interact with the application.

### Production Build
Execute the following to compile and serve the optimized application bundle:
```bash
npm run build
npm start
```

### Deploying to Vercel
1. Import the repository in Vercel (**Add New → Project**). The default Next.js settings need no changes.
2. Add the four environment variables above under **Settings → Environment Variables**.
3. Deploy. Every push to the main branch redeploys automatically, and pull requests get preview URLs.

---

## Content Management

All site content is data-driven, so there's no need to touch components to update it:

| File | Controls |
|------|----------|
| `src/data/portfolio.ts` | Profile, social links, experience, education, projects, skills, achievements, FAQs |
| `src/data/blogs.ts` | Blog articles and their resources |
| `src/data/gallery.ts` | Gallery photos (files live in `public/gallery/`) |
| `messages/en.json` | UI labels and headings |

---

## Project Showcase Overview

The platform currently documents **5 technical projects** spanning multiple engineering disciplines:

| Discipline | Notable Projects | Core Technologies |
|------------|------------------|-------------------|
| **Backend & Microservices** | AI-Powered Fitness Tracker | Java, Spring Boot, Spring Cloud Gateway, Eureka, RabbitMQ, Keycloak, PostgreSQL, MongoDB, Gemini |
| **Real-Time Web Applications** | CollegeFellowCHAT | Node.js, Express.js, Socket.io, MongoDB, Passport.js |
| **Browser Tooling & OCR** | Textify ChatGPT | JavaScript, Tesseract.js, Chrome Extensions (Manifest V3) |
| **Algorithms & Visualization** | Sorting Algorithm Visualizer | JavaScript, HTML, CSS |
| **Hardware Design** | 8-Bit ALU | SystemVerilog |

---

## License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <p>Engineered by Neal Gautam</p>
</div>
