import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/users", label: "Users", end: false },
  { to: "/exercises", label: "Exercises", end: false },
  { to: "/programs", label: "Programs", end: false },
  { to: "/workouts", label: "Workouts", end: false },
  { to: "/workout-logs", label: "Workout logs", end: false },
  { to: "/nutrition", label: "Nutrition", end: false },
  { to: "/recovery", label: "Recovery", end: false },
  { to: "/goals", label: "Goals", end: false },
  { to: "/progress", label: "Progress", end: false },
  { to: "/coach", label: "Coach", end: false },
  { to: "/system", label: "System", end: true },
];

export function AdminShell() {
  const { admin, logout } = useAuth();
  const displayName = admin?.first_name
    ? `${admin.first_name}${admin.last_name ? ` ${admin.last_name}` : ""}`
    : admin?.username ?? "Administrator";

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">EV</span>
          <div>
            <strong>EVOLVE</strong>
            <span>Admin Control Plane</span>
          </div>
        </div>
        <nav aria-label="Admin">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{displayName}</span>
            <span className="sidebar-user-email">{admin?.email}</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </aside>
      <div className="shell-main">
        <Outlet />
      </div>
    </div>
  );
}
