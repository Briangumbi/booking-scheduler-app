"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 rounded-lg border border-border bg-input px-3.5 py-2 text-[13px] font-semibold text-foreground"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
