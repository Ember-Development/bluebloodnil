import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import './layout.css'

export function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="layout-root">
      <aside className="layout-sidebar">
        <Link to="/" className="layout-logo">
          BlueBloods
        </Link>
        <nav className="layout-nav">
          <NavLink to="/feed" className={({ isActive }) => (isActive ? 'active' : '')}>
            Feed
          </NavLink>
          <NavLink to="/athletes" className={({ isActive }) => (isActive ? 'active' : '')}>
            Athletes
          </NavLink>
          <NavLink to="/members" className={({ isActive }) => (isActive ? 'active' : '')}>
            Members
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            Admin
          </NavLink>
        </nav>
        <div className="layout-meta">
          <p className="layout-path">Current: {pathname}</p>
        </div>
      </aside>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
