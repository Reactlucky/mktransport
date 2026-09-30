"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignDriver } from "@/lib/services/assignments";
import { listDrivers } from "@/lib/services/drivers";
import { listActiveTrucks } from "@/lib/services/trucks";
import { queryKeys } from "@/lib/query-keys";
import { toInputDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/toast-provider";

export function AssignDialog({
  open,
  onClose,
  truckId,
  driverId,
}: {
  open: boolean;
  onClose: () => void;
  truckId?: string;
  driverId?: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [truck, setTruck] = useState(truckId ?? "");
  const [driver, setDriver] = useState(driverId ?? "");
  const [startedOn, setStartedOn] = useState(toInputDate());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setTruck(truckId ?? "");
    setDriver(driverId ?? "");
    setStartedOn(toInputDate());
    setNotes("");
  }, [open, truckId, driverId]);

  const trucksQuery = useQuery({
    queryKey: queryKeys.trucks.active,
    queryFn: () => listActiveTrucks(),
    enabled: open && !truckId,
  });

  const driversQuery = useQuery({
    queryKey: queryKeys.drivers.list("", "active"),
    queryFn: () => listDrivers(undefined, "active"),
    enabled: open && !driverId,
  });

  const mutation = useMutation({
    mutationFn: assignDriver,
    onSuccess: async () => {
      toast("Driver assigned", "success");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all }),
      ]);
      onClose();
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextTruck = truckId ?? truck;
    const nextDriver = driverId ?? driver;
    if (!nextTruck || !nextDriver || !startedOn) {
      toast("Choose a truck, a driver, and a start date.", "error");
      return;
    }
    mutation.mutate({
      truckId: nextTruck,
      driverId: nextDriver,
      startedOn,
      notes,
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={driverId ? "Assign truck" : "Assign driver"}
      fullScreenMobile
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!truckId && (
          <div>
            <Label htmlFor="assign-truck">Truck</Label>
            <Select
              id="assign-truck"
              value={truck}
              onChange={(e) => setTruck(e.target.value)}
              required
            >
              <option value="">Select truck</option>
              {(trucksQuery.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.registration_number}
                </option>
              ))}
            </Select>
          </div>
        )}
        {!driverId && (
          <div>
            <Label htmlFor="assign-driver">Driver</Label>
            <Select
              id="assign-driver"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              required
            >
              <option value="">Select driver</option>
              {(driversQuery.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="assign-start">Start date</Label>
          <Input
            id="assign-start"
            type="date"
            value={startedOn}
            onChange={(e) => setStartedOn(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="assign-notes">Notes</Label>
          <Input
            id="assign-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <Button type="submit" loading={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Assign"}
        </Button>
      </form>
    </Dialog>
  );
}
