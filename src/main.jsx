import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PointsToastProvider } from './components/gamification/PointsToast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PointsToastProvider>
      <App />
    </PointsToastProvider>
  </StrictMode>,
)
