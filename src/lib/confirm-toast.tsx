import { toast } from "sonner";

/**
 * Centered confirmation toast replacing the browser `confirm()` dialog.
 * Resolves true if the user clicks confirm, false on cancel/dismiss.
 */
export function confirmToast(
  message: string,
  opts?: { confirmLabel?: string; cancelLabel?: string },
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: boolean) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    const id = toast(message, {
      duration: Infinity,
      action: {
        label: opts?.confirmLabel ?? "Confirm",
        onClick: () => {
          done(true);
          toast.dismiss(id);
        },
      },
      cancel: {
        label: opts?.cancelLabel ?? "Cancel",
        onClick: () => {
          done(false);
          toast.dismiss(id);
        },
      },
      onDismiss: () => done(false),
      onAutoClose: () => done(false),
    });
  });
}
