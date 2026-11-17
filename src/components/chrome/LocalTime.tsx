"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
  timeZone: string;
}

const format = (timeZone: string): string =>
  new Intl.DateTimeFormat("en-IN", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date());

/** The current time where Sandeep is. Rendered after mount to avoid a server/client mismatch. */
export function LocalTime({ timeZone }: LocalTimeProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = (): void => setTime(format(timeZone));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return <time suppressHydrationWarning>{time ?? " "}</time>;
}
