type PageStateProps = {
  kind: "loading" | "error" | "empty";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function PageState({ kind, title, message, actionLabel, onAction }: PageStateProps) {
  return (
    <div className={`page-state page-state-${kind}`} role={kind === "error" ? "alert" : "status"}>
      <div className={`page-state-mark page-state-mark-${kind}`} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-secondary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
