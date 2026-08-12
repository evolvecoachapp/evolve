import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { fetchConversations } from "../api/admin";
import { errorMessage, formatDate, shortId } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { PaginationBar } from "../components/PaginationBar";
import { UserLink } from "../components/UserLink";
import type { Conversation } from "../types/admin";

export function CoachPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [userId, setUserId] = useState(params.get("user") ?? "");
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
      <PageHeader eyebrow="Activity" title="Coach" meta={`${total} conversations`} />
      <p className="readonly-note">Read-only Coach history. Admin cannot send messages or start conversations.</p>
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(0); }}>
        <label>
          User id
          <input className="input" value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Filter by user id" />
        </label>
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
                    <td><Link to={`/coach/${conversation.id}`}>{shortId(conversation.id)}</Link></td>
                    <td><UserLink userId={conversation.user_id} /></td>
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
