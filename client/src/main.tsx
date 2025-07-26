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
          status.innerHTML = '✅ ReactDOM imported! Testing MUI...'
          
          return import('@mui/material')
        })
        .then(() => {
          status.innerHTML = '✅ MUI imported! Testing React Router...'
          
          return import('react-router-dom')
        })
        .then(() => {
          status.innerHTML = '✅ React Router imported! Testing TanStack Query...'
          
          return import('@tanstack/react-query')
        })
        .then(() => {
          status.innerHTML = '✅ All major libs imported! Testing theme...'
          
          return import('./theme')
        })
        .then(() => {
          status.innerHTML = '✅ All imports work! The issue is likely in a specific component.'
          status.style.color = 'green'
          alert('✅ All major imports work!')
        })
        .catch((error) => {
          status.innerHTML = `❌ React import failed: ${String(error)}`
          status.style.color = 'red'
          alert('❌ React import failed: ' + String(error))
        })
    }
  }, 1000)
}