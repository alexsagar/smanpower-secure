"use client";

import { Trash2 } from "lucide-react";
import { deleteJobAction } from "@/actions/jobs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteJobButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    toast("Delete this job?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          setIsDeleting(true);
          try {
            await deleteJobAction(id);
            toast.success("Job deleted.");
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error("Failed to delete job.");
          } finally {
            setIsDeleting(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => console.log("Cancelled"),
      },
    });
  };

  return (
    <button onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:text-red-700 transition-colors ml-4 disabled:opacity-50">
      <Trash2 className="w-4 h-4 inline-block" />
    </button>
  );
}
