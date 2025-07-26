alert('🔥 SCRIPT LOADED!')

document.querySelector('.initial-loader')?.remove()

const root = document.getElementById('root')
if (root) {
  root.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1 style="color: green;">🔥 JAVASCRIPT IS WORKING!</h1>
      <p id="status">Testing React import...</p>
    </div>
  `
  
  // Test React import
  setTimeout(() => {
    const status = document.getElementById('status')
    if (status) {
      import('react').then(() => {
        status.innerHTML = '✅ React imported! Testing ReactDOM...'
        
        return import('react-dom/client')
      }).then(() => {
        status.innerHTML = '✅ ReactDOM imported! Testing App...'
        
        return import('./App.tsx')
      }).then(() => {
        status.innerHTML = '✅ App imported! This means the issue is in App rendering.'
        status.style.color = 'green'
      }).catch((error) => {
        status.innerHTML = `❌ Import failed: ${String(error)}`
        status.style.color = 'red'
        alert('Import error: ' + String(error))
      })
    }
  }, 1000)
}