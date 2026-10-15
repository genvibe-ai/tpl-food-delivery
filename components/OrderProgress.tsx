import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { copy, courier, palette, radii, tracking } from "@/constants/content";
import { clock, fill } from "@/lib/format";
import { EASE_OUT } from "@/lib/motion";
import { toast } from "@/lib/ui";
import { Icon, type IconName } from "./ui/Icon";
import { IconButton } from "./ui/IconButton";
import { Photo } from "./ui/Photo";
import { Text } from "./ui/Text";

const STEP_ICONS: Record<string, IconName> = {
  placed: "receipt",
  preparing: "chef",
  pickedUp: "package",
  onTheWay: "bike",
  delivered: "home",
};

/** Segmented bar: one segment per step after "placed"; the current one fills over time. */
export function ProgressSegments({ index, progress }: { index: number; progress: number }) {
  const steps = tracking.steps;
  const total = steps[steps.length - 1].after || 1;
  return (
    <View style={styles.segments} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
      {steps.slice(1).map((step, i) => {
        const start = steps[i].after / total;
        const end = step.after / total;
        const local = Math.min(1, Math.max(0, (progress - start) / Math.max(0.0001, end - start)));
        return <Segment key={step.key} fill={i + 1 <= index ? 1 : local} />;
      })}
    </View>
  );
}

function Segment({ fill: amount }: { fill: number }) {
  const width = useSharedValue(amount);
  useEffect(() => {
    width.set(withTiming(amount, { duration: 900, easing: EASE_OUT }));
  }, [amount, width]);
  const style = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));
  return (
    <View style={styles.segment}>
      <Animated.View style={[styles.segmentFill, style]} />
    </View>
  );
}

/**
 * Vertical list of steps with times. The demo plays a delivery in seconds, so
 * step times are spread across the real window (placed → `endAt`).
 */
export function Timeline({
  index,
  placedAt,
  endAt,
  restaurantName,
}: {
  index: number;
  placedAt: number;
  endAt: number;
  restaurantName: string;
}) {
  const steps = tracking.steps;
  const total = steps[steps.length - 1]?.after || 1;
  const timeOf = (after: number) => placedAt + (after / total) * Math.max(0, endAt - placedAt);
  return (
    <View style={styles.timeline}>
      {steps.map((step, i) => {
        const done = i < index || (i === index && i === steps.length - 1);
        const current = i === index && !done;
        const last = i === steps.length - 1;
        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.rail}>
              <StepDot icon={STEP_ICONS[step.key] ?? "check"} state={done ? "done" : current ? "current" : "todo"} />
              {!last ? <View style={[styles.railLine, i < index ? styles.railLineDone : null]} /> : null}
            </View>
            <View style={styles.stepText}>
              <View style={styles.stepHead}>
                <Text variant="strong" color={done || current ? palette.ink : palette.faint}>
                  {step.title}
                </Text>
                {i <= index ? (
                  <Text variant="caption">{clock(timeOf(step.after))}</Text>
                ) : null}
              </View>
              {current || (done && last) ? (
                <Text variant="caption">{fill(step.detail, { restaurant: restaurantName, courier: courier.name })}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function StepDot({ icon, state }: { icon: IconName; state: "done" | "current" | "todo" }) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (state === "current" && !reduced)
      pulse.set(withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 0 })), -1));
    else pulse.set(0);
  }, [state, reduced, pulse]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.4 * (1 - pulse.get()), transform: [{ scale: 1 + pulse.get() * 0.8 }] }));
  return (
    <View style={styles.dotWrap}>
      {state === "current" ? <Animated.View style={[styles.dotRing, ring]} /> : null}
      <View style={[styles.dot, state === "done" ? styles.dotDone : state === "current" ? styles.dotCurrent : styles.dotTodo]}>
        <Icon
          name={state === "done" ? "check" : icon}
          size={15}
          strokeWidth={2.6}
          color={state === "todo" ? palette.faint : "#FFFFFF"}
        />
      </View>
    </View>
  );
}

/** Courier card with demo call and message buttons. */
export function CourierCard() {
  return (
    <View style={styles.courier}>
      <Photo name={courier.photo} style={styles.courierPhoto} />
      <View style={styles.flex}>
        <Text variant="micro">{copy.tracking.yourCourier}</Text>
        <Text variant="subheading">{courier.name}</Text>
        <View style={styles.courierMeta}>
          <Icon name="star" size={13} color={palette.butterDeep} fill={palette.butterDeep} strokeWidth={1.5} />
          <Text variant="caption" numberOfLines={1}>
            {courier.rating.toFixed(1)} · {courier.vehicle}
          </Text>
        </View>
      </View>
      <IconButton icon="message" label={copy.tracking.message} variant="soft" size={44} onPress={() => toast(copy.toasts.demoMessage, "message")} />
      <IconButton icon="phone" label={copy.tracking.call} variant="primary" size={44} onPress={() => toast(copy.toasts.demoCall, "phone")} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  segments: { flexDirection: "row", gap: 6 },
  segment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: palette.sunken, overflow: "hidden" },
  segmentFill: { height: "100%", borderRadius: 3, backgroundColor: palette.primary },
  timeline: { gap: 0 },
  stepRow: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center", width: 34 },
  railLine: { width: 2, flex: 1, minHeight: 18, backgroundColor: palette.sunken, marginVertical: 2, borderRadius: 1 },
  railLineDone: { backgroundColor: palette.primary },
  stepText: { flex: 1, paddingTop: 6, paddingBottom: 16, gap: 2 },
  stepHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  dotWrap: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  dotRing: { position: "absolute", width: 34, height: 34, borderRadius: 17, backgroundColor: palette.primary },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  dotDone: { backgroundColor: palette.primary },
  dotCurrent: { backgroundColor: palette.ink },
  dotTodo: { backgroundColor: palette.sunken },
  courier: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    boxShadow: "0 6px 18px rgba(34, 27, 24, 0.06)",
  },
  courierPhoto: { width: 56, height: 56, borderRadius: 28 },
  courierMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
});
