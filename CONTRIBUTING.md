# Contributing to LipiSutra

Thank you for your interest in contributing! 

## How to Contribute

1. Fork the repository
2. Create a feature branch
```
   git checkout -b feature/your-feature-name
```
3. Make your changes
4. Commit with clear messages
```
   git commit -m "feat: describe what you did"
```
5. Push and open a Pull Request
```
   git push origin feature/your-feature-name
```

## Commit Message Convention

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation update |
| `style:` | UI/CSS changes |
| `refactor:` | Code restructure |

## Code Style
- Use clear, readable variable names
- Comment complex logic
- Keep components small and focused

## Reporting Issues
Open a GitHub Issue with steps to reproduce the bug.
```

---

## Your `src/` Structure

I can see you have: `assets`, `components`, `services`, `App.css`, `App.jsx`, `index.css`, `main.jsx` — **no `hooks/` or `utils/` folders**.

So update that section in `README.md` to:
```
├── src/
│   ├── assets/              # Images and static assets
│   ├── components/          # Reusable UI components
│   ├── services/            # API integration layer
│   ├── App.jsx              # Root component
│   ├── App.css
│   ├── index.css
│   └── main.jsx