type PaginationBarProps = {
  total: number;
  limit: number;
  offset: number;
  onChange: (offset: number) => void;
};

export function PaginationBar({ total, limit, offset, onChange }: PaginationBarProps) {
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) {
    return null;
  }
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn btn-secondary"
        disabled={offset <= 0}
        onClick={() => onChange(Math.max(0, offset - limit))}
      >
        Previous
      </button>
      <span className="muted">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={offset + limit >= total}
        onClick={() => onChange(offset + limit)}
      >
        Next
      </button>
    </nav>
  );
}
