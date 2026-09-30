"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Option {
  value: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  fetchOptions: (search: string) => Promise<Option[]>;
  queryKey: readonly unknown[];
  onAddNew?: () => void;
  addNewLabel?: string;
  disabled?: boolean;
  initialLabel?: string;
}

export function SearchableSelect({
  label,
  value,
  onChange,
  placeholder = "Select...",
  error,
  fetchOptions,
  queryKey,
  onAddNew,
  addNewLabel = "+ Add new",
  disabled,
  initialLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(search), 250);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const { data: options = [], isFetching } = useQuery({
    queryKey: [...queryKey, debounced],
    queryFn: () => fetchOptions(debounced),
    enabled: open,
    staleTime: 60_000,
  });

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label;
  }, [options, value]);

  const display =
    (pickedLabel || selectedLabel || initialLabel) && value
      ? pickedLabel || selectedLabel || initialLabel!
      : placeholder;

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-sm font-medium" htmlFor={listId}>
          {label}
        </label>
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="text-xs font-medium text-primary hover:underline"
          >
            {addNewLabel}
          </button>
        )}
      </div>
      <button
        type="button"
        id={listId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-[14px] border bg-muted/80 px-3 text-left text-base md:text-sm",
          error ? "border-danger" : "border-input",
          !value && "text-muted-foreground"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{display}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-floating)]">
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-10 pl-9"
              autoFocus
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {isFetching && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </li>
            )}
            {!isFetching && options.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No results
              </li>
            )}
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  className={cn(
                    "flex w-full flex-col px-3 py-2.5 text-left text-sm hover:bg-muted",
                    opt.value === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setPickedLabel(opt.label);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="font-medium">{opt.label}</span>
                  {opt.subtitle && (
                    <span className="text-xs text-muted-foreground">
                      {opt.subtitle}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {onAddNew && (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  onAddNew();
                }}
              >
                <Plus className="size-4" />
                {addNewLabel.replace(/^\+\s*/, "")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
