"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 bg-warning-muted px-4 py-2 text-sm text-warning"
      role="status"
    >
      <WifiOff className="size-4 shrink-0" />
      <span>
        You&apos;re offline. Some actions may not be available until your
        connection is restored.
      </span>
    </div>
  );
}
