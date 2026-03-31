<div align="center">



# 📜 LipiSutra

### *"We are losing centuries of knowledge without saying a word."*

**LipiSutra** is an end-to-end multimodal AI platform that digitizes, reconstructs, and preserves historical Indian manuscripts — not just translating, but restoring, reconstructing, and preserving while keeping the human touch alive at every step.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-lipi--sutra.vercel.app-6366f1?style=for-the-badge)](https://lipi-sutra.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Built With Google](https://img.shields.io/badge/Built%20With-Google%20Ecosystem-red?style=for-the-badge&logo=google)](https://cloud.google.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[![SDG](https://img.shields.io/badge/SDG-4%20%7C%2010%20%7C%2011%20%7C%2017-blue)](https://sdgs.un.org/)
[![Theme](https://img.shields.io/badge/Theme-AI%2FML%20·%20Culture%20·%20Archives-purple)]()
[![Cost](https://img.shields.io/badge/Operational%20Cost-₹0-green)]()

</div>

---

## 📌 Table of Contents


- [System Architecture](#️-system-architecture)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---



## ⚙️ System Architecture

```
User Upload
    ↓
SHA-256 Hash Check
    ├── Match Found → Serve cached Purple-verified result (50ms)
    └── New Document → Async Queue
                           ↓
                    Agent 1: OCR + Transliteration
                    (Gemini Vision + Cloud Vision API)
                           ↓
                    Agent 2: Gap Filling + Translation
                    (Gemini 1.5 Pro + Cloud Translation + Bhashini)
                           ↓
                    Agent 3: Output Formatting
                    (Structured text + TTS via Cloud Text-to-Speech)
                           ↓
                    Confidence Scoring → Color Provenance System
                           ↓
                    Firestore → Dashboard Delivery
                           ↓
                    Google Maps Heritage Pin Layer
```

---

## 🛠️ Tech Stack

### Frontend
- **React + Vite** — Modern, responsive interface
- **Role-Based Perspective Switcher** — Instant UI switching across 3 user roles
- **Confidence Heatmap UI** — Color-coded provenance display (Yellow/Red/Purple)
- **Real-time progress indicator** — Shows document pipeline stage during async processing
- **Deployed on Vercel**

### Backend & Database
- **Firebase Firestore** — Document storage, RLHF correction logs
- **Firebase Auth** — Role-based access control
- **SHA-256 Deduplication** — Client-side hashing before API calls

### Google Ecosystem (7 Tools)

| Tool | Role in Pipeline |
|---|---|
| **Gemini 1.5 Pro** | Core multimodal OCR + contextual gap filling |
| **Cloud Vision API** | Confidence scoring per word/glyph |
| **Cloud Translation API** | Multilingual output (100+ languages) |
| **Cloud Text-to-Speech** | Audio accessibility for visually impaired users |
| **Google Maps JavaScript API** | Heritage site pinning from decoded place names |
| **Firebase Firestore** | Document storage, RLHF correction database |
| **Firebase Auth** | Role-based access control |

---

## 🏃 Getting Started

> **Prerequisites:** Node.js ≥ 18, npm ≥ 9, Git

```bash
# 1. Clone the repository
git clone https://github.com/prachi-satbhai0741/LipiSutra.git
cd LipiSutra

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your API keys (see Environment Variables section)

# 4. Run the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🐳 Docker Setup

> Run LipiSutra in a fully containerized environment — no Node.js installation needed on your machine.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2.0

### Quick Start

```bash
# Clone the repo
git clone https://github.com/prachi-satbhai0741/LipiSutra.git
cd LipiSutra

# Copy and fill in your environment variables
cp .env.example .env

# Build and run with Docker Compose
docker compose up --build

# App will be live at http://localhost:3000
```

### Available Docker Commands

```bash
# Run in detached (background) mode
docker compose up -d --build

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Rebuild without cache
docker compose build --no-cache
```

See [`SETUP.md`](SETUP.md) for detailed environment variable configuration and troubleshooting.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```env
# Gemini AI
VITE_GEMINI_KEY=your_gemini_api_key

# Google Cloud APIs
VITE_GOOGLE_KEY=your_google_cloud_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Never commit your `.env` file to version control.** It is already listed in `.gitignore`.

For full setup instructions and where to obtain each key, see [`SETUP.md`](SETUP.md).

---

## 📁 Project Structure

```
LipiSutra/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page-level components
│   ├── services/            # API integration layer
│   │   ├── gemini.js        # Gemini AI service
│   │   ├── vision.js        # Cloud Vision API
│   │   ├── translate.js     # Cloud Translation API
│   │   ├── tts.js           # Text-to-Speech service
│   │   └── firebase.js      # Firebase config & Firestore
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions (SHA-256, etc.)
│   └── App.jsx              # Root component
├── .env.example             # Environment variable template
├── .gitignore
├── Dockerfile               # Docker image definition
├── docker-compose.yml       # Multi-service Docker setup
├── nginx.conf               # Nginx config for production container
├── index.html
├── package.json
├── vite.config.js
├── SETUP.md                 # Detailed setup & requirements guide
├── CONTRIBUTING.md          # Contribution guidelines
├── LICENSE                  # MIT License
└── README.md
```

---



## 🤝 Contributing

We welcome contributions! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit with clear messages: `git commit -m "feat: add XYZ feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 🔗 Links

- 🌐 **Live Demo:** [lipi-sutra.vercel.app](https://lipi-sutra.vercel.app/)
- 💻 **GitHub:** [github.com/prachi-satbhai0741/LipiSutra](https://github.com/prachi-satbhai0741/LipiSutra)

---

## 👥 Team

Built with ❤️ for the **Indian OpenSource Community Hackathon 2026**

> *"Building technology that serves humanity, heritage and history."*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
