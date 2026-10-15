/**
 * Sample restaurants and menus (all fictional). Re-exported from
 * constants/content.ts, which is where screens read them from.
 *
 * Prices are in dollars. `photo` names a photo in `photos` (content.ts);
 * dishes without a photo show as text rows. Option groups: `min: 1, max: 1`
 * is a required single choice, `min: 0` is optional, `max` caps add-ons.
 */
import type { PhotoKey } from "@/constants/content";

export type CategoryId = "burgers" | "pizza" | "ramen" | "sushi" | "tacos" | "healthy" | "breakfast" | "dessert";

export type DishOption = { id: string; label: string; price?: number };

export type OptionGroup = {
  id: string;
  title: string;
  min: number;
  max: number;
  options: DishOption[];
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  photo?: PhotoKey;
  kcal?: number;
  tags?: ("popular" | "spicy" | "veggie" | "new")[];
  groups?: OptionGroup[];
};

export type MenuSection = { id: string; title: string; dishes: Dish[] };

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  priceLevel: string;
  rating: number;
  ratingCount: string;
  etaMin: number;
  etaMax: number;
  deliveryFee: number;
  /** Delivery is free once the subtotal reaches this amount. */
  freeDeliveryOver?: number;
  distance: string;
  cover: PhotoKey;
  /** Letter-mark logo. */
  mark: { letter: string; bg: string; fg: string };
  categories: CategoryId[];
  featured?: boolean;
  about: string;
  address: string;
  sections: MenuSection[];
};

/* Reusable option groups ------------------------------------------------ */

const drinkSize: OptionGroup = {
  id: "size",
  title: "Size",
  min: 1,
  max: 1,
  options: [
    { id: "regular", label: "Regular" },
    { id: "large", label: "Large", price: 1.25 },
  ],
};

const burgerGroups: OptionGroup[] = [
  {
    id: "patties",
    title: "How many patties?",
    min: 1,
    max: 1,
    options: [
      { id: "single", label: "Single" },
      { id: "double", label: "Double", price: 3.5 },
      { id: "triple", label: "Triple", price: 6 },
    ],
  },
  {
    id: "cheese",
    title: "Cheese",
    min: 1,
    max: 1,
    options: [
      { id: "american", label: "American" },
      { id: "cheddar", label: "Aged cheddar", price: 0.75 },
      { id: "pepperjack", label: "Pepper jack", price: 0.75 },
      { id: "none", label: "No cheese" },
    ],
  },
  {
    id: "extras",
    title: "Extras",
    min: 0,
    max: 4,
    options: [
      { id: "bacon", label: "Smoked bacon", price: 2 },
      { id: "onions", label: "Caramelized onions", price: 1 },
      { id: "jalapenos", label: "Pickled jalapeños", price: 0.75 },
      { id: "sauce", label: "Extra club sauce", price: 0.5 },
    ],
  },
];

const ramenGroups: OptionGroup[] = [
  {
    id: "broth",
    title: "Broth",
    min: 1,
    max: 1,
    options: [
      { id: "light", label: "Light" },
      { id: "regular", label: "Regular" },
      { id: "rich", label: "Extra rich", price: 1 },
    ],
  },
  {
    id: "noodles",
    title: "Noodles",
    min: 1,
    max: 1,
    options: [
      { id: "soft", label: "Soft" },
      { id: "regular", label: "Regular" },
      { id: "firm", label: "Firm" },
    ],
  },
  {
    id: "toppings",
    title: "Add toppings",
    min: 0,
    max: 4,
    options: [
      { id: "egg", label: "Soft egg", price: 2 },
      { id: "chashu", label: "Extra chashu", price: 4 },
      { id: "corn", label: "Corn butter", price: 1.5 },
      { id: "chili", label: "House chili oil", price: 0.75 },
    ],
  },
];

const pizzaGroups: OptionGroup[] = [
  {
    id: "size",
    title: "Size",
    min: 1,
    max: 1,
    options: [
      { id: "12", label: '12" · serves 1–2' },
      { id: "16", label: '16" · serves 2–3', price: 6 },
    ],
  },
  {
    id: "crust",
    title: "Crust",
    min: 1,
    max: 1,
    options: [
      { id: "classic", label: "Classic Neapolitan" },
      { id: "thin", label: "Thin & crispy" },
      { id: "gf", label: "Gluten-free", price: 3 },
    ],
  },
  {
    id: "toppings",
    title: "Extra toppings",
    min: 0,
    max: 3,
    options: [
      { id: "burrata", label: "Burrata", price: 4 },
      { id: "pepperoni", label: "Pepperoni", price: 3 },
      { id: "honey", label: "Hot honey", price: 1.5 },
      { id: "basil", label: "Fresh basil", price: 0.5 },
    ],
  },
];

