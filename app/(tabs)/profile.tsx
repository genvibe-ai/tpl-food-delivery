import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RestaurantRow } from "@/components/RestaurantCard";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { Toggle } from "@/components/ui/Toggle";
import { brand, copy, palette, radii, user } from "@/constants/content";
import { getRestaurant } from "@/lib/catalog";
import { initials, money, thousands } from "@/lib/format";
import { GUTTER, useTabScreenPadding } from "@/lib/layout";
import { useStore } from "@/lib/store";
import { toast, useUI } from "@/lib/ui";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottom = useTabScreenPadding();
  const favourites = useStore((s) => s.favourites);
  const orders = useStore((s) => s.orders);
  const notifications = useStore((s) => s.notifications);
  const setNotifications = useStore((s) => s.setNotifications);
  const resetDemo = useStore((s) => s.resetDemo);
  const confirm = useUI((s) => s.confirm);
  const favouriteRestaurants = favourites.flatMap((id) => {
    const r = getRestaurant(id);
    return r ? [r] : [];
  });
  const ordersPlaced = orders.filter((o) => !o.sample).length;
  const pointsLeft = Math.max(0, user.pointsGoal - user.points);
  const p = copy.profile;

  const rows: { icon: IconName; label: string; onPress?: () => void; detail?: string }[] = [
    { icon: "pin", label: p.rows.addresses, onPress: () => router.push("/address") },
    { icon: "card", label: p.rows.payment, detail: "•••• 4242", onPress: () => toast(copy.toasts.demoScreen, "card") },
    { icon: "percent", label: p.rows.promos, detail: "HELLO40", onPress: () => toast(copy.toasts.demoScreen, "tag") },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: bottom }} showsVerticalScrollIndicator={false}>
        {/* Who */}
        <Animated.View entering={FadeInDown.duration(420)} style={styles.header}>
          <View style={styles.avatar}>
            <Text variant="title" color={palette.butterInk}>
              {initials(user.firstName, user.lastName)}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text variant="title" accessibilityRole="header">
              {user.firstName} {user.lastName}
            </Text>
            <Text variant="caption">{user.email}</Text>
            <Text variant="caption">{p.memberSince(user.memberSince)}</Text>
          </View>
        </Animated.View>

        {/* Rewards */}
        <Animated.View entering={FadeInDown.delay(60).duration(420)} style={[styles.rewards, styles.gutter]}>
          <View style={styles.rewardsHead}>
            <View style={styles.rewardsIcon}>
              <Icon name="gift" size={20} color={palette.ink} />
            </View>
            <Text variant="strong" color="#FFFFFF" style={styles.flex}>
              {p.rewardsTitle}
            </Text>
            <Text variant="heading" color={palette.butter}>
              {p.points(thousands(user.points))}
            </Text>
          </View>
          <View style={styles.rewardsTrack}>
            <View style={[styles.rewardsFill, { width: `${Math.min(100, (user.points / user.pointsGoal) * 100)}%` }]} />
          </View>
          <Text variant="caption" color="rgba(255,255,255,0.72)">
            {p.rewardsBody(pointsLeft)}
          </Text>
        </Animated.View>

        {/* Plus */}
        <Animated.View entering={FadeInDown.delay(120).duration(420)} style={styles.gutter}>
          <LinearGradient colors={[palette.primary, "#FF7A52"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.plus}>
            <View style={styles.plusRow}>
              <View style={styles.plusIcon}>
                <Icon name="crown" size={20} color={palette.primary} />
              </View>
              <View style={styles.flex}>
                <Text variant="heading" color="#FFFFFF">
                  {p.plusTitle}
                </Text>
                <Text variant="label" color="rgba(255,255,255,0.92)">
                  {p.plusBody}
                </Text>
              </View>
            </View>
            <Button title={p.plusCta} variant="white" size="sm" onPress={() => toast(copy.toasts.plus, "crown")} style={styles.plusButton} />
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <View style={[styles.stats, styles.gutter]}>
          <Stat value={String(user.lifetimeOrders + ordersPlaced)} label={p.stats.orders} />
          <Stat value={String(favouriteRestaurants.length)} label={p.stats.favourites} />
          <Stat value={money(user.lifetimeSaved, true)} label={p.stats.saved} />
        </View>

        {/* Favourites */}
        <View style={styles.section}>
          <Text variant="heading" style={styles.gutter}>
            {p.favourites}
          </Text>
          {favouriteRestaurants.length ? (
            <View style={[styles.card, styles.gutter, styles.favourites]}>
              {favouriteRestaurants.map((r, i) => (
                <View key={r.id} style={i > 0 ? styles.divided : null}>
                  <RestaurantRow restaurant={r} />
                </View>
              ))}
            </View>
          ) : (
            <Text variant="caption" style={[styles.gutter, styles.empty]}>
              {p.noFavourites}
            </Text>
          )}
        </View>

        {/* Settings */}
        <View style={[styles.card, styles.gutter, styles.section, styles.list]}>
          {rows.map((row, i) => (
            <Tap key={row.label} label={row.label} onPress={row.onPress} pressedScale={0.99} style={[styles.row, i > 0 ? styles.divided : null]}>
              <View style={styles.rowIcon}>
                <Icon name={row.icon} size={18} color={palette.ink} />
              </View>
              <Text variant="bodyMedium" style={styles.flex}>
                {row.label}
              </Text>
              {row.detail ? <Text variant="caption">{row.detail}</Text> : null}
              <Icon name="chevronRight" size={18} color={palette.faint} />
            </Tap>
          ))}
          <View style={[styles.row, styles.divided]}>
            <View style={styles.rowIcon}>
              <Icon name="bell" size={18} color={palette.ink} />
            </View>
            <Text variant="bodyMedium" style={styles.flex}>
              {p.rows.notifications}
            </Text>
            <Toggle value={notifications} onChange={setNotifications} label={p.rows.notifications} />
          </View>
          <Tap
            label={p.rows.help}
            onPress={() => toast(`${brand.supportEmail} · ${brand.supportPhone}`, "help")}
            pressedScale={0.99}
            style={[styles.row, styles.divided]}
          >
            <View style={styles.rowIcon}>
              <Icon name="help" size={18} color={palette.ink} />
            </View>
            <Text variant="bodyMedium" style={styles.flex}>
              {p.rows.help}
            </Text>
            <Icon name="chevronRight" size={18} color={palette.faint} />
          </Tap>
          <Tap
            label={p.rows.reset}
            pressedScale={0.99}
            style={[styles.row, styles.divided]}
            onPress={() =>
              confirm({
                title: copy.dialogs.reset.title,
                body: copy.dialogs.reset.body,
                confirmLabel: copy.dialogs.reset.confirm,
                destructive: true,
                onConfirm: () => {
                  resetDemo();
                  toast(copy.toasts.reset, "reorder");
                  router.replace("/onboarding");
                },
              })
            }
          >
            <View style={[styles.rowIcon, styles.rowIconWarm]}>
              <Icon name="reorder" size={18} color={palette.primaryText} />
            </View>
            <Text variant="bodyMedium" color={palette.primaryText} style={styles.flex}>
              {p.rows.reset}
            </Text>
          </Tap>
        </View>

        <Text variant="caption" align="center" style={styles.version}>
          {p.version(brand.version)}
        </Text>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="heading">{value}</Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  flex: { flex: 1 },
  gutter: { marginHorizontal: GUTTER },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: GUTTER },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: palette.butter,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    boxShadow: "0 8px 20px rgba(34, 27, 24, 0.10)",
  },
  rewards: { marginTop: 22, padding: 18, gap: 12, borderRadius: radii.xl, backgroundColor: palette.ink },
  rewardsHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  rewardsIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.butter,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardsTrack: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.14)", overflow: "hidden" },
  rewardsFill: { height: "100%", borderRadius: 4, backgroundColor: palette.butter },
  plus: { marginTop: 12, padding: 18, borderRadius: radii.xl, gap: 14 },
  plusRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  plusIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  plusButton: { alignSelf: "flex-start" },
  stats: { flexDirection: "row", gap: 10, marginTop: 12 },
  stat: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    gap: 2,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
  },
  section: { marginTop: 26 },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
  },
  favourites: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 4 },
  divided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line },
  empty: { marginTop: 8 },
  list: { paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 58 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.sunken, alignItems: "center", justifyContent: "center" },
  rowIconWarm: { backgroundColor: palette.primarySoft },
  version: { marginTop: 22, color: palette.faint },
});
