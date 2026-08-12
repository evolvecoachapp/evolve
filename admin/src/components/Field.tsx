import { AdminApiError } from "../types/admin";

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString();
}

export function formatDay(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return value.slice(0, 10);
}

export function errorMessage(caught: unknown, fallback: string): string {
  return caught instanceof AdminApiError ? caught.message : fallback;
}
