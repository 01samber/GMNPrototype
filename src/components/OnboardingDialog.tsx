import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/store/uiStore";

export function OnboardingDialog() {
  const done = useUIStore((s) => s.onboardingComplete);
  const complete = useUIStore((s) => s.completeOnboarding);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!done) setOpen(true);
  }, [done]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to GMN ML Studio</DialogTitle>
          <DialogDescription className="text-left leading-relaxed">
            You are about to walk through a full machine learning workflow using the bundled GMN operations workbook
            (loaded automatically): data quality, cleaning, EDA, feature engineering, multiple regressions, KPI
            storytelling, and exports — all inside your browser.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            type="button"
            onClick={() => {
              complete();
              setOpen(false);
            }}
          >
            Get started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
