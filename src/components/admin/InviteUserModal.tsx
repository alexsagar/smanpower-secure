"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, UserPlus, Loader2, Link as LinkIcon } from "lucide-react";
import { inviteUserAction } from "@/actions/users";

type RoleOption = { name: string; displayName: string };

export function InviteUserModal({ roles = [] }: { roles?: RoleOption[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setInviteLink(null);

    const formData = new FormData(e.currentTarget);
    const res = await inviteUserAction(formData);

    if (res.success) {
      setSuccess(true);
      if (res.inviteLink) {
        setInviteLink(res.inviteLink);
      }
      setTimeout(() => {
        if (!res.inviteLink) {
          setIsOpen(false);
        }
        router.refresh();
      }, 2000);
    } else {
      setError(res.error || "Failed to invite user");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-brand-black text-white hover:bg-brand-gold px-6 py-3 text-sm font-semibold tracking-widest uppercase flex items-center gap-2 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Invite User
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-black"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-brand-black mb-2 tracking-tight">Invite Team Member</h2>
              <p className="text-brand-muted text-sm mb-6">Send an invitation to join the admin dashboard.</p>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 text-sm mb-6 font-medium">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 text-emerald-600 p-4 text-sm mb-6 font-medium">
                  Invitation created successfully.
                  {inviteLink && (
                    <div className="mt-4 p-3 bg-white border border-emerald-200 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-brand-black uppercase tracking-wider">Dev Fallback Link:</span>
                      <div className="flex items-center gap-2 break-all text-xs">
                        <LinkIcon className="w-3 h-3 flex-shrink-0" />
                        <a href={inviteLink} className="underline hover:text-emerald-800" target="_blank" rel="noreferrer">
                          {inviteLink}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold tracking-widest uppercase text-brand-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full bg-brand-off-white border-0 p-3 focus:ring-1 focus:ring-brand-gold text-brand-black outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold tracking-widest uppercase text-brand-charcoal mb-2">
                      Name (Optional)
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full bg-brand-off-white border-0 p-3 focus:ring-1 focus:ring-brand-gold text-brand-black outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-xs font-semibold tracking-widest uppercase text-brand-charcoal mb-2">
                      Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      className="w-full bg-brand-off-white border-0 p-3 focus:ring-1 focus:ring-brand-gold text-brand-black outline-none"
                    >
                      <option value="">Select a role...</option>
                      {roles.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-black text-white hover:bg-brand-gold px-6 py-4 text-sm font-semibold tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Invitation
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
