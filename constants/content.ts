/**
 * Spoonlet: brand, colours, fonts, photos, copy, fees and sample data all
 * live in this one file. Restaurant menus (data/restaurants.ts) and past
 * orders (data/orders.ts) are re-exported from here. Every screen reads from
 * this file, so rebranding the app starts here.
 */
import type { ImageSourcePropType } from "react-native";
import { restaurants as restaurantList, type CategoryId, type Restaurant } from "@/data/restaurants";
import { sampleOrderSpecs } from "@/data/orders";

export type { CategoryId, Dish, DishOption, MenuSection, OptionGroup, Restaurant } from "@/data/restaurants";

export const brand = {
  name: "Spoonlet",
  tagline: "Good food, right to your door.",
  /** The neighbourhood the sample restaurants deliver to. */
  area: "Juniper Heights",
  supportEmail: "help@spoonlet.example",
  supportPhone: "(555) 010-4477",
  version: "1.0.0",
};

/** Light theme. Text colours keep AA contrast on `canvas` and `surface`. */
export const palette = {
  canvas: "#FFFBF7", // warm white page
  surface: "#FFFFFF", // cards and sheets
  sunken: "#F6EEE6", // fields, steppers, quiet chips
  tint: "#FFF3EC", // soft tomato wash
  ink: "#221B18", // deep charcoal text and dark surfaces
  inkSoft: "#4A3F3A",
  muted: "#6F635C", // secondary text
  faint: "#A3968E", // placeholders and disabled
  line: "rgba(34, 27, 24, 0.08)",
  lineStrong: "rgba(34, 27, 24, 0.14)",
  primary: "#F0502F", // tomato: buttons, active states, badges
  primaryPressed: "#D9441F",
  primaryText: "#C8391B", // tomato for small text on light backgrounds
  primarySoft: "#FFE4DA",
  onPrimary: "#FFFFFF",
  butter: "#FFE9A8", // soft butter-yellow accent
  butterSoft: "#FFF6DB",
  butterDeep: "#F2B925", // stars
  butterInk: "#5A4300", // text on butter
  success: "#1F8A53",
  successSoft: "#E2F3E8",
  scrim: "rgba(26, 20, 17, 0.42)",
  frame: "#F3E9DF", // around the app on wide web screens
};

/** Colours of the drawn map (web tracking, onboarding, address and checkout). */
export const mapColors = {
  road: "#FFFDFA",
  casing: "#EADFD2",
  block: "#F4EBE0",
  blockAlt: "#EFE4D6",
  park: "#D9ECCF",
  parkDot: "#BEDCAE",
  water: "#D3E6EF",
  route: "#F0502F",
};

/**
 * Font families loaded in lib/fonts.ts (Bricolage Grotesque for headings,
 * Figtree for text; both SIL Open Font License).
 */
export const fonts = {
  display: "BricolageGrotesque_800ExtraBold",
  heading: "BricolageGrotesque_700Bold",
  headingSemi: "BricolageGrotesque_600SemiBold",
  body: "Figtree_400Regular",
  medium: "Figtree_500Medium",
  semibold: "Figtree_600SemiBold",
  bold: "Figtree_700Bold",
};

/** Corner radii: rounded and soft everywhere. */
export const radii = { sm: 12, md: 16, lg: 22, xl: 28, sheet: 32, pill: 999 };

export const currency = { symbol: "$" };

export const user = {
  firstName: "Maya",
  lastName: "Brooks",
  email: "maya@spoonlet.example",
  phone: "(555) 010-2234",
  memberSince: 2024,
  points: 1240,
  pointsGoal: 1500,
  lifetimeOrders: 24,
  lifetimeSaved: 86,
};

export type Photo = { source: ImageSourcePropType; alt: string; width: number; height: number };

