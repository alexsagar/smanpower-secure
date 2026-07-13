import { requireCurrentAdminUser } from "@/lib/permissions";
import { listSessionsAction } from "@/actions/session";
import { SessionsClient } from "./SessionsClient";

export default async function SessionsPage() {
  await requireCurrentAdminUser();
  const sessions = await listSessionsAction();

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Active Sessions</h1>
      <p className="text-gray-600 mb-8">
        Review your active admin sessions. You can revoke specific sessions or sign out everywhere else to secure your account.
      </p>

      <SessionsClient initialSessions={sessions} />
    </div>
  );
}