const tacoGroups: OptionGroup[] = [
  {
    id: "tortilla",
    title: "Tortilla",
    min: 1,
    max: 1,
    options: [
      { id: "corn", label: "Corn" },
      { id: "flour", label: "Flour" },
    ],
  },
  {
    id: "salsa",
    title: "Salsa",
    min: 1,
    max: 1,
    options: [
      { id: "verde", label: "Salsa verde" },
      { id: "roja", label: "Salsa roja" },
      { id: "habanero", label: "Habanero (hot)" },
    ],
  },
  {
    id: "extras",
    title: "Extras",
    min: 0,
    max: 3,
    options: [
      { id: "guac", label: "Guacamole", price: 2 },
      { id: "queso", label: "Queso fresco", price: 1 },
      { id: "onion", label: "Pickled red onion", price: 0.5 },
    ],
  },
];

const bowlGroups: OptionGroup[] = [
  {
    id: "base",
    title: "Base",
    min: 1,
    max: 1,
    options: [
      { id: "rice", label: "Sushi rice" },
      { id: "brown", label: "Brown rice" },
      { id: "greens", label: "Mixed greens" },
      { id: "half", label: "Half rice, half greens" },
    ],
  },
  {
    id: "extras",
    title: "Extras",
    min: 0,
    max: 3,
    options: [
      { id: "protein", label: "Double protein", price: 4 },
      { id: "avocado", label: "Extra avocado", price: 1.5 },
      { id: "crunch", label: "Crispy shallots", price: 0.75 },
    ],
  },
];

const coffeeGroups: OptionGroup[] = [
  drinkSize,
  {
    id: "milk",
    title: "Milk",
    min: 1,
    max: 1,
    options: [
      { id: "whole", label: "Whole milk" },
      { id: "oat", label: "Oat milk", price: 0.6 },
      { id: "almond", label: "Almond milk", price: 0.6 },
    ],
  },
];

/* Restaurants ------------------------------------------------------------ */

