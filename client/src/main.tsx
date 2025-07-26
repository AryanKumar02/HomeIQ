console.log('🔍 Starting main.tsx execution')

// Remove initial loader immediately
const loader = document.querySelector('.initial-loader')
if (loader) {
  console.log('📍 Removing loader...')
  loader.remove()
}

// Test React step by step
async function testReact() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('❌ No root element')
    return
  }

  try {
    console.log('📍 Step 1: Importing React...')
    const React = await import('react')
    console.log('✅ React imported')

    console.log('📍 Step 2: Importing ReactDOM...')
    const { createRoot } = await import('react-dom/client')
    console.log('✅ ReactDOM imported')

    console.log('📍 Step 3: Creating simple component...')
    const SimpleComponent = () => {
      return React.createElement('div', { style: { padding: '20px' } },
        React.createElement('h1', null, '🎉 React is working!'),
        React.createElement('p', null, 'Success! React rendered without crashes.'),
        React.createElement('button', 
          { onClick: () => window.location.reload() }, 
          'Reload to test full app'
        )
      )
    }

    console.log('📍 Step 4: Creating root...')
    const root = createRoot(rootElement)
    
    console.log('📍 Step 5: Rendering component...')
    root.render(React.createElement(SimpleComponent))
    
    console.log('✅ React rendering successful!')

  } catch (error) {
    console.error('❌ React test failed:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h2>❌ React Failed</h2>
        <pre>${String(error)}</pre>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `
  }
}

// Run the test
testReact().catch(error => {
  console.error('❌ Test execution failed:', error)
  document.body.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h2>❌ Critical Error</h2>
      <pre>${String(error)}</pre>
    </div>
  `
})