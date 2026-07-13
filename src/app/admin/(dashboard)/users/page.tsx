import { getAdminUsers, getAssignableRoles } from "@/services/admin.service";
import { ShieldAlert, Key, UserCheck, Shield } from "lucide-react";
import { InviteUserModal } from "@/components/admin/InviteUserModal";

export default async function AdminUsersPage() {
  const [users, roles] = await Promise.all([getAdminUsers(), getAssignableRoles()]);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Key className="w-3 h-3" /> Module // Access Control
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            System Users & Roles
          </h1>
          <p className="text-brand-muted mt-2">
            Manage administrative access, permissions, and internal team accounts.
          </p>
        </div>
        <div className="group relative">
          <InviteUserModal roles={roles} />
        </div>
      </div>

      {/* Visual Analytics Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-black text-white border border-brand-black p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-white/40 uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-gold" /> Active Accounts
            </span>
            <div className="text-4xl font-light tracking-tight">{users.filter(u => u.accountStatus === "ACTIVE").length}</div>
          </div>
        </div>
        
        <div className="bg-white border border-brand-charcoal/5 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-charcoal/30" /> Admin Access
            </span>
            <div className="text-4xl font-light text-brand-black tracking-tight">
              {users.filter(u => u.role.name === 'super_admin').length}
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-charcoal/5 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4">Suspended</span>
            <div className="text-4xl font-light text-brand-black tracking-tight flex items-center gap-3">
              {users.filter(u => u.accountStatus === "SUSPENDED").length}
              {users.filter(u => u.accountStatus === "SUSPENDED").length > 0 && (
                <ShieldAlert className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-charcoal/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Team Directory</h2>
          <span className="text-xs text-brand-muted font-mono">{users.length} Users</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold bg-white">
                <th className="p-6 font-medium">User Details</th>
                <th className="p-6 font-medium">Role & Permissions</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium">Joined</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {users.length > 0 ? users.map((user) => (
                <tr key={user.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors">
                      {user.name}
                    </div>
                    <div className="text-xs text-brand-muted font-mono mt-1">
                      {user.email}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-brand-black text-brand-white">
                      {user.role.displayName}
                    </span>
                  </td>
                  <td className="p-6">
                    {user.accountStatus === "ACTIVE" ? (
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest border border-emerald-600/20 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : user.accountStatus === "INVITED" ? (
                      <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest border border-blue-600/20 px-2 py-1 rounded">
                        Invited
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-red-600 uppercase tracking-widest border border-red-600/20 px-2 py-1 rounded">
                        {user.accountStatus.toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-sm text-brand-charcoal font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-6 text-right">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
                      Managed by invite and security workflows
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-brand-muted">
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
