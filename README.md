# Task Manager Monorepo

Questo è un monorepo per il portale backoffice di gestione task, strutturato usando **npm workspaces**.

## Struttura del progetto

- `apps/frontend/`: L'interfaccia utente (React, Vite, TypeScript). Applicazione SPA perfetta per backoffice e dashboard.
- `apps/api/`: Il backend API (Node.js, Express, TypeScript).
- `packages/shared/`: Codice e tipi condivisi tra frontend e backend (es. interfacce TypeScript, costanti, funzioni utilità).

## Comandi principali

Dal livello principale (root) puoi eseguire i comandi su tutto il workspace:

- `npm install`: Installa e collega le dipendenze in tutto il monorepo.
- `npm run dev`: Avvia i server di sviluppo per il frontend e le API contemporaneamente.
- `npm run build`: Compila tutti i progetti.

Per eseguire un comando specifico in un solo pacchetto, ad esempio nel `frontend`:

- `npm run dev -w frontend`

## Framework Scelti

- **Frontend**: React.js avviato con Vite e TypeScript. Scelto perché è lo standard industriale per dashboard e backoffice, con un vasto ecosistema (MUI, Tailwind, ecc.) e ottime performance.
- **Backend API**: Node.js con Express e TypeScript. Facile da sviluppare e manutenibile, come richiesto.