/** Every photo in the app (real JPEGs in assets/food and assets/people). */
export const photos = {
  burger: { source: require("../assets/food/burger.jpg"), alt: "Smash burger with melted cheese and fries", width: 800, height: 800 },
  ramen: { source: require("../assets/food/ramen.jpg"), alt: "Tonkotsu ramen with chashu, soft egg and scallions", width: 800, height: 800 },
  pizza: { source: require("../assets/food/pizza.jpg"), alt: "Margherita pizza with blistered crust and basil", width: 800, height: 800 },
  sushi: { source: require("../assets/food/sushi.jpg"), alt: "Platter of nigiri and maki rolls", width: 800, height: 800 },
  tacos: { source: require("../assets/food/tacos.jpg"), alt: "Grilled chicken tacos with pickled onion and lime", width: 800, height: 800 },
  dessert: { source: require("../assets/food/dessert.jpg"), alt: "Basque cheesecake with fresh berries", width: 800, height: 800 },
  poke: { source: require("../assets/food/poke.jpg"), alt: "Salmon poke bowl with avocado, mango and edamame", width: 900, height: 600 },
  salad: { source: require("../assets/food/salad.jpg"), alt: "Grilled chicken salad with tomatoes and feta", width: 900, height: 600 },
  smoothie: { source: require("../assets/food/smoothie.jpg"), alt: "Pink smoothie bowl with kiwi, granola and coconut", width: 900, height: 600 },
  toast: { source: require("../assets/food/toast.jpg"), alt: "Avocado toast with a poached egg", width: 900, height: 600 },
  oats: { source: require("../assets/food/oats.jpg"), alt: "Berry overnight oats with banana", width: 900, height: 600 },
  pasta: { source: require("../assets/food/pasta.jpg"), alt: "Tomato basil penne with parmesan", width: 900, height: 600 },
  venueBurger: { source: require("../assets/food/venue-1.jpg"), alt: "Bright burger restaurant with a wooden counter", width: 1200, height: 800 },
  venueRamen: { source: require("../assets/food/venue-2.jpg"), alt: "Cozy ramen bar counter with paper lanterns", width: 1200, height: 800 },
  venuePizza: { source: require("../assets/food/venue-3.jpg"), alt: "Pizzeria with a glowing wood-fired oven", width: 1200, height: 800 },
  courier: { source: require("../assets/people/courier.jpg"), alt: "Portrait of Arjun, your courier", width: 256, height: 256 },
} satisfies Record<string, Photo>;
export type PhotoKey = keyof typeof photos;

export const restaurants: Restaurant[] = restaurantList;
export const sampleOrders = sampleOrderSpecs;

/** Category chips on Home and tiles on Search. */
export const categories: { id: CategoryId; label: string; photo: PhotoKey }[] = [
  { id: "burgers", label: "Burgers", photo: "burger" },
  { id: "pizza", label: "Pizza", photo: "pizza" },
  { id: "ramen", label: "Ramen", photo: "ramen" },
  { id: "sushi", label: "Sushi", photo: "sushi" },
  { id: "tacos", label: "Tacos", photo: "tacos" },
  { id: "healthy", label: "Healthy", photo: "poke" },
  { id: "breakfast", label: "Breakfast", photo: "toast" },
  { id: "dessert", label: "Dessert", photo: "dessert" },
];

export type PromoAction =
  | { kind: "code"; code: string }
  | { kind: "restaurant"; restaurantId: string }
  | { kind: "dish"; restaurantId: string; dishId: string };

/** The promo carousel on Home. Tones: tomato, butter or ink. */
export const promos: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  tone: "tomato" | "butter" | "ink";
  photo: PhotoKey;
  action: PromoAction;
}[] = [
  {
    id: "welcome",
    eyebrow: "New to Spoonlet?",
    title: "40% off your\nfirst order",
    body: "Up to $15 off with code",
    cta: "HELLO40",
    tone: "tomato",
    photo: "pizza",
    action: { kind: "code", code: "HELLO40" },
  },
  {
    id: "patty-free",
    eyebrow: "This week",
    title: "Free delivery\nat Patty Club",
    body: "On orders over $25",
    cta: "Order now",
    tone: "butter",
    photo: "burger",
    action: { kind: "restaurant", restaurantId: "patty-club" },
  },
  {
    id: "yuzu",
    eyebrow: "New at Kumo",
    title: "Yuzu Shio\nramen is here",
    body: "Bright, light and limited",
    cta: "Try it",
    tone: "ink",
    photo: "ramen",
    action: { kind: "dish", restaurantId: "kumo-ramen", dishId: "yuzu-shio" },
  },
];

/** Codes the bag accepts. */
export const promoCodes: Record<string, { percent: number; max: number; label: string }> = {
  HELLO40: { percent: 0.4, max: 15, label: "40% off, up to $15" },
};

