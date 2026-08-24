import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import AIAssistant from './pages/AIAssistant'

/**
 * Ana Uygulama Bileşeni.
 * Router yapısı ve global state provider burada tanımlanır.
 */
function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/ai" element={<AIAssistant />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  )
}

export default App
