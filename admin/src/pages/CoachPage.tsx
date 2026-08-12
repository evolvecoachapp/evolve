import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchConversations } from "../api/admin";
import { errorMessage, formatDate } from "../components/Field";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import type { Conversation } from "../types/admin";

export function CoachPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load(nextOffset = 0) {
    setLoading(true);
    setError(null);
    fetchConversations({ userId: userId || undefined, limit: 20, offset: nextOffset })
      .then((page) => {
        setItems(page.items);
        setTotal(page.total);
        setOffset(page.offset);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setItems([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load conversations."));
      });
  }

  useEffect(() => {
    load(0);
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Coach</p>
          <h1>Conversations</h1>
        </div>
        <p className="muted">{total} conversations</p>
      </header>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <input className="input" placeholder="Filter by user id" value={userId} onChange={(event) => setUserId(event.target.value)} />
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>
      {loading ? <PageState kind="loading" title="Loading conversations" message="Fetching Coach history." /> : null}
      {error ? <PageState kind="error" title="Conversations unavailable" message={error} actionLabel="Retry" onAction={() => load(offset)} /> : null}
      {!loading && !error && items.length === 0 ? <PageState kind="empty" title="No conversations" message="Coach conversations will appear here." /> : null}
      {!loading && !error && items.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Conversation</th><th>User</th><th>Last message</th></tr></thead>
              <tbody>
                {items.map((conversation) => (
                  <tr key={conversation.id}>
                    <td><Link to={`/coach/${conversation.id}`}>{conversation.id.slice(0, 8)}</Link></td>
                    <td><Link to={`/users/${conversation.user_id}`}>{conversation.user_id.slice(0, 8)}</Link></td>
                    <td>{formatDate(conversation.last_message_at)}</td>
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
