# LipiSutra — Setup & Requirements Guide

This document covers everything you need to get LipiSutra running locally, in Docker, or contributing to development.

---

## System Requirements

### Option A — Local Development (Node.js)

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.0.0 (LTS recommended) |
| npm | ≥ 9.0.0 |
| Git | ≥ 2.30 |
| OS | macOS, Linux, or Windows (WSL2 recommended) |

Check your versions:
```bash
node --version
npm --version
git --version
```

### Option B — Docker (Recommended for judges / reviewers)

| Requirement | Version |
|---|---|
| Docker | ≥ 24.0 |
| Docker Compose | ≥ 2.0 |

Check your versions:
```bash
docker --version
docker compose version
```

---

## API Keys & Services Required

You need accounts and API keys for the following services. All have **free tiers** that are sufficient to run LipiSutra.

### 1. Google AI Studio (Gemini)

- Go to: https://aistudio.google.com/app/apikey
- Create an API key
- Used for: Gemini 1.5 Pro — core OCR, translation, and reconstruction
- Free tier: Yes

```env
VITE_GEMINI_KEY=your_key_here
```

### 2. Google Cloud Platform

- Go to: https://console.cloud.google.com/
- Create a project and enable the following APIs:
  - Cloud Vision API
  - Cloud Translation API
  - Cloud Text-to-Speech API
  - Maps JavaScript API
- Go to **APIs & Services → Credentials → Create API Key**
- Free tier: All four APIs have a generous free tier

```env
VITE_GOOGLE_KEY=your_key_here
```

> Tip: You can use the same key for all four GCP APIs if you enable them all in the same project.

### 3. Firebase

- Go to: https://console.firebase.google.com/
- Create a new project
- Enable **Firestore Database** (Native mode)
- Enable **Authentication** (Email/Password provider)
- Go to **Project Settings → General → Your apps → Add app (Web)**
- Copy the Firebase config object

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Environment File Setup

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and fill in all values from the section above.

3. **Never commit your `.env` file.** It is already listed in `.gitignore`.

Full `.env` template:

```env
# ──────────────────────────────────────
# Gemini AI (Google AI Studio)
# ──────────────────────────────────────
VITE_GEMINI_KEY=

# ──────────────────────────────────────
# Google Cloud APIs
# (Vision, Translation, TTS, Maps)
# ──────────────────────────────────────
VITE_GOOGLE_KEY=

# ──────────────────────────────────────
# Firebase Configuration
# ──────────────────────────────────────
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Local Setup (Node.js)

```bash
# 1. Clone the repository
git clone https://github.com/prachi-satbhai0741/LipiSutra.git
cd LipiSutra

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your keys in .env

# 4. Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Available npm Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with HMR |
| `npm run build` | Create production build in `/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## Docker Setup

### Production Mode (mirrors the deployed version)

```bash
# 1. Clone and navigate
git clone https://github.com/prachi-satbhai0741/LipiSutra.git
cd LipiSutra

# 2. Set up environment
cp .env.example .env
# Fill in your keys

# 3. Build and run
docker compose up --build

# App available at http://localhost:3000
```

### Development Mode (with hot-reload)

```bash
docker compose --profile dev up --build
# App available at http://localhost:5173
```

### Useful Docker Commands

```bash
# View logs
docker compose logs -f lipisutra

# Stop all containers
docker compose down

# Rebuild from scratch
docker compose build --no-cache

# Check running containers
docker ps
```

---

## Verifying the Setup

Once running, verify these features work:

- [ ] Home page loads without console errors
- [ ] Role switcher toggles between Public / Historian / Museum views
- [ ] Document upload UI is functional
- [ ] Firebase connection is established (no auth errors in console)
- [ ] Map section renders (requires Google Maps API key)

---

## Troubleshooting

### `npm install` fails
- Ensure Node.js ≥ 18: `node --version`
- Delete `node_modules` and retry: `rm -rf node_modules && npm install`

### Firebase errors in console
- Double-check all `VITE_FIREBASE_*` values in `.env`
- Ensure Firestore is in **Native mode**, not **Datastore mode**
- Check Firebase project region matches your config

### Google Maps not rendering
- Ensure `Maps JavaScript API` is enabled in your GCP project
- Check for billing account — Maps API requires one (even on free tier)

### Docker port conflict
- Change the host port in `docker-compose.yml`: `"3001:80"` if port 3000 is in use

### Vite build fails in Docker
- Ensure your `.env` file exists before building
- Check that all `VITE_` prefixed variables are set

---

## Dependency Overview

Key dependencies (see `package.json` for full list):

| Package | Purpose |
|---|---|
| `react` | UI framework |
| `vite` | Build tool and dev server |
| `firebase` | Firestore + Auth integration |
| `@google/generative-ai` | Gemini AI SDK |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow, commit message conventions, and code style guidelines.

---

*For any issues, open a GitHub Issue or contact the team via the repository.*