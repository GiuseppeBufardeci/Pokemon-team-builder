import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import './Navbar.css'

export default function Navbar() {
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        try {
        await logout();
        } catch (error: unknown) {
        if (error instanceof Error) console.error(error.message);
        }
    }

    return (
        <header className="navbar">
            <div className="navbar__inner">
                <div className="navbar__brand">
                    <NavLink to="/" className="navbar__brand-link">
                        TEAM BUILDER
                    </NavLink>
                </div>

                <nav className="navbar__nav" aria-label="Navigazione principale">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                        isActive ? "navbar__link navbar__link--active" : "navbar__link"
                        }
                    >
                        Build
                    </NavLink>
                    <NavLink
                        to="/community"
                        className={({ isActive }) =>
                        isActive ? "navbar__link navbar__link--active" : "navbar__link"
                        }
                    >
                        Community
                    </NavLink>
                    <NavLink
                        to="/teams"
                        className={({ isActive }) =>
                        isActive ? "navbar__link navbar__link--active" : "navbar__link"
                        }
                    >
                        My Teams
                    </NavLink>
                </nav>

                <div className="navbar__actions">
                {!user ? (
                    <NavLink to="/login" className="navbar__link navbar__link--action">
                    Login
                    </NavLink>
                ) : (
                    <>
                    <span className="navbar__user-email">
                        {user.displayName ?? "allenatore"}
                    </span>
                    <button
                        type="button"
                        className="navbar__logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                    </>
                )}
                </div>
            </div>
        </header>
  )
}