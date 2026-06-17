import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { loginWithEmail, registerWithEmail, logout as logoutService , loginWithGoogle as loginWithGoogleService} from '../services/auth.service'

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string,nickname: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle:() => Promise<void>
}

type AuthProviderProps = {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    await loginWithEmail(email, password)
  }

  const loginWithGoogle = async()=>{
    await loginWithGoogleService()
  }

  const register = async (email: string, password: string, nickname:string) => {
    await registerWithEmail(email, password,nickname)
    
    // L'aggiornamento del profilo in Firebase non fa scattare onAuthStateChanged in automatico.
    // Forziamo l'aggiornamento dello stato in React clonando l'oggetto utente con i nuovi dati!
    if (auth.currentUser) {
      setUser({ ...auth.currentUser } as User)
    }
  }

  const logout = async () => {
    await logoutService()
  }

  return (                                                                      //capire meglio il provider
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>  
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth deve essere usato dentro AuthProvider')
  }

  return context
}