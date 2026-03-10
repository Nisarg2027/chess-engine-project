import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Notice StrictMode is completely gone
createRoot(document.getElementById('root')).render(
  <App />
)