"use client";

import { useState } from "react";
import { scrollToChapter } from "@/lib/store";

interface EmailProps {
  email: string;
}

/** The email, huge, with a copy button that says what it did. */
export function Email({ email }: EmailProps) {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-5">
      <a
        href={`mailto:${email}`}
        data-cursor="Email"
        data-cursor-title="Say hello"
        className="type-display break-all text-[10vw] leading-[0.9] text-lamp underline decoration-2 underline-offset-[0.12em] [--wdth:77] hover:[--wdth:92] md:text-[5.6vw]"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={() => void copy()}
        className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-paper transition-colors hover:border-lamp hover:text-lamp"
      >
        {copied ? "Email copied" : "Copy email"}
      </button>
    </div>
  );
}

export function BackToRoom() {
  return (
    <button
      type="button"
      onClick={() => scrollToChapter("room")}
      data-cursor="Room"
      data-cursor-title="My room"
      data-cursor-path="/"
      className="rounded-full bg-lamp px-6 py-3 font-bold text-ink shadow-[0_0_0_4px_var(--color-paper)] transition-transform hover:scale-105"
    >
      Back to the room
    </button>
  );
}
