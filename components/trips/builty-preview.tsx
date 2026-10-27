"use client";

import { pdf } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";
import { BuiltyDocument } from "@/components/trips/builty-document";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/states";
import type { Builty } from "@/lib/types";

async function loadEmblem(): Promise<string | null> {
  try {
    const response = await fetch("/mk-emblem.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function BuiltyPreview({ builty }: { builty: Builty }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setStatus("loading");
    setUrl(null);

    (async () => {
      try {
        const logoSrc = await loadEmblem();
        const blob = await pdf(<BuiltyDocument builty={builty} logoSrc={logoSrc} />).toBlob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [builty]);

  function download() {
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${builty.builty_number}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function printBuilty() {
    const frame = frameRef.current?.contentWindow;
    if (!frame) return;
    frame.focus();
    frame.print();
  }

  return (
    <section className="mt-6" aria-label="Builty preview">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold">Preview</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={download} disabled={!url}>
            Download
          </Button>
          <Button type="button" onClick={printBuilty} disabled={!url}>
            Print
          </Button>
        </div>
      </div>

      {status === "loading" && <InlineLoading label="Preparing builty..." />}
      {status === "error" && (
        <p className="text-sm text-danger" role="alert">
          The builty could not be prepared. Save it again to retry.
        </p>
      )}
      {url && (
        <div className="overflow-hidden rounded-[10px] border border-border bg-white">
          <iframe
            ref={frameRef}
            title={`Builty ${builty.builty_number}`}
            src={url}
            className="h-[70dvh] w-full sm:h-[1123px]"
          />
        </div>
      )}
    </section>
  );
}
