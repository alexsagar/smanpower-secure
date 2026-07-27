import { toast } from "sonner";

/** Centered confirmation toast replacing the browser confirm dialog. */
export function confirmToast(
  message: string,
  opts?: { confirmLabel?: string; cancelLabel?: string },
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    toast.custom((id) => (
      <div role="alertdialog" aria-modal="true" aria-label="Confirmation" className="fixed left-1/2 top-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 border border-brand-charcoal/15 bg-white p-5 shadow-2xl">
        <p className="text-sm font-medium text-brand-charcoal">{message}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => { done(false); toast.dismiss(id); }} className="px-4 py-2 text-sm font-semibold text-brand-charcoal hover:bg-brand-off-white">
            {opts?.cancelLabel ?? "Cancel"}
          </button>
          <button type="button" onClick={() => { done(true); toast.dismiss(id); }} className="bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold hover:text-brand-black">
            {opts?.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    ), { duration: Infinity, onDismiss: () => done(false) });
  });
}
