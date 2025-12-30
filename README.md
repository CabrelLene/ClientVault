# ClientVault — Mini CRM (SvelteKit + Supabase)

ClientVault est un mini CRM orienté **prospects & mandats** : pipeline, suivi client, notes, tâches avec échéances, dashboard KPI et export CSV.  
Objectif : démontrer une app **full-stack** propre, sécurisée et déployable rapidement.

## ✨ Fonctionnalités
- Auth **Login/Register** (UI animée) via Supabase Auth
- App protégée (`/app`) + session cookies (SSR)
- Pipeline clients : Nouveau → Qualifié → Proposé → Gagné / Perdu
- CRUD clients + recherche + filtres
- Fiche client : **Notes** + **Tâches** (done + due_date)
- Dashboard : KPI pipeline + alertes (retard / aujourd’hui)
- Export CSV (filtré, Excel-friendly)
- Seed demo (1 clic) pour remplir l’app

## 🔐 Sécurité
- **RLS (Row Level Security)** activé sur toutes les tables
- Chaque utilisateur ne peut voir/modifier que ses données (`auth.uid() = user_id`)
- Actions sensibles gérées côté serveur (SvelteKit actions / server routes)

## 🧱 Stack
- SvelteKit + TypeScript
- Supabase (Auth + Postgres + RLS)
- SSR + cookies (supabase/ssr)
- UI: CSS custom (glassmorphism)

## 🚀 Installation locale
```bash
npm install
npm run dev -- --open