export const fees = {
  serviceRate: 0.05,
  serviceMin: 0.99,
  serviceMax: 4.99,
  smallOrderUnder: 12,
  smallOrderFee: 2,
  taxRate: 0.0875,
};

export const tipRates = [0, 0.1, 0.15, 0.2];
export const defaultTipRate = 0.15;

export type DeliveryOptionId = "standard" | "priority" | "schedule";
export const deliveryOptions: { id: DeliveryOptionId; title: string; detail: string; fee: number }[] = [
  { id: "standard", title: "Standard", detail: "Arrives in {eta}", fee: 0 },
  { id: "priority", title: "Priority", detail: "Straight to you, ~10 min sooner", fee: 1.99 },
  { id: "schedule", title: "Schedule", detail: "Pick a time later today", fee: 0 },
];
/** Minutes Priority saves; scheduled slots are this long. */
export const deliveryTiming = { priorityMinutesSaved: 10, slotMinutes: 30, slotCount: 4 };

export type PaymentIcon = "card" | "wallet" | "cash";
export const paymentMethods: { id: string; title: string; detail: string; icon: PaymentIcon }[] = [
  { id: "card", title: "Demo card", detail: "•••• 4242 · expires 08/29", icon: "card" },
  { id: "wallet", title: "Spoonlet credit", detail: "$12.40 available", icon: "wallet" },
  { id: "cash", title: "Cash on delivery", detail: "Pay your courier at the door", icon: "cash" },
];

export type Address = { id: string; label: string; line1: string; line2: string; note?: string };

export const addresses: { saved: Address[]; current: Address; suggestions: Address[] } = {
  saved: [
    { id: "home", label: "Home", line1: "418 Juniper Street", line2: "Apt 3B · Juniper Heights", note: "Buzz 3B, leave by the door" },
    { id: "work", label: "Work", line1: "77 Orchard Lane", line2: "Floor 5 · Old Mill District" },
  ],
  /** "Use my current location" picks this (the demo has no GPS lookup). */
  current: { id: "home", label: "Home", line1: "418 Juniper Street", line2: "Apt 3B · Juniper Heights", note: "Buzz 3B, leave by the door" },
  suggestions: [
    { id: "s-willow", label: "Willow Court", line1: "12 Willow Court", line2: "Riverside" },
    { id: "s-harbor", label: "Harbor Road", line1: "905 Harbor Road", line2: "Old Port" },
    { id: "s-maple", label: "Maple Row", line1: "230 Maple Row", line2: "Juniper Heights" },
    { id: "s-cedar", label: "Cedar Hill", line1: "51 Cedar Hill Avenue", line2: "Cedar Hill" },
    { id: "s-river", label: "Riverside Drive", line1: "1800 Riverside Drive", line2: "Riverside" },
    { id: "s-lantern", label: "Lantern Street", line1: "64 Lantern Street", line2: "Old Mill District" },
  ],
};

export const courier = {
  name: "Arjun",
  vehicle: "E-bike",
  rating: 4.9,
  deliveries: "1,240 deliveries",
  photo: "courier" as PhotoKey,
};

/**
 * Order tracking. A real delivery takes about half an hour; the demo plays
 * the whole journey in `after` seconds so it can be watched end to end.
 * `{restaurant}` and `{courier}` are filled in.
 */
export const tracking = {
  steps: [
    { key: "placed", title: "Order placed", detail: "{restaurant} has your order.", after: 0 },
    { key: "preparing", title: "Preparing", detail: "The kitchen is cooking your food.", after: 6 },
    { key: "pickedUp", title: "Picked up", detail: "{courier} has your food.", after: 24 },
    { key: "onTheWay", title: "On the way", detail: "{courier} is riding over now.", after: 32 },
    { key: "delivered", title: "Delivered", detail: "Enjoy your meal!", after: 80 },
  ],
  /** Real-world coordinates for the live map on iPhone and Android. */
  map: {
    restaurant: { latitude: 45.5229, longitude: -122.6821 },
    home: { latitude: 45.5318, longitude: -122.6664 },
  },
};

