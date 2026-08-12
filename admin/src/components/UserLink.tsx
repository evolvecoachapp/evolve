import { Link } from "react-router-dom";

import { shortId } from "./Field";

export function UserLink({ userId }: { userId: string }) {
  return (
    <Link to={`/users/${userId}`} aria-label={`User ${shortId(userId)}`}>
      {shortId(userId)}
    </Link>
  );
}
