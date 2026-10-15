import { ScrollView, StyleSheet, View } from "react-native";
import { categories, copy, palette, type CategoryId } from "@/constants/content";
import { GUTTER } from "@/lib/layout";
import { Chip } from "./ui/Chip";
import { Icon } from "./ui/Icon";
import { Photo } from "./ui/Photo";

export type CategoryFilter = CategoryId | "all";

/** Horizontal category chips with round dish photos. */
export function CategoryChips({ value, onChange }: { value: CategoryFilter; onChange: (next: CategoryFilter) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip
        label={copy.home.all}
        selected={value === "all"}
        role="tab"
        onPress={() => onChange("all")}
        leading={
          <View style={[styles.thumb, styles.allThumb]}>
            <Icon name="sparkles" size={17} color={palette.butterInk} strokeWidth={2.2} />
          </View>
        }
      />
      {categories.map((c) => (
        <Chip
          key={c.id}
          label={c.label}
          role="tab"
          selected={value === c.id}
          onPress={() => onChange(value === c.id ? "all" : c.id)}
          leading={<Photo name={c.photo} style={styles.thumb} decorative />}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: GUTTER, gap: 8 },
  thumb: { width: 34, height: 34, borderRadius: 17 },
  allThumb: { backgroundColor: palette.butter, alignItems: "center", justifyContent: "center" },
});
