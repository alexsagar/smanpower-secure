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
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const notice = error ? SESSION_NOTICES[error] ?? null : null;
  const successNotice =
    message === "password_reset"
      ? "Your password has been reset successfully. You can now sign in with your new password."
      : null;

  return <LoginForm notice={notice} successNotice={successNotice} />;
}
