console.log('🔍 Starting main.tsx execution')

// Test if we can even create a root element
const rootElement = document.getElementById('root')
console.log('📍 Root element found:', !!rootElement)

if (!rootElement) {
  console.error('❌ No root element found!')
  document.body.innerHTML = '<div style="padding: 20px;"><h1>❌ No root element found</h1></div>'
} else {
  console.log('📍 Root element exists, removing loader...')

  // Remove loader immediately
  const loader = document.querySelector('.initial-loader')
  if (loader) {
    console.log('📍 Removing loader...')
    loader.remove()
  }

  // Set basic content without any imports
  console.log('📍 Setting basic HTML content...')
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>🔍 Debug Mode</h1>
      <p>If you see this, basic JavaScript works</p>
      <button onclick="console.log('Button clicked'); location.reload();">Reload Page</button>
      <div id="test-area" style="margin-top: 20px; padding: 10px; background: #f5f5f5;">
        <p>Testing React import...</p>
      </div>
    </div>
  `

  console.log('📍 Basic content set, now testing React import...')

  // Test React import separately
  setTimeout(() => {
    void (async () => {
      try {
        console.log('📍 Attempting to import React...')
        const React = await import('react')
        console.log('✅ React imported successfully:', !!React)

        const { createRoot } = await import('react-dom/client')
        console.log('✅ ReactDOM imported successfully:', !!createRoot)

        const testArea = document.getElementById('test-area')
        if (testArea) {
          testArea.innerHTML = '<p style="color: green;">✅ React imports work! Click reload to try full app.</p>'
        }

      } catch (error) {
        console.error('❌ React import failed:', error)
        const testArea = document.getElementById('test-area')
        if (testArea) {
          testArea.innerHTML = `<p style="color: red;">❌ React import failed: ${String(error)}</p>`
        }
      }
    })()
  }, 100)
}
