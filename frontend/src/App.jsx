import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import AIAssistant from './pages/AIAssistant'
import Profile from './pages/Profile'
import Discover from './pages/Discover'
import { AuthProvider } from './context/AuthContext'

/**
 * Ana Uygulama Bileşeni.
 * Router yapısı ve global state provider burada tanımlanır.
 */
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/ai" element={<AIAssistant />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
