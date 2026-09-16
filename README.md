
# HeroAid — Superhero Help Portal

A polished React + Vite prototype built for the **TechAscent Machine Test** challenge: **Superhero Help Portal**.

## Features
- Hero directory with search and availability filters
- Hero profile details
- Emergency help request modal with validation
- Automatic hero matching based on emergency type
- Live dispatch / recent request dashboard
- Request IDs and status badges
- LocalStorage persistence
- Responsive mobile + desktop UI
- Accessible labels and keyboard-friendly controls
- No API keys required

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Deploy
This project can be deployed to Vercel, Netlify, or GitHub Pages after pushing it to a repository.

## Machine-test notes
This is a self-contained prototype because no separate functional specification was supplied with the challenge. The design focuses on demonstrating frontend engineering, UX, componentization, state management, form validation, responsive design, and a realistic emergency-dispatch workflow.

## Customize
Update `src/data/heroes.js` to add or edit heroes. Main application logic is in `src/App.jsx` and styling is in `src/index.css`.
