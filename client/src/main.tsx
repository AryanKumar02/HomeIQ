console.log('🔍 Starting main.tsx execution')

// Remove initial loader immediately
const loader = document.querySelector('.initial-loader')
if (loader) {
  console.log('📍 Removing loader...')
  loader.remove()
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ No root element')
} else {
  console.log('📍 Root element found, setting basic content...')
  
  // Set basic content first
  rootElement.innerHTML = `
    <div style="padding: 20px;">
      <h1>🔍 Testing Mode</h1>
      <p>Step 1: Basic HTML works ✅</p>
      <div id="react-test">Testing React...</div>
      <button onclick="window.location.reload()">Reload</button>
    </div>
  `
  
  // Test React import after a delay
  setTimeout(() => {
    console.log('📍 Testing React import...')
    
    import('react').then(React => {
      console.log('✅ React imported')
      
      import('react-dom/client').then(({ createRoot }) => {
        console.log('✅ ReactDOM imported')
        
        try {
          const testDiv = document.getElementById('react-test')
          if (testDiv) {
            const root = createRoot(testDiv)
            
            const TestComponent = () => {
              return React.createElement('div', { style: { color: 'green' } },
                'Step 2: React rendering works ✅'
              )
            }
            
            root.render(React.createElement(TestComponent))
            console.log('✅ React rendering successful')
          }
        } catch (error) {
          console.error('❌ React rendering failed:', error)
          const testDiv = document.getElementById('react-test')
          if (testDiv) {
            testDiv.innerHTML = `<span style="color: red;">❌ React failed: ${String(error)}</span>`
          }
        }
        
      }).catch(error => {
        console.error('❌ ReactDOM import failed:', error)
        const testDiv = document.getElementById('react-test')
        if (testDiv) {
          testDiv.innerHTML = `<span style="color: red;">❌ ReactDOM import failed: ${String(error)}</span>`
        }
      })
      
    }).catch(error => {
      console.error('❌ React import failed:', error)
      const testDiv = document.getElementById('react-test')
      if (testDiv) {
        testDiv.innerHTML = `<span style="color: red;">❌ React import failed: ${String(error)}</span>`
      }
    })
    
  }, 500)
}