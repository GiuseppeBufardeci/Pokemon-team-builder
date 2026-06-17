import { useState, useEffect } from 'react'
import {useAuth} from '../context/AuthContext'
import { useNavigate,useLocation } from 'react-router-dom'
import "./Login.css"

function Login() {
  // Stati locali per mantenere i valori del form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [nickname, setNickname] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  // Otteniamo l'utente e i metodi di auth dal nostro AuthContext collegato a Firebase
  const {user,login,register,loginWithGoogle} = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  // Se l'utente ha tentato di visitare una rotta protetta senza essere loggato, React Router
  // salva la rotta di provenienza. La usiamo per rimandarlo lì dopo il login, altrimenti va alla home.
  const from = location.state?.from?.pathname || '/'

  useEffect(()=>{
    // Non appena "user" diventa definito (login riuscito), scatta il reindirizzamento
    if(user){
     navigate(from , {replace : true})
    }  
  },[user, from, navigate])
  // "navigate" è qui perché React richiede che tutte le funzioni/variabili esterne 
  // usate in un useEffect siano dichiarate nelle dipendenze (regola exhaustive-deps).

  const handleRegister = async () => {
    try {
      setMessage('')
      await register(email,password,nickname)
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  const handleGoogleLogin = async() => {
    try{
      setMessage("")
      await loginWithGoogle()
    }catch(error:any){
      setMessage(error.message)
    }
  }

  const handleLogin = async () => {
    try {
      setMessage('')
      await login(email,password)
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <h2 className="login-title">{isRegistering ? 'Registrati' : 'Login'}</h2>

        {user ? (
          <p className="login-message">Utente già autenticato</p>
        ) : (
          <form className="login-form" onSubmit={(e) => { e.preventDefault(); isRegistering ? handleRegister() : handleLogin()  }}>
            
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Inserisci email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Inserisci password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>


             {isRegistering && (
              <div className="login-field">
                <label>Nickname</label>
                <input
                  type="text"
                  placeholder="Inserisci nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              )}

              {isRegistering ? (
                <>
                  <button className="login-btn login-btn--primary" type="submit">Registrati</button>
                  <button className="login-btn login-btn--secondary" type="button" onClick={() => { setIsRegistering(false); setMessage(''); }}>Hai già un account? Accedi</button>
                </>
              ) : (
                <>
                  <button className="login-btn login-btn--primary" type="submit">Accedi</button>
                  <button className="login-btn login-btn--secondary" type="button" onClick={() => { setIsRegistering(true); setMessage(''); }}>Non hai un account? Registrati</button>
                </>
              )}

              <hr className="login-divider" />
              
              <button type="button" onClick={handleGoogleLogin} className="login-btn login-btn--google">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              Accedi con Google
              </button>

              {message && <p className="login-error">{message}</p>}
          </form>
        )}
      </div>
    </section>
  )
}

export default Login