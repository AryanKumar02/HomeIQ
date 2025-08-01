import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Remove initial loader
document.querySelector('.initial-loader')?.remove()

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(React.createElement(App))
}
