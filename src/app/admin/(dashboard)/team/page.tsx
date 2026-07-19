import { getAdminTeamMembers } from "@/actions/team";
import { TeamManager } from "@/components/admin/team/TeamManager";

export default async function AdminTeamPage() {
  const members = await getAdminTeamMembers();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">CMS Collection</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-black">Team</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Manage people shown on the Leadership and Our People pages.
        </p>
      </div>
      <TeamManager members={members} />
    </div>
  );
}
