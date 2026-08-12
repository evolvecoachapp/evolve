import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchConversation, fetchConversationMessages } from "../api/admin";
import { errorMessage, Field, formatDate, shortId } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { PageState } from "../components/PageState";
import { UserLink } from "../components/UserLink";
import type { ChatMessage, Conversation } from "../types/admin";

export function ConversationDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchConversation(conversationId),
      fetchConversationMessages(conversationId, { limit: 50, offset: 0 }),
    ])
      .then(([record, page]) => {
        setConversation(record);
        setMessages(page.items);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        setConversation(null);
        setMessages([]);
        setLoading(false);
        setError(errorMessage(caught, "Unable to load this conversation."));
      });
  }

  useEffect(() => {
    load();
  }, [conversationId]);

  return (
    <main className="page">
      <PageHeader
        eyebrow={<><Link to="/coach">Coach</Link> / Conversation</>}
        title={conversation ? shortId(conversation.id) : "Conversation"}
      />
      {loading ? <PageState kind="loading" title="Loading conversation" message="Fetching messages." /> : null}
      {error ? <PageState kind="error" title="Conversation unavailable" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && conversation ? (
        <>
          <section className="detail-grid">
            <div className="detail-field">
              <span>User</span>
              <strong><UserLink userId={conversation.user_id} /></strong>
            </div>
            <Field label="Created" value={formatDate(conversation.created_at)} />
            <Field label="Last message" value={formatDate(conversation.last_message_at)} />
          </section>
          <section className="panel">
            <h2>Messages</h2>
            {messages.length === 0 ? <p className="muted">No messages in this conversation.</p> : (
              <ul className="plain-list">
                {messages.map((message) => (
                  <li key={message.id}>
                    <strong>{message.role}</strong> · {formatDate(message.created_at)}
                    <p>{message.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
