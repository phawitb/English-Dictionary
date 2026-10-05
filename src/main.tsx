import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { registerPwa } from './pwa'
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
registerPwa().catch((error) => console.warn('Service worker registration failed', error))
