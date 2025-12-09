import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../lib/apiClient";
import { Menu, X } from "lucide-react";
import "./layout.css";

const links = [
  { to: "/feed", label: "Feed" },
  { to: "/athletes", label: "Athletes" },
  { to: "/members", label: "Brand Partners" },
  { to: "/admin", label: "Admin" },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkUrl?: string | null;
}

export function Layout() {
  const navigate = useNavigate();
  const { user, logout, isGuest } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get current user's athlete profile link if authenticated and has athlete profile
  const myProfilePath = user?.athlete ? `/athletes/${user.athlete.id}` : null;

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".layout-notifications-dropdown") &&
        !target.closest(".layout-notification-btn")
      ) {
        setShowNotifications(false);
      }
      if (
        !target.closest(".layout-settings-dropdown") &&
        !target.closest(".layout-settings-btn")
      ) {
        setShowSettings(false);
      }
    };

    if (showNotifications || showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications, showSettings]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".layout-sidebar") &&
        !target.closest(".layout-mobile-menu-btn")
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [sidebarOpen]);

  const fetchUnreadCount = async () => {
    try {
      const data = await apiClient.get<{ count: number }>(
        "/api/notifications/unread-count"
      );
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.get<Notification[]>("/api/notifications");
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await apiClient.put(`/api/notifications/${notification.id}/read`, {});
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
    setShowNotifications(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put("/api/notifications/read-all", {});
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <div className="layout-root">
      {/* Mobile Menu Button */}
      <button
        className="layout-mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="layout-mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`layout-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="layout-sidebar-top">
          <Link to="/" className="layout-logo">
            <span className="layout-logo-mark">BB</span>
            <span className="layout-logo-text">
              BlueBloods
              <span className="layout-logo-sub">NIL Exchange</span>
            </span>
          </Link>

          <div className="layout-user-actions">
            {!isGuest && (
              <button
                className="layout-notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="layout-notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              className="layout-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Settings"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="layout-nav">
          <p className="layout-nav-label">Navigate</p>
          {!isGuest && myProfilePath && (
            <NavLink
              to={myProfilePath}
              className={({ isActive }) =>
                `layout-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="layout-nav-indicator" />
              <span>My Profile</span>
            </NavLink>
          )}
          {links
            .filter((link) => {
              // Hide Admin link for guests and athletes
              if (
                link.to === "/admin" &&
                (isGuest || user?.role === "ATHLETE")
              ) {
                return false;
              }
              return true;
            })
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `layout-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="layout-nav-indicator" />
                <span>{link.label}</span>
              </NavLink>
            ))}
        </nav>

        <div className="layout-sidebar-bottom">
          {/* User Info Box */}
          {!isGuest && user && (
            <div className="layout-user-info">
              <div className="layout-user-avatar">
                {user.athlete?.avatarUrl ? (
                  <img
                    src={user.athlete.avatarUrl}
                    alt={user.athlete.name || user.email}
                    className="layout-user-avatar-img"
                  />
                ) : (
                  <div className="layout-user-avatar-initial">
                    {(user.athlete?.firstName || user.email)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="layout-user-details">
                <div className="layout-user-name">
                  {user.athlete?.name ||
                    (user.athlete?.firstName && user.athlete?.lastName
                      ? `${user.athlete.firstName} ${user.athlete.lastName}`
                      : user.email)}
                </div>
                <div className="layout-user-role">
                  {user.role === "ADMIN"
                    ? "Administrator"
                    : user.role === "ATHLETE"
                      ? "Athlete"
                      : user.role}
                </div>
              </div>
            </div>
          )}

          {isGuest ? (
            <button
              className="layout-logout-btn"
              onClick={() => navigate("/login")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Login</span>
            </button>
          ) : (
            <button className="layout-logout-btn" onClick={handleLogout}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Notifications Dropdown */}
      {!isGuest && showNotifications && (
        <div className="layout-notifications-dropdown">
          <div className="layout-notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="layout-mark-all-read"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="layout-notifications-list">
            {notifications.length === 0 ? (
              <div className="layout-notifications-empty">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`layout-notification-item ${!notification.read ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="layout-notification-content">
                    <div className="layout-notification-title">
                      {notification.title}
                    </div>
                    <div className="layout-notification-message">
                      {notification.message}
                    </div>
                    <div className="layout-notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()}{" "}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="layout-notification-dot" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="layout-settings-dropdown">
          {isGuest ? (
            <div
              className="layout-settings-item"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate("/login");
                setShowSettings(false);
              }}
            >
              <span>Login</span>
            </div>
          ) : (
            <>
              <div className="layout-settings-item">
                <span>Settings</span>
                <span
                  style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}
                >
                  Coming soon
                </span>
              </div>
              <div className="layout-settings-item">
                <span>Account</span>
                <span
                  style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}
                >
                  Coming soon
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <main className="layout-main">
        <div className="layout-main-chrome">
          <header className="layout-main-header">
            <div className="layout-main-pill">BlueBloods NIL Console</div>
          </header>
          <section className="layout-main-content">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}
