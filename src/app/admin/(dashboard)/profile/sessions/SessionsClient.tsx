"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { revokeSessionAction, revokeAllOtherSessionsAction } from "@/actions/session";
import { toast } from "sonner";
import { Loader2, Monitor, ShieldAlert } from "lucide-react";

type SessionData = {
  id: string;
  createdAt: string;
  lastActivityAt: string;
  idleExpiresAt: string;
  isCurrent: boolean;
  deviceLabel: string;
};

export function SessionsClient({ initialSessions }: { initialSessions: SessionData[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const handleRevoke = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await revokeSessionAction(id);
      if (res.success) {
        toast.success("Session revoked successfully.");
        setSessions(prev => prev.filter(s => s.id !== id));
      } else {
        toast.error("Failed to revoke session.");
      }
    } catch {
      toast.error("An error occurred.");
    }
    setLoadingId(null);
  };

  const handleRevokeAll = async () => {
    setLoadingAll(true);
    try {
      const res = await revokeAllOtherSessionsAction();
      if (res.success) {
        toast.success(`Revoked ${res.count} other session(s).`);
        setSessions(prev => prev.filter(s => s.isCurrent));
      } else {
        toast.error("Failed to revoke sessions.");
      }
    } catch {
      toast.error("An error occurred.");
    }
    setLoadingAll(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your Devices</h2>
        <Button 
          variant="outline" 
          onClick={handleRevokeAll} 
          disabled={loadingAll || sessions.length <= 1}
        >
          {loadingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
          Sign Out All Other Sessions
        </Button>
      </div>
      
      <div className="grid gap-4">
        {sessions.map((s) => (
          <div key={s.id} className="bg-white border border-gray-200 p-5 flex justify-between items-center">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 text-gray-500 rounded-full">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{s.deviceLabel}</h3>
                  {s.isCurrent && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                      Current Session
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Last active: {new Date(s.lastActivityAt).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Expires: {new Date(s.idleExpiresAt).toLocaleString()}
                </div>
              </div>
            </div>
            {!s.isCurrent && (
              <Button 
                variant="outline" 
                onClick={() => handleRevoke(s.id)}
                disabled={loadingId === s.id}
              >
                {loadingId === s.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Revoke
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
