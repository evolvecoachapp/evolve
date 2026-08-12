import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchUsers } from "../api/admin";
import { PageState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { AdminApiError, type AdminUser } from "../types/admin";

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    fetchUsers()
      .then((page) => {
        setUsers(page.items);
        setTotal(page.total);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setUsers([]);
        setLoading(false);
        setError(
          caught instanceof AdminApiError ? caught.message : "Unable to load users.",
        );
      });
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>Users</h1>
        </div>
        <p className="muted">{total} accounts</p>
      </header>
      {loading ? (
        <PageState kind="loading" title="Loading users" message="Fetching the account directory." />
      ) : null}
      {error ? (
        <PageState kind="error" title="Users unavailable" message={error} actionLabel="Retry" onAction={load} />
      ) : null}
      {!loading && !error && users.length === 0 ? (
        <PageState kind="empty" title="No users yet" message="Registered accounts will appear here." />
      ) : null}
      {!loading && !error && users.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link to={`/users/${user.id}`}>{user.username}</Link>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <StatusBadge tone={user.is_active ? "success" : "danger"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </StatusBadge>
                  </td>
                  <td>
                    <StatusBadge tone={user.is_superuser ? "warning" : "neutral"}>
                      {user.is_superuser ? "Superuser" : "User"}
                    </StatusBadge>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
