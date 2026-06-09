import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ScanProvider } from './context/ScanContext'

/**
 * Provider order (outermost → innermost):
 *   ScanProvider  — scan mode is global, nothing depends on auth for mode state
 *   AuthProvider  — facility auth, feeds into protected routes
 *   App           — router + page tree
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScanProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ScanProvider>
  </StrictMode>,
)
