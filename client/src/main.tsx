import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

console.log('🔍 Starting main.tsx execution')

// Remove initial loader
const removeInitialLoader = () => {
  const loader = document.querySelector('.initial-loader')
  if (loader) {
    console.log('📍 Removing loader...')
    loader.remove()
  }
}

// Progressive App Loading
const ProgressiveApp = () => {
  const [step, setStep] = React.useState(1)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadNext = async () => {
      try {
        if (step === 1) {
          console.log('📍 Step 1: Basic React component loaded')
          setTimeout(() => setStep(2), 1000)
        } else if (step === 2) {
          console.log('📍 Step 2: Testing MUI import...')
          await import('@mui/material')
          console.log('✅ MUI imported successfully')
          setTimeout(() => setStep(3), 1000)
        } else if (step === 3) {
          console.log('📍 Step 3: Testing emotion import...')
          await import('@emotion/react')
          console.log('✅ Emotion imported successfully')
          setTimeout(() => setStep(4), 1000)
        } else if (step === 4) {
          console.log('📍 Step 4: Loading full app...')
          setStep(5)
        }
      } catch (err) {
        console.error(`❌ Step ${step} failed:`, err)
        setError(`Step ${step} failed: ${String(err)}`)
      }
    }
    void loadNext()
  }, [step])

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>❌ Error at Step {step}</h2>
        <pre>{error}</pre>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    )
  }

  if (step === 5) {
    // Import and render full app
    const App = React.lazy(() => import('./App.tsx'))
    return (
      <React.Suspense fallback={<div>Loading App...</div>}>
        <App />
      </React.Suspense>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🔍 Progressive Loading</h1>
      <p>Step {step}/4: {
        step === 1 ? '✅ React works' :
        step === 2 ? 'Testing MUI...' :
        step === 3 ? 'Testing Emotion...' :
        'Loading App...'
      }</p>
      <div style={{ marginTop: '20px' }}>
        {Array.from({length: 4}, (_, i) => (
          <span key={i} style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: i < step ? 'green' : '#ccc',
            margin: '0 5px'
          }} />
        ))}
      </div>
    </div>
  )
}

try {
  const root = createRoot(document.getElementById('root')!)
  root.render(
    <StrictMode>
      <ProgressiveApp />
    </StrictMode>
  )
  removeInitialLoader()
} catch (error) {
  console.error('React mount failed:', error)
  removeInitialLoader()
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px;">
        <h2>❌ React Mount Failed</h2>
        <pre>${String(error)}</pre>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `
  }
}
