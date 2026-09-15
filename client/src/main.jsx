import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ScanProvider } from './context/ScanContext'
import { AccessibilityProvider } from './context/AccessibilityContext'

/**
 * Provider order (outermost → innermost):
 *   ScanProvider          — scan mode is global, nothing depends on auth for mode state
 *   AuthProvider          — facility auth, feeds into protected routes
 *   AccessibilityProvider — font size, high contrast, dark mode (applies to doc root)
 *   App                   — router + page tree
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScanProvider>
      <AuthProvider>
        <AccessibilityProvider>
          <App />
        </AccessibilityProvider>
      </AuthProvider>
    </ScanProvider>
  </StrictMode>,
)
