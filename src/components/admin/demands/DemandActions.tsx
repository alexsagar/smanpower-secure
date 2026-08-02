"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Globe, X, Archive, MoreVertical, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { publishDemandAction, closeDemandAction, archiveDemandAction, readvertiseDemandAction } from "@/actions/demands";

interface DemandActionsProps {
  demandId: string;
  status: string;
  title: string;
}

export function DemandActions({ demandId, status, title }: DemandActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  // The admin table sits inside `overflow-hidden` / `overflow-x-auto` containers,
  // which clip any absolutely positioned child regardless of z-index. Render the
  // menu into document.body and position it from the trigger's viewport rect.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      }
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [isOpen]);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      let res;
      switch (action) {
        case "publish":
          res = await publishDemandAction(demandId);
          break;
        case "close":
          res = await closeDemandAction(demandId);
          break;
        case "archive":
          res = await archiveDemandAction(demandId);
          break;
        case "readvertise":
          res = await readvertiseDemandAction(demandId);
          break;
        default:
          return;
      }

      if (!res.success) {
        toast.error((res as any).formError || "Action failed.");
      }

      // Send the admin straight into the new draft to review the deadline,
      // vacancy numbers and interview details before publishing.
      if (res.success && action === "readvertise" && (res as any).data?.id) {
        router.push(`/admin/demands/${(res as any).data.id}/edit`);
        return;
      }

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
      setIsOpen(false);
    }
  };

  const canPublish = status === "DRAFT";
  const canClose = status === "PUBLISHED" || status === "DRAFT";
  const canArchive = status === "CLOSED";
  // The server also permits a PUBLISHED demand whose deadline has passed; the
  // menu only offers the unambiguous CLOSED case and defers to the server.
  const canReadvertise = status === "CLOSED";

  if (!canPublish && !canClose && !canArchive && !canReadvertise) return null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-brand-charcoal hover:bg-brand-charcoal/10 rounded-sm transition-colors"
        title="Lifecycle Actions"
        disabled={isLoading}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && menuPos && typeof document !== "undefined" && createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[1000]" onClick={() => { setIsOpen(false); setConfirmAction(null); }} />

          <div
            style={{ top: menuPos.top, right: menuPos.right }}
            className="fixed bg-white border border-brand-charcoal/15 shadow-lg rounded-sm z-[1001] w-56 py-1"
          >
            {/* Confirm dialog overlay */}
            {confirmAction && (
              <div className="p-4">
                <p className="text-xs font-semibold text-brand-charcoal mb-3">
                  {confirmAction === "publish" && `Publish "${title}"? It will become publicly visible.`}
                  {confirmAction === "close" && `Close "${title}"? Applications will stop.`}
                  {confirmAction === "archive" && `Archive "${title}"? This soft-deletes it.`}
                  {confirmAction === "readvertise" && `Readvertise "${title}"? This creates a new draft copy. The original demand and its applicants are left unchanged.`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(confirmAction)}
                    disabled={isLoading}
                    className={`flex-1 text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-sm text-white transition-colors ${
                      confirmAction === "publish" ? "bg-green-600 hover:bg-green-700" :
                      confirmAction === "close" ? "bg-red-600 hover:bg-red-700" :
                      "bg-gray-600 hover:bg-gray-700"
                    } disabled:opacity-50`}
                  >
                    {isLoading ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-sm bg-brand-charcoal/10 hover:bg-brand-charcoal/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!confirmAction && (
              <>
                {canPublish && (
                  <button
                    onClick={() => setConfirmAction("publish")}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-green-50 text-green-700 transition-colors"
                  >
                    <Globe className="w-4 h-4" /> Publish
                  </button>
                )}
                {canClose && (
                  <button
                    onClick={() => setConfirmAction("close")}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" /> Close
                  </button>
                )}
                {canReadvertise && (
                  <button
                    onClick={() => setConfirmAction("readvertise")}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-green-50 text-green-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Readvertise
                  </button>
                )}
                {canArchive && (
                  <button
                    onClick={() => setConfirmAction("archive")}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <Archive className="w-4 h-4" /> Archive
                  </button>
                )}
              </>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
