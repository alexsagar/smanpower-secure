import { LoginForm } from "./LoginForm";

const SESSION_NOTICES: Record<string, string> = {
  session_expired:
    "Your session has expired or is no longer valid. Please sign in again.",
  SessionInvalidated:
    "Your session has expired or is no longer valid. Please sign in again.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const notice = error ? SESSION_NOTICES[error] ?? null : null;

  return <LoginForm notice={notice} />;
}
