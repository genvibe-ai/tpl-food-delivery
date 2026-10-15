/** Bag actions shared by several screens: they confirm, give feedback and navigate. */
import { useRouter } from "expo-router";
import { copy } from "@/constants/content";
import { getRestaurant } from "./catalog";
import { haptics } from "./haptics";
import type { Choices } from "./pricing";
import { useStore, type Order } from "./store";
import { toast, useUI } from "./ui";

/** Runs `go` straight away, or after "Start a new bag?" when the bag holds another restaurant's food. */
function confirmNewBag(restaurantId: string, go: () => void) {
  const state = useStore.getState();
  const current = getRestaurant(state.bag.restaurantId);
  const next = getRestaurant(restaurantId);
  if (current && next && current.id !== next.id && state.bag.lines.length > 0) {
    const d = copy.dialogs.newBag;
    useUI.getState().confirm({
      title: d.title,
      body: d.body(current.name, next.name),
      confirmLabel: d.confirm,
      onConfirm: () => {
        useStore.getState().clearBag();
        go();
      },
    });
  } else go();
}

/** Adds a dish with its choices; returns through `done` once it is in the bag. */
export function addDishToBag(
  restaurantId: string,
  line: { dishId: string; qty: number; choices: Choices; note?: string },
  name: string,
  done?: () => void,
) {
  confirmNewBag(restaurantId, () => {
    useStore.getState().addToBag(restaurantId, line);
    haptics.success();
    useUI.getState().pulseBag();
    toast(copy.toasts.added(line.qty > 1 ? `${line.qty} × ${name}` : name), "bag");
    done?.();
  });
}

export function useReorder() {
  const router = useRouter();
  return (order: Order) =>
    confirmNewBag(order.restaurantId, () => {
      if (!useStore.getState().reorder(order.id)) return;
      haptics.success();
      useUI.getState().pulseBag();
      toast(copy.toasts.reordered, "bag");
      router.push("/bag");
    });
}
