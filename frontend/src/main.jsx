import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Service Worker kaydı (PWA desteği)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker kayıtlı:', registration.scope)
      })
      .catch((error) => {
        console.log('Service Worker kaydı başarısız:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
