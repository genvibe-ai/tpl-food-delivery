/** Lookups and search over the sample restaurants in constants/content.ts. */
import { categories, restaurants, type CategoryId, type Dish, type Restaurant } from "@/constants/content";

const restaurantIndex = new Map(restaurants.map((r) => [r.id, r]));
const dishIndex = new Map<string, Dish>();
for (const r of restaurants) for (const s of r.sections) for (const d of s.dishes) dishIndex.set(`${r.id}/${d.id}`, d);

export function getRestaurant(id: string | null | undefined): Restaurant | undefined {
  return id ? restaurantIndex.get(id) : undefined;
}

export function getDish(restaurantId: string, dishId: string): Dish | undefined {
  return dishIndex.get(`${restaurantId}/${dishId}`);
}

export function allDishes(restaurant: Restaurant) {
  return restaurant.sections.flatMap((s) => s.dishes);
}

/** Dishes to suggest in the bag: no required choices, not already added. */
export function suggestionsFor(restaurant: Restaurant, excludeIds: string[], limit = 6) {
  return allDishes(restaurant)
    .filter((d) => !excludeIds.includes(d.id) && !(d.groups ?? []).some((g) => g.min > 0))
    .sort((a, b) => Number(!!b.photo) - Number(!!a.photo) || a.price - b.price)
    .slice(0, limit);
}

export function categoryLabel(id: CategoryId) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Restaurants and dishes whose name, cuisine or description match the query. */
export function search(query: string) {
  const q = normalize(query.trim());
  if (!q) return { restaurants: [], dishes: [] };
  const terms = q.split(/\s+/);
  const hit = (text: string) => terms.every((t) => normalize(text).includes(t));
  const matchedRestaurants = restaurants.filter(
    (r) => hit(`${r.name} ${r.cuisine} ${r.categories.map(categoryLabel).join(" ")}`),
  );
  const dishes: { dish: Dish; restaurant: Restaurant }[] = [];
  for (const r of restaurants)
    for (const d of allDishes(r)) if (hit(`${d.name} ${d.description}`)) dishes.push({ dish: d, restaurant: r });
  dishes.sort((a, b) => Number(!!b.dish.photo) - Number(!!a.dish.photo));
  return { restaurants: matchedRestaurants, dishes: dishes.slice(0, 12) };
}
