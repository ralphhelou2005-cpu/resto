import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';

declare global { interface Window { ATRE_READY?: boolean } }
window.ATRE_READY = true;

const root = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;

// The build pre-renders the full page into #root, so visitors see it instantly; React then takes it over in place.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
