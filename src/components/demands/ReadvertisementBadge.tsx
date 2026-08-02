import React from "react";
import { RefreshCw } from "lucide-react";

/**
 * Small green marker shown only on demands that were created by readvertising
 * an earlier demand. The flag comes from the readvertisedFromId relation, so it
 * can never be faked by typing "re-advertisement" into a title.
 *
 * Colour is not the only signal: the word "Re-advertisement" and an icon carry
 * the meaning for anyone who cannot distinguish the green.
 */
export function ReadvertisementBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 border border-green-700/30 bg-green-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-green-800"
      title="This vacancy has been advertised again"
    >
      <RefreshCw className="h-3 w-3" aria-hidden="true" />
      Re-advertisement
    </span>
  );
}
