// Force execution check
alert('🔍 MAIN.TSX IS RUNNING!')
console.log('🔍 Starting main.tsx execution')

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
        })
    }
  }, 1000)
}