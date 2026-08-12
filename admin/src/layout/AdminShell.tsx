import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { ConfirmDialog } from "../components/ConfirmDialog";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", end: true },
      { to: "/users", label: "Users", end: false },
    ],
  },
  {
    label: "Catalog",
    items: [
      { to: "/exercises", label: "Exercises", end: false },
      { to: "/programs", label: "Programs", end: false },
      { to: "/workouts", label: "Workouts", end: false },
    ],
  },
  {
    label: "Activity",
    items: [
      { to: "/workout-logs", label: "Workout logs", end: false },
      { to: "/nutrition", label: "Nutrition", end: false },
      { to: "/recovery", label: "Recovery", end: false },
      { to: "/goals", label: "Goals", end: false },
      { to: "/progress", label: "Progress", end: false },
      { to: "/coach", label: "Coach", end: false },
    ],
  },
  {
    label: "Operations",
    items: [{ to: "/system", label: "System", end: true }],
  },
];

export function AdminShell() {
  const { admin, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const displayName = admin?.first_name
    ? `${admin.first_name}${admin.last_name ? ` ${admin.last_name}` : ""}`
    : admin?.username ?? "Administrator";

  async function confirmAndLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  }

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">EV</span>
          <div>
            <strong>EVOLVE</strong>
            <span>Admin Control Plane</span>
          </div>
        </div>
        <nav aria-label="Admin">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="nav-section">
              <p className="nav-section-label">{section.label}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{displayName}</span>
            <span className="sidebar-user-email">{admin?.email}</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setConfirmLogout(true)}
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="shell-main" id="admin-main">
        <Outlet />
      </div>
      {confirmLogout ? (
        <ConfirmDialog
          title="Log out"
          message="End this administrator session and return to the sign-in screen."
          confirmLabel="Log out"
          busy={loggingOut}
          onConfirm={() => void confirmAndLogout()}
          onCancel={() => setConfirmLogout(false)}
        />
      ) : null}
    </div>
  );
}
