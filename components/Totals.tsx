import { StyleSheet, View } from "react-native";
import { copy, palette } from "@/constants/content";
import { money } from "@/lib/format";
import type { Totals as TotalsType } from "@/lib/pricing";
import { Text } from "./ui/Text";

/** The price breakdown: subtotal, fees, tip, promo and total. */
export function Totals({ totals }: { totals: TotalsType }) {
  const t = copy.totals;
  return (
    <View style={styles.list}>
      <Row label={t.subtotal} value={money(totals.subtotal)} />
      <Row
        label={t.delivery}
        value={totals.deliveryWaived || totals.delivery === 0 ? t.free : money(totals.delivery)}
        highlight={totals.deliveryWaived}
      />
      {totals.priority > 0 ? <Row label={t.priority} value={money(totals.priority)} /> : null}
      <Row label={t.service} value={money(totals.service)} />
      {totals.smallOrder > 0 ? <Row label={t.smallOrder} value={money(totals.smallOrder)} /> : null}
      <Row label={t.tax} value={money(totals.tax)} />
      <Row label={t.tip} value={money(totals.tip)} />
      {totals.discount > 0 && totals.promoCode ? (
        <Row label={t.promo(totals.promoCode)} value={money(-totals.discount)} highlight />
      ) : null}
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text variant="heading">{t.total}</Text>
        <Text variant="heading" style={styles.tabular}>
          {money(totals.total)}
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" color={palette.muted}>
        {label}
      </Text>
      <Text variant="strong" color={highlight ? palette.success : palette.ink} style={styles.tabular}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.lineStrong, marginVertical: 4 },
  tabular: { fontVariant: ["tabular-nums"] },
});