export const restaurants: Restaurant[] = [
  {
    id: "patty-club",
    name: "Patty Club",
    cuisine: "Burgers · American",
    priceLevel: "$$",
    rating: 4.8,
    ratingCount: "2.1k",
    etaMin: 15,
    etaMax: 25,
    deliveryFee: 1.49,
    freeDeliveryOver: 25,
    distance: "0.8 mi",
    cover: "venueBurger",
    mark: { letter: "P", bg: "#F0502F", fg: "#FFFFFF" },
    categories: ["burgers"],
    featured: true,
    about: "Smash burgers on toasted potato buns, hand-cut fries and thick shakes.",
    address: "210 Copper Street",
    sections: [
      {
        id: "smash",
        title: "Smash burgers",
        dishes: [
          {
            id: "classic-smash",
            name: "Classic Smash",
            description: "Two crispy-edged patties, American cheese, pickles, onions and club sauce on a potato bun.",
            price: 11.5,
            photo: "burger",
            kcal: 780,
            tags: ["popular"],
            groups: burgerGroups,
          },
          {
            id: "butter-smash",
            name: "Butter Smash",
            description: "Brown-butter onions, aged cheddar and black pepper mayo.",
            price: 13,
            kcal: 840,
            groups: burgerGroups,
          },
          {
            id: "mushroom-smash",
            name: "Mushroom Swiss",
            description: "Roasted mushrooms, Swiss cheese and garlic aioli.",
            price: 13.5,
            kcal: 760,
            groups: burgerGroups,
          },
          {
            id: "crispy-chicken",
            name: "Crispy Chicken Sandwich",
            description: "Buttermilk fried thigh, slaw and spicy honey glaze.",
            price: 12.5,
            kcal: 820,
            tags: ["spicy"],
          },
        ],
      },
      {
        id: "sides",
        title: "Sides",
        dishes: [
          { id: "fries", name: "Shoestring fries", description: "Sea salt and rosemary.", price: 4.5, kcal: 380, tags: ["veggie"] },
          { id: "rings", name: "Onion rings", description: "Beer-battered, with smoky dip.", price: 5.5, kcal: 420, tags: ["veggie"] },
          { id: "mac-bites", name: "Mac & cheese bites", description: "Six golden bites with chipotle mayo.", price: 6, kcal: 510 },
        ],
      },
      {
        id: "shakes",
        title: "Shakes & drinks",
        dishes: [
          { id: "vanilla-shake", name: "Vanilla bean shake", description: "Thick, cold and properly vanilla.", price: 6.5, kcal: 560, groups: [drinkSize] },
          { id: "caramel-shake", name: "Salted caramel shake", description: "With burnt caramel swirl.", price: 7, kcal: 610, tags: ["new"], groups: [drinkSize] },
          { id: "lemonade", name: "Fresh lemonade", description: "Squeezed every morning.", price: 3.75, kcal: 140, groups: [drinkSize] },
        ],
      },
    ],
  },
  {
    id: "kumo-ramen",
    name: "Kumo Ramen Bar",
    cuisine: "Ramen · Japanese",
    priceLevel: "$$",
    rating: 4.9,
    ratingCount: "1.4k",
    etaMin: 20,
    etaMax: 30,
    deliveryFee: 1.99,
    distance: "1.3 mi",
    cover: "venueRamen",
    mark: { letter: "K", bg: "#221B18", fg: "#FFE9A8" },
    categories: ["ramen"],
    featured: true,
    about: "Eighteen-hour pork broth, springy noodles and a counter that smells like heaven.",
    address: "48 Lantern Alley",
    sections: [
      {
        id: "ramen",
        title: "Ramen",
        dishes: [
          {
            id: "tonkotsu",
            name: "Tonkotsu Ramen",
            description: "Creamy pork broth, chashu, soft egg, scallions, nori and sesame.",
            price: 15.5,
            photo: "ramen",
            kcal: 890,
            tags: ["popular"],
            groups: ramenGroups,
          },
          {
            id: "spicy-miso",
            name: "Spicy Miso Ramen",
            description: "Red miso, minced pork, bean sprouts and chili threads.",
            price: 15,
            kcal: 860,
            tags: ["spicy"],
            groups: ramenGroups,
          },
          {
            id: "yuzu-shio",
            name: "Yuzu Shio Ramen",
            description: "Clear chicken broth brightened with yuzu.",
            price: 14.5,
            kcal: 640,
            tags: ["new"],
            groups: ramenGroups,
          },
          {
            id: "mushroom-shoyu",
            name: "Mushroom Shoyu",
            description: "Shiitake and kombu broth, roasted mushrooms, bok choy.",
            price: 14,
            kcal: 590,
            tags: ["veggie"],
            groups: ramenGroups,
          },
        ],
      },
      {
        id: "small-plates",
        title: "Small plates",
        dishes: [
          { id: "gyoza", name: "Pork gyoza", description: "Six pan-fried dumplings, ponzu.", price: 7.5, kcal: 420, tags: ["popular"] },
          { id: "karaage", name: "Chicken karaage", description: "Crispy ginger-soy chicken, lemon mayo.", price: 8.5, kcal: 530 },
          { id: "edamame", name: "Edamame", description: "Flaky salt or garlic chili.", price: 5, kcal: 190, tags: ["veggie"] },
        ],
      },
      {
        id: "drinks",
        title: "Drinks",
        dishes: [
          { id: "matcha-soda", name: "Matcha soda", description: "Sparkling, lightly sweet.", price: 4.5, kcal: 90 },
          { id: "yuzu-lemonade", name: "Yuzu lemonade", description: "Tart and fizzy.", price: 4.5, kcal: 120 },
        ],
      },
    ],
  },
  {
    id: "ember-dough",
    name: "Ember & Dough",
    cuisine: "Pizza · Italian",
    priceLevel: "$$",
    rating: 4.7,
    ratingCount: "3.2k",
    etaMin: 25,
    etaMax: 35,
    deliveryFee: 1.99,
    distance: "1.9 mi",
    cover: "venuePizza",
    mark: { letter: "E", bg: "#FFE9A8", fg: "#221B18" },
    categories: ["pizza", "dessert"],
    featured: true,
    about: "Wood-fired pizza with 48-hour dough, fresh pasta and a cheesecake people drive for.",
    address: "9 Kiln Road",
    sections: [
      {
        id: "pizza",
        title: "Wood-fired pizza",
        dishes: [
          {
            id: "margherita",
            name: "Margherita",
            description: "San Marzano tomato, fior di latte, basil and olive oil.",
            price: 16,
            photo: "pizza",
            kcal: 920,
            tags: ["popular", "veggie"],
            groups: pizzaGroups,
          },
          {
            id: "hot-honey",
            name: "Hot Honey Pepperoni",
            description: "Cup-and-char pepperoni, mozzarella and chili honey.",
            price: 19,
            kcal: 1080,
            tags: ["spicy"],
            groups: pizzaGroups,
          },
          {
            id: "funghi",
            name: "Funghi Bianca",
            description: "Roasted mushrooms, ricotta, thyme, no tomato.",
            price: 18,
            kcal: 970,
            tags: ["veggie"],
            groups: pizzaGroups,
          },
        ],
      },
      {
        id: "pasta",
        title: "Pasta",
        dishes: [
          {
            id: "penne",
            name: "Tomato basil penne",
            description: "Slow-cooked tomato, basil, parmesan and a little chili.",
            price: 15.5,
            photo: "pasta",
            kcal: 710,
            tags: ["veggie"],
          },
          { id: "cacio", name: "Cacio e pepe", description: "Pecorino, black pepper, fresh tonnarelli.", price: 16, kcal: 780, tags: ["veggie"] },
        ],
      },
      {
        id: "desserts",
        title: "Desserts",
        dishes: [
          {
            id: "cheesecake",
            name: "Basque cheesecake",
            description: "Burnt top, molten middle, fresh berries.",
            price: 8.5,
            photo: "dessert",
            kcal: 520,
            tags: ["popular"],
          },
          { id: "tiramisu", name: "Tiramisu", description: "Espresso-soaked and mascarpone-rich.", price: 8, kcal: 470 },
        ],
      },
    ],
  },
  {
    id: "luz-taqueria",
    name: "Luz Taqueria",
    cuisine: "Tacos · Mexican",
    priceLevel: "$",
    rating: 4.8,
    ratingCount: "980",
    etaMin: 15,
    etaMax: 25,
    deliveryFee: 0.99,
    distance: "0.6 mi",
    cover: "tacos",
    mark: { letter: "L", bg: "#2F8F6B", fg: "#FFFFFF" },
    categories: ["tacos"],
    about: "Street tacos on hand-pressed tortillas, with salsas made fresh every morning.",
    address: "301 Market Row",
    sections: [
      {
        id: "tacos",
        title: "Tacos",
        dishes: [
          {
            id: "chicken-tacos",
            name: "Grilled chicken tacos",
            description: "Three tacos with charred chicken, pickled onion, cilantro and lime.",
            price: 11.5,
            photo: "tacos",
            kcal: 640,
            tags: ["popular"],
            groups: tacoGroups,
          },
          { id: "carnitas", name: "Carnitas tacos", description: "Slow-braised pork, salsa verde, onion.", price: 12, kcal: 690, groups: tacoGroups },
          { id: "fish-tacos", name: "Crispy fish tacos", description: "Beer-battered fish, chipotle slaw.", price: 13, kcal: 710, groups: tacoGroups },
        ],
      },
      {
        id: "sides",
        title: "Sides",
        dishes: [
          { id: "elote", name: "Street corn", description: "Cotija, lime, chili and crema.", price: 5.5, kcal: 310, tags: ["veggie"] },
          { id: "chips-guac", name: "Chips & guacamole", description: "Warm tortilla chips.", price: 7, kcal: 480, tags: ["veggie"] },
        ],
      },
      {
        id: "drinks",
        title: "Drinks",
        dishes: [
          { id: "horchata", name: "Horchata", description: "Rice, cinnamon and vanilla.", price: 4, kcal: 210, groups: [drinkSize] },
          { id: "jamaica", name: "Hibiscus agua fresca", description: "Floral, tart and cold.", price: 4, kcal: 110, groups: [drinkSize] },
        ],
      },
    ],
  },
  {
    id: "greenfold",
    name: "Greenfold",
    cuisine: "Bowls · Healthy",
    priceLevel: "$$",
    rating: 4.7,
    ratingCount: "1.1k",
    etaMin: 10,
    etaMax: 20,
    deliveryFee: 0.99,
    distance: "0.9 mi",
    cover: "poke",
    mark: { letter: "G", bg: "#DDEFD3", fg: "#1F5C3A" },
    categories: ["healthy", "sushi"],
    about: "Bright bowls, crunchy salads and smoothie bowls that taste like summer.",
    address: "12 Willow Court",
    sections: [
      {
        id: "bowls",
        title: "Bowls & salads",
        dishes: [
          {
            id: "salmon-poke",
            name: "Salmon poke bowl",
            description: "Salmon, avocado, mango, edamame, cucumber and sesame.",
            price: 16.5,
            photo: "poke",
            kcal: 640,
            tags: ["popular"],
            groups: bowlGroups,
          },
          {
            id: "chicken-salad",
            name: "Grilled chicken salad",
            description: "Herb chicken, tomatoes, feta, olives and lemon dressing.",
            price: 14.5,
            photo: "salad",
            kcal: 470,
          },
        ],
      },
      {
        id: "smoothie-bowls",
        title: "Smoothie bowls",
        dishes: [
          {
            id: "pitaya-bowl",
            name: "Pink pitaya bowl",
            description: "Dragon fruit, kiwi, granola and coconut.",
            price: 11,
            photo: "smoothie",
            kcal: 380,
            tags: ["veggie"],
          },
        ],
      },
      {
        id: "drinks",
        title: "Drinks",
        dishes: [
          { id: "green-juice", name: "Green juice", description: "Kale, apple, cucumber and ginger.", price: 6.5, kcal: 120, tags: ["veggie"] },
          { id: "cold-brew", name: "Cold brew", description: "Smooth, 16-hour steep.", price: 4.5, kcal: 5, groups: [drinkSize] },
        ],
      },
    ],
  },
  {
    id: "morning-ritual",
    name: "Morning Ritual",
    cuisine: "Breakfast · Café",
    priceLevel: "$",
    rating: 4.6,
    ratingCount: "760",
    etaMin: 15,
    etaMax: 25,
    deliveryFee: 1.29,
    distance: "1.1 mi",
    cover: "toast",
    mark: { letter: "M", bg: "#8A5A3B", fg: "#FFF5D6" },
    categories: ["breakfast"],
    about: "All-day breakfast, good bread and very serious coffee.",
    address: "77 Orchard Lane",
    sections: [
      {
        id: "plates",
        title: "Breakfast plates",
        dishes: [
          {
            id: "avo-toast",
            name: "Avocado toast & egg",
            description: "Sourdough, smashed avocado, poached egg and chili flakes.",
            price: 12,
            photo: "toast",
            kcal: 420,
            tags: ["popular", "veggie"],
          },
          {
            id: "overnight-oats",
            name: "Berry overnight oats",
            description: "Oats, berries, banana and almond butter.",
            price: 8.5,
            photo: "oats",
            kcal: 430,
            tags: ["veggie"],
          },
        ],
      },
      {
        id: "coffee",
        title: "Coffee",
        dishes: [
          { id: "flat-white", name: "Flat white", description: "Double ristretto, silky milk.", price: 4.5, kcal: 110, groups: coffeeGroups },
          { id: "iced-latte", name: "Iced latte", description: "Over plenty of ice.", price: 5, kcal: 150, groups: coffeeGroups },
        ],
      },
    ],
  },
  {
    id: "hana-sushi",
    name: "Hana Sushi",
    cuisine: "Sushi · Japanese",
    priceLevel: "$$$",
    rating: 4.9,
    ratingCount: "640",
    etaMin: 25,
    etaMax: 40,
    deliveryFee: 2.49,
    distance: "2.4 mi",
    cover: "sushi",
    mark: { letter: "H", bg: "#FFE4DA", fg: "#C8391B" },
    categories: ["sushi"],
    about: "Nigiri and rolls cut to order by a two-chef counter.",
    address: "5 Harbor Road",
    sections: [
      {
        id: "platters",
        title: "Platters",
        dishes: [
          {
            id: "chef-platter",
            name: "Chef's platter",
            description: "Today's nigiri, salmon and tuna maki, pickled ginger and wasabi.",
            price: 32,
            photo: "sushi",
            kcal: 780,
            tags: ["popular"],
            groups: [
              {
                id: "pieces",
                title: "Pieces",
                min: 1,
                max: 1,
                options: [
                  { id: "16", label: "16 pieces" },
                  { id: "24", label: "24 pieces", price: 14 },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "rolls",
        title: "Rolls",
        dishes: [
          { id: "salmon-roll", name: "Salmon avocado roll", description: "Eight pieces.", price: 9.5, kcal: 330 },
          { id: "spicy-tuna", name: "Spicy tuna roll", description: "Eight pieces, chili mayo.", price: 10.5, kcal: 360, tags: ["spicy"] },
          { id: "veggie-roll", name: "Cucumber avocado roll", description: "Eight pieces.", price: 8, kcal: 260, tags: ["veggie"] },
        ],
      },
      {
        id: "sides",
        title: "Sides",
        dishes: [
          { id: "miso-soup", name: "Miso soup", description: "Tofu, wakame and scallion.", price: 3.5, kcal: 80, tags: ["veggie"] },
        ],
      },
    ],
  },
];
