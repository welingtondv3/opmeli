import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Operacional from './pages/Operacional'
import Tabelas from './pages/Tabelas'
import Financeiro from './pages/Financeiro'
import Usuarios from './pages/Usuarios'

function Guard({ children, modulo }) {
  const { user, hasAccess } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (modulo && !hasAccess(modulo)) return <Navigate to="/operacional" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/operacional" replace /> : <Login />} />
      <Route path="/operacional" element={<Guard modulo="operacional"><Layout><Operacional /></Layout></Guard>} />
      <Route path="/tabelas" element={<Guard modulo="comercial"><Layout><Tabelas /></Layout></Guard>} />
      <Route path="/financeiro" element={<Guard modulo="financeiro"><Layout><Financeiro /></Layout></Guard>} />
      <Route path="/usuarios" element={<Guard modulo="admin"><Layout><Usuarios /></Layout></Guard>} />
      <Route path="*" element={<Navigate to={user ? "/operacional" : "/login"} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
