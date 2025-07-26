// Global error handlers
window.addEventListener('error', (event) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  alert('❌ GLOBAL ERROR: ' + (event.error && typeof event.error === 'object' && 'message' in event.error ? event.error.message : String(event.error)))
})

window.addEventListener('unhandledrejection', (event) => {
  alert('❌ UNHANDLED PROMISE: ' + String(event.reason))
})

// Wrap everything in try-catch
try {
  // Force execution check
  alert('🔍 MAIN.TSX IS RUNNING!')
  console.log('🔍 Starting main.tsx execution')
} catch (error) {
  alert('❌ ERROR AT START: ' + String(error))
}

try {
  // Remove initial loader immediately
  const loader = document.querySelector('.initial-loader')
  if (loader) {
    loader.remove()
    alert('✅ Loader removed')
  } else {
    alert('❌ No loader found')
  }

  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px;">
        <h1>🔍 App Diagnosis</h1>
        <p>✅ JavaScript works</p>
        <p id="step">Testing App.tsx import...</p>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `
    
    // Test your App.tsx specifically
    setTimeout(() => {
      try {
        const stepElement = document.getElementById('step')
        
        if (stepElement) {
          stepElement.innerHTML = 'Importing App.tsx...'
          
          import('./App.tsx')
            .then(() => {
              stepElement.innerHTML = '✅ App.tsx imported successfully - This means your App is the problem'
              stepElement.style.color = 'green'
            })
            .catch((error) => {
              stepElement.innerHTML = `❌ App.tsx import failed: ${String(error)}`
              stepElement.style.color = 'red'
              console.error('App import error:', error)
              alert('❌ APP IMPORT ERROR: ' + String(error))
            })
        }
      } catch (error) {
        alert('❌ TIMEOUT ERROR: ' + String(error))
      }
    }, 1000)
  } else {
    alert('❌ No root element found')
  }
} catch (error) {
  alert('❌ MAIN ERROR: ' + String(error))
}