/** Everything the app says. Functions fill in names and numbers. */
export const copy = {
  tabs: { home: "Home", search: "Search", orders: "Orders", profile: "Profile" },
  common: {
    back: "Back",
    close: "Close",
    cancel: "Cancel",
    min: "min",
    items: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
  },
  dates: {
    today: "Today",
    yesterday: "Yesterday",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    am: "AM",
    pm: "PM",
  },
  onboarding: {
    eyebrow: "Local food delivery",
    title: "Good food,\nright to your door.",
    body: "Order from the best kitchens in Juniper Heights. Hot, fast and tracked to the minute.",
    start: "Get started",
    skip: "Browse first",
    courierBadge: "12 min away",
    stats: [
      { value: "120+", label: "kitchens" },
      { value: "24 min", label: "avg. delivery" },
      { value: "4.9", label: "app rating" },
    ],
    locationEyebrow: "Step 2 of 2",
    locationTitle: "Where should we deliver?",
    locationBody: "We'll show the kitchens that deliver to you.",
  },
  address: {
    title: "Delivery address",
    useLocation: "Use my current location",
    locating: "Finding you…",
    searchPlaceholder: "Search street or area",
    saved: "Saved",
    suggestions: "Suggestions",
    noMatches: "No matches yet. Try “Maple” or “Harbor”.",
  },
  home: {
    deliverTo: "Deliver to",
    greeting: (name: string, hour: number) =>
      `${hour < 5 ? "Hi" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, ${name}`,
    title: (hour: number) =>
      hour >= 5 && hour < 11 ? "What's for\nbreakfast?" : hour >= 11 && hour < 16 ? "What's for\nlunch?" : "What's for\ndinner?",
    searchPlaceholder: "Search dishes or restaurants",
    all: "All",
    orderAgain: "Order again",
    featured: "Featured near you",
    allRestaurants: "All restaurants",
    openNow: (n: number) => `${n} open now`,
    filters: { fast: "Under 25 min", free: "Free delivery", top: "Rated 4.8+" },
    noMatchTitle: "Nothing matches yet",
    noMatchBody: "Try another category or clear the filters.",
    clearFilters: "Clear filters",
    reorder: "Reorder",
  },
  restaurant: {
    delivery: "delivery",
    freeDelivery: "Free delivery",
    freeOver: (amount: string) => `Free delivery on orders over ${amount}`,
    freeOverShort: (amount: string) => `Free over ${amount}`,
    ratings: (count: string) => `${count} ratings`,
    statTime: "delivery time",
    statFee: "delivery fee",
    tags: { popular: "Popular", spicy: "Spicy", veggie: "Veggie", new: "New" },
    favourite: "Save restaurant",
    share: "Share",
    notFound: "We couldn't find that restaurant.",
  },
  dish: {
    required: "Required",
    optional: "Optional",
    upTo: (n: number) => `Choose up to ${n}`,
    chooseOne: "Choose 1",
    done: "Done",
    noteTitle: "Note for the kitchen",
    notePlaceholder: "Allergies, no onions, extra crispy…",
    add: (qty: number) => (qty === 1 ? "Add to bag" : `Add ${qty} to bag`),
    missing: (title: string) => `Choose ${title.toLowerCase()}`,
    kcal: (n: number) => `${n} kcal`,
    decrease: "Fewer",
    increase: "More",
  },
  bag: {
    title: "Your bag",
    clear: "Clear",
    addItems: "Add items",
    completeMeal: "Complete your meal",
    promoTitle: "Promo code",
    promoPlaceholder: "Enter a code",
    apply: "Apply",
    removePromo: "Remove",
    promoApplied: (code: string, label: string) => `${code} · ${label}`,
    promoInvalid: "That code isn't valid. Try HELLO40.",
    tipTitle: "Tip your courier",
    tipNote: "100% of your tip goes to your courier.",
    noTip: "No tip",
    checkout: "Go to checkout",
    remove: "Remove",
    emptyTitle: "Your bag is empty",
    emptyBody: "Add something delicious and it will show up here.",
    emptyCta: "Find something to eat",
    freeDeliveryHint: (amount: string) => `Add ${amount} more for free delivery`,
    freeDeliveryUnlocked: "You unlocked free delivery",
  },
  dialogs: {
    newBag: {
      title: "Start a new bag?",
      body: (from: string, to: string) => `Your bag has items from ${from}. Clear it to add this from ${to}.`,
      confirm: "Start new bag",
    },
    clearBag: { title: "Clear your bag?", body: "Every item in your bag will be removed.", confirm: "Clear bag" },
    reset: {
      title: "Reset the demo?",
      body: "Your bag, orders and settings go back to the sample data.",
      confirm: "Reset",
    },
  },
  checkout: {
    title: "Checkout",
    deliverTo: "Deliver to",
    change: "Change",
    dropoff: { door: "Leave at door", hand: "Hand it to me" },
    notePlaceholder: "Note for your courier",
    time: "Delivery time",
    payment: "Payment",
    summary: "Order summary",
    place: "Place order",
    placing: "Placing order…",
    demoNote: "Demo checkout. No payment is taken.",
  },
  totals: {
    subtotal: "Subtotal",
    delivery: "Delivery fee",
    priority: "Priority delivery",
    service: "Service fee",
    smallOrder: "Small order fee",
    tax: "Estimated tax",
    tip: "Courier tip",
    promo: (code: string) => `Promo ${code}`,
    total: "Total",
    free: "Free",
  },
  tracking: {
    arriving: "Arriving by",
    arrived: "Delivered at",
    live: "Live",
    orderNumber: (n: string) => `Order ${n}`,
    yourCourier: "Your courier",
    call: "Call",
    message: "Message",
    deliverTo: "Delivering to",
    deliveredTitle: "Enjoy your meal!",
    deliveredBody: (restaurant: string) => `How was ${restaurant}?`,
    rated: "Thanks! Your rating helps the kitchen.",
    reorder: "Order this again",
    home: "Back to home",
    help: "Help",
    demoNote: "Demo: this order moves along on its own in about a minute.",
    notFound: "We couldn't find that order.",
    paidWith: "Paid with",
  },
  orders: {
    title: "Orders",
    subtitle: "Track, rate and reorder",
    active: "In progress",
    track: "Track",
    past: "Past orders",
    reorder: "Reorder",
    delivered: "Delivered",
    rate: "Rate your order",
    emptyTitle: "No orders yet",
    emptyBody: "Your first order will show up here, with live tracking.",
    emptyCta: "Start an order",
  },
  search: {
    title: "Search",
    placeholder: "Dishes, restaurants or cuisines",
    recent: "Recent searches",
    clearRecent: "Clear",
    popular: "Popular right now",
    popularTerms: ["Ramen", "Smash burger", "Poke", "Margherita", "Tacos"],
    cuisines: "Browse by cuisine",
    restaurants: "Restaurants",
    dishes: "Dishes",
    noResultsTitle: (q: string) => `Nothing for “${q}”`,
    noResultsBody: "Try a dish like ramen, tacos or pizza.",
    clear: "Clear search",
  },
  profile: {
    title: "Profile",
    memberSince: (year: number) => `Member since ${year}`,
    rewardsTitle: "Spoonlet Rewards",
    points: (n: string) => `${n} pts`,
    rewardsBody: (left: number) => `${left} points to a week of free delivery`,
    plusTitle: "Spoonlet Plus",
    plusBody: "Free delivery over $15 and 5% back on every order.",
    plusCta: "Try free for 30 days",
    stats: { orders: "Orders", favourites: "Favourites", saved: "Saved" },
    favourites: "Your favourites",
    noFavourites: "Tap the heart on a restaurant to keep it here.",
    rows: {
      addresses: "Saved addresses",
      payment: "Payment methods",
      promos: "Promo codes",
      notifications: "Order updates",
      help: "Help center",
      reset: "Reset demo data",
    },
    version: (v: string) => `Spoonlet ${v} · demo app`,
  },
  toasts: {
    added: (name: string) => `${name} added to your bag`,
    promoSaved: (code: string) => `${code} is waiting in your bag`,
    promoApplied: (code: string) => `${code} applied`,
    reordered: "Your usual is in the bag",
    favourited: "Saved to your favourites",
    unfavourited: "Removed from favourites",
    shared: "Link copied (demo)",
    demoCall: "Calls are off in this demo",
    demoMessage: "Messages are off in this demo",
    demoScreen: "That screen isn't part of the demo yet",
    rated: "Thanks for rating!",
    plus: "Spoonlet Plus is a demo. No charge.",
    reset: "Demo data reset",
  },
};
