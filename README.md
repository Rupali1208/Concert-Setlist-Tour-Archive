# 🎵 ConcertArchive — Setlist & Tour Database

A full-stack concert setlist and tour archive application with a polished dark-themed dashboard, real-time filtering, AI-powered insights, and a comprehensive demo dataset.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

---

## ✨ Features

### 🔐 Authentication System
- Email + custom password login/registration
- Role-based access: **Audience Member** & **Super Admin**
- SHA-256 hashed passwords with 24-hour token sessions
- Protected dashboard routes with automatic redirect

### 📊 Interactive Dashboard
- **KPI Cards** — animated counters for Artists, Tours, Concerts, Songs
- **Charts** — Top Songs (bar), Concerts by City (doughnut), Yearly Trends (line)
- **Click-to-filter** — click chart segments to drill down
- **Active filter chips** with one-click removal

### 🔍 Advanced Filtering
- **Country** — 20+ countries with flag emoji
- **City** — Master geographic dataset (100+ real cities, decoupled from concerts)
- **Artist** — 155 artists across Pop, Rock, K-Pop, EDM, Bollywood, Hip-Hop
- **Year** — 2024, 2025, 2026
- **Data Source** — Toggle between All / Verified / Demo data

### 🌐 Global Search
- 300ms debounced instant search
- Tabbed results: Artists, Songs, Tours, Concerts, Cities, Venues

### 🤖 AI Integration
- Chat assistant powered by Groq AI
- Setlist prediction
- Concert insights & analytics

### 📁 Demo Dataset
- **155 artists** across 10+ genres
- **235 tours** spanning 2024–2026
- **520 concerts** with real venues worldwide
- **1,240 songs** with album metadata
- **4,160 setlist entries**
- Clear `[DEMO DATA]` vs `[VERIFIED DATA]` badges

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js 4.19 |
| **Database** | Firebase Realtime Database |
| **Auth** | Custom token-based (SHA-256) |
| **Frontend** | HTML5, Tailwind CSS (CDN), Alpine.js |
| **Charts** | Chart.js + DataLabels plugin |
| **Icons** | Lucide Icons |
| **AI** | Groq API (openai/gpt-oss-120b) |
| **Concert Data** | setlist.fm REST API |
| **Fonts** | Inter + Outfit (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or later)
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/concert-archive.git
cd concert-archive

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Seed demo data (optional)
node database/seed_all_demo_data.js

# 5. Start the server
npm start
```

### Access the App
- Open **http://localhost:5000** in your browser
- You'll be redirected to the login page
- Default accounts:
  | Email | Password | Role |
  |---|---|---|
  | `admin@concertarchive.com` | `admin123` | Super Admin |
  | `curator@concertarchive.com` | `curator123` | Concert Tour Curator |
  | `user@concertarchive.com` | `user123` | Audience Member |

---

## 📁 Project Structure

```
concert-archive/
├── server.js                       # Express backend (main entry point)
├── package.json                    # Node.js dependencies
├── .env.example                    # Environment template
├── firebase-config.js              # Firebase configuration
│
├── frontend/
│   ├── index.html                  # Dashboard page (protected)
│   ├── login.html                  # Login & Registration page
│   └── js/
│       ├── api.js                  # REST API client with auth
│       ├── auth.js                 # Authentication module
│       ├── dashboard.js            # Dashboard filters, KPIs, charts
│       ├── search.js               # Global search system
│       ├── crud.js                 # CRUD operations & modals
│       └── ai.js                   # AI assistant module
│
├── database/
│   ├── master_geo_data.js          # 20 countries, 100+ cities
│   ├── seed_all_demo_data.js       # Demo dataset generator (520 concerts)
│   ├── schema.sql                  # MySQL database schema
│   └── sample_data.sql             # SQL sample data
│
└── .gitignore
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `FIREBASE_DB_URL` | Firebase Realtime Database URL |
| `SETLIST_API_KEY` | setlist.fm API key ([get one here](https://api.setlist.fm/docs/1.0/index.html)) |
| `GROQ_API_KEY` | Groq API key for AI features |
| `GROQ_MODEL` | AI model name |
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL config (optional) |

---

## 📜 API Endpoints

### Public
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Redirects to `/login` |
| `GET` | `/login` | Login page |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/register` | Register new user |
| `GET` | `/api/countries` | Master country list |
| `GET` | `/api/cities?countryCode=IN` | Cities for a country |

### Protected (requires Bearer token)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats/overview` | KPI stats (filtered) |
| `GET` | `/api/stats/top-songs` | Top played songs |
| `GET` | `/api/stats/cities` | Concerts by city |
| `GET` | `/api/stats/concerts-by-year` | Year trend data |
| `GET` | `/api/stats/recent-concerts` | Recent concerts table |
| `GET` | `/api/artists` | Artist list |
| `GET` | `/api/search?q=...` | Global search |

---

## 🎨 Design

- **Theme**: Dark mode with glassmorphism
- **Colors**: Purple, Pink, Cyan accents on navy/black background
- **Animations**: Gradient shift, hover transforms, animated counters
- **Responsive**: Mobile-friendly grid layout (1 → 2 → 4 columns)

---

## 📄 License

This project is for educational and portfolio purposes.

---

<p align="center">
  Built with ❤️ using Node.js, Express, Firebase & Tailwind CSS
</p>
