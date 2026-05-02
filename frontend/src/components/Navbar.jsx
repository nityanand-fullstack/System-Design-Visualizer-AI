import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { isAdmin, auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">⚙</span>
          <span>SysDesign Viz</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          {isAdmin && <NavLink to="/admin/new">Add System</NavLink>}
          {isAdmin ? (
            <>
              <span className="nav-user">{auth.user?.email}</span>
              <button className="btn-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login">Admin Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
