import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LeadProvider } from './context/LeadContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LeadProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LeadProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
