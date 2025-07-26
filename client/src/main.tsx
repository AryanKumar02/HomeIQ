alert('🔥 SCRIPT LOADED!')

document.querySelector('.initial-loader')?.remove()

const root = document.getElementById('root')
if (root) {
  root.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1 style="color: green;">🔥 JAVASCRIPT IS WORKING!</h1>
      <p id="status">Testing React import only...</p>
    </div>
  `
  
  // Test ONLY React import
  setTimeout(() => {
    const status = document.getElementById('status')
    if (status) {
      status.innerHTML = 'About to import React...'
      
      import('react')
        .then(() => {
          status.innerHTML = '✅ React imported! Testing ReactDOM...'
          
          return import('react-dom/client')
        })
        .then(() => {
          status.innerHTML = '✅ ReactDOM imported! Testing App...'
          
          return import('./App.tsx')
        })
        .then(() => {
          status.innerHTML = '✅ App imported successfully! The issue is in App rendering.'
          status.style.color = 'green'
          alert('✅ App import worked! Issue is in rendering.')
        })
        .catch((error) => {
          status.innerHTML = `❌ React import failed: ${String(error)}`
          status.style.color = 'red'
          alert('❌ React import failed: ' + String(error))
        })
    }
  }, 1000)
}