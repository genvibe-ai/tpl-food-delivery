/** Short-lived UI state shared across screens: toasts, confirm dialogs, bag pulses. Not saved. */
import { create } from "zustand";
import type { IconName } from "@/components/ui/icons";

export type DialogSpec = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

type UIState = {
  toast: { id: number; message: string; icon: IconName } | null;
  dialog: DialogSpec | null;
  /** Bumps whenever something lands in the bag, so the bag bar can bounce. */
  bagPulse: number;
  showToast: (message: string, icon?: IconName) => void;
  hideToast: () => void;
  confirm: (dialog: DialogSpec) => void;
  closeDialog: () => void;
  pulseBag: () => void;
};

let toastId = 0;

export const useUI = create<UIState>()((set) => ({
  toast: null,
  dialog: null,
  bagPulse: 0,
  showToast: (message, icon = "checkCircle") => set({ toast: { id: ++toastId, message, icon } }),
  hideToast: () => set({ toast: null }),
  confirm: (dialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),
  pulseBag: () => set((s) => ({ bagPulse: s.bagPulse + 1 })),
}));

export const toast = (message: string, icon?: IconName) => useUI.getState().showToast(message, icon);
