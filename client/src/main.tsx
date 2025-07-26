import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Remove initial loader
const removeInitialLoader = () => {
  const loader = document.querySelector('.initial-loader')
  if (loader) {
    loader.remove()
  }
}

try {
  const root = createRoot(document.getElementById('root')!)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  removeInitialLoader()
} catch (error) {
  console.error('App failed to mount:', error)
  removeInitialLoader()
  // Show error message instead of loader
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 16px;">
        <h2>Application Error</h2>
        <p>Please refresh the page or clear your browser cache.</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #036CA3; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `
  }
}
