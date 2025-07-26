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
            
            // First show React works
            const TestComponent = () => {
              return React.createElement('div', { style: { color: 'green' } },
                'Step 2: React rendering works ✅',
                React.createElement('br'),
                React.createElement('div', { id: 'app-test' }, 'Step 3: Testing App.tsx...')
              )
            }
            
            root.render(React.createElement(TestComponent))
            console.log('✅ React rendering successful')
            
            // Now test App.tsx import
            setTimeout(() => {
              console.log('📍 Testing App.tsx import...')
              
              import('./App.tsx').then(({ default: App }) => {
                console.log('✅ App.tsx imported successfully')
                
                try {
                  // Test rendering App component
                  const appTestDiv = document.getElementById('app-test')
                  if (appTestDiv) {
                    appTestDiv.innerHTML = 'Step 3: App imported ✅ - Rendering App...'
                    
                    // Create new root for full app
                    const rootEl = document.getElementById('root')
                    if (rootEl) {
                      const appRoot = createRoot(rootEl)
                      appRoot.render(React.createElement(App))
                    }
                    console.log('✅ App component rendered successfully')
                  }
                } catch (error) {
                  console.error('❌ App rendering failed:', error)
                  const appTestDiv = document.getElementById('app-test')
                  if (appTestDiv) {
                    appTestDiv.innerHTML = `Step 3: ❌ App render failed: ${String(error)}`
                  }
                }
                
              }).catch(error => {
                console.error('❌ App.tsx import failed:', error)
                const appTestDiv = document.getElementById('app-test')
                if (appTestDiv) {
                  appTestDiv.innerHTML = `Step 3: ❌ App import failed: ${String(error)}`
                }
              })
              
            }, 1000)
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