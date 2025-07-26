console.log('🔍 Starting main.tsx execution')

// Remove initial loader immediately
const loader = document.querySelector('.initial-loader')
if (loader) {
  console.log('📍 Removing loader...')
  loader.remove()
}

// Test React and dependencies step by step
async function testComponents() {
  const rootElement = document.getElementById('root')
  if (!rootElement) return

  try {
    console.log('📍 Importing React...')
    const React = await import('react')
    const { createRoot } = await import('react-dom/client')
    
    const root = createRoot(rootElement)

    const updateDisplay = (step: number, message: string, isError = false) => {
      console.log(`📍 Step ${step}: ${message}`)
      const color = isError ? 'red' : 'black'
      root.render(
        React.createElement('div', { style: { padding: '20px', color } },
          React.createElement('h1', null, '🔍 Progressive Testing'),
          React.createElement('p', null, `Step ${step}: ${message}`),
          React.createElement('div', { style: { marginTop: '10px' } },
            Array.from({length: 5}, (_, i) => 
              React.createElement('span', {
                key: i,
                style: {
                  display: 'inline-block',
                  width: '20px',
                  height: '20px', 
                  borderRadius: '50%',
                  backgroundColor: i < step ? 'green' : '#ccc',
                  margin: '0 5px'
                }
              })
            )
          ),
          isError ? React.createElement('button', 
            { onClick: () => window.location.reload() }, 
            'Reload'
          ) : null
        )
      )
    }

    // Step 1: React works
    updateDisplay(1, '✅ React works')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Step 2: Test MUI
    updateDisplay(2, 'Testing MUI import...')
    try {
      await import('@mui/material')
      console.log('✅ MUI imported successfully')
      updateDisplay(2, '✅ MUI imported successfully')
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      updateDisplay(2, `❌ MUI failed: ${String(error)}`, true)
      return
    }

    // Step 3: Test Emotion
    updateDisplay(3, 'Testing Emotion import...')
    try {
      await import('@emotion/react')
      console.log('✅ Emotion imported successfully')
      updateDisplay(3, '✅ Emotion imported successfully')
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      updateDisplay(3, `❌ Emotion failed: ${String(error)}`, true)
      return
    }

    // Step 4: Test App import
    updateDisplay(4, 'Testing App.tsx import...')
    try {
      await import('./App.tsx')
      console.log('✅ App.tsx imported successfully')
      updateDisplay(4, '✅ App.tsx imported successfully')
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      updateDisplay(4, `❌ App.tsx failed: ${String(error)}`, true)
      return
    }

    // Step 5: Load full app
    updateDisplay(5, 'Loading full app...')
    try {
      const { default: App } = await import('./App.tsx')
      console.log('✅ Loading full App component')
      root.render(React.createElement(App))
    } catch (error) {
      updateDisplay(5, `❌ App render failed: ${String(error)}`, true)
    }

  } catch (error) {
    console.error('❌ Critical error:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h2>❌ Critical Error</h2>
        <pre>${String(error)}</pre>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `
  }
}

// Run the test
testComponents().catch(error => {
  console.error('❌ Test execution failed:', error)
})