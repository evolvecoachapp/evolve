import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchUsers } from "../api/admin";
import { errorMessage, formatDate } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import { StatusBadge } from "../components/StatusBadge";
import type { AdminUser } from "../types/admin";

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filtered = Boolean(search || status);

  function load(nextOffset = offset) {
    setLoading(true);
    setError(null);
    fetchUsers({
      q: search || undefined,
      isActive: status === "" ? undefined : status === "active",
      limit: 20,
      offset: nextOffset,
    })
      .then((page) => {
        setUsers(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setUsers([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load users."));
      });
  }

  useEffect(() => {
    load(0);
  }, []);

  return (
    <main className="page">
      <PageHeader eyebrow="Overview" title="Users" meta={`${total} accounts`} />
      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          load(0);
        }}
      >
        <label>
          Search
          <input
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Email, username, or name"
          />
        </label>
        <label>
          Status
          <select
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
      </form>
      {loading ? (
        <PageState kind="loading" title="Loading users" message="Fetching the account directory." />
      ) : null}
      {error ? (
        <PageState kind="error" title="Users unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} />
      ) : null}
      {!loading && !error && users.length === 0 ? (
        <PageState
          kind="empty"
          title={filtered ? "No matching users" : "No users yet"}
          message={
            filtered
              ? "Try a different search or status filter."
              : "Registered accounts will appear here."
          }
        />
      ) : null}
      {!loading && !error && users.length > 0 ? (
        <>
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
                    <td>{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar total={total} limit={20} offset={offset} onChange={(next) => load(next)} />
        </>
      ) : null}
    </main>
  );
}
