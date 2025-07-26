import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'


// Remove initial loader
const removeInitialLoader = () => {
  const loader = document.querySelector('.initial-loader')
  if (loader) {
    loader.remove()
  }
}

// Step 1: Test React only
const TestReact = () => <div>✅ React works</div>

// Step 2: Test MUI usage
const TestMUI = () => {
  const [status, setStatus] = React.useState('Testing MUI...')
  
  React.useEffect(() => {
    import('@mui/material')
      .then(() => setStatus('✅ MUI imports successfully'))
      .catch((error: unknown) => setStatus(`❌ MUI import failed: ${String(error)}`))
  }, [])
  
  return <div>{status}</div>
}

// Step 3: Test emotion usage  
const TestEmotion = () => {
  const [status, setStatus] = React.useState('Testing Emotion...')
  
  React.useEffect(() => {
    import('@emotion/react')
      .then(() => setStatus('✅ Emotion imports successfully'))
      .catch((error: unknown) => setStatus(`❌ Emotion import failed: ${String(error)}`))
  }, [])
  
  return <div>{status}</div>
}

// Progressive testing
const DebugApp = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>HomeIQ Debug</h1>
      <div style={{ marginBottom: '10px' }}><TestReact /></div>
      <div style={{ marginBottom: '10px' }}><TestMUI /></div>
      <div style={{ marginBottom: '10px' }}><TestEmotion /></div>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  )
}

try {
  const root = createRoot(document.getElementById('root')!)
  root.render(
    <StrictMode>
      <DebugApp />
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
        <pre style="background: #f5f5f5; padding: 10px;">${String(error)}</pre>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `
  }
}
