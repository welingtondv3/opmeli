import { createContext, useContext, useState } from 'react'
import { USUARIOS } from '../data/mockData'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  function signIn(email, senha) {
    const found = USUARIOS.find(u => u.email === email && u.senha === senha && u.ativo)
    if (found) { setUser(found); return { error: null } }
    return { error: 'Credenciais inválidas' }
  }

  function signOut() { setUser(null) }

  function hasAccess(modulo) {
    if (!user) return false
    if (user.perfil === 'admin') return true
    return user.modulos.includes(modulo)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, hasAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
