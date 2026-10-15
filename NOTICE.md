# Notice

Spoonlet is based on the [Crave.js Expo Storefront template](https://github.com/craveup-oss/cravejs-expo-template)
(`cravejs-expo-template`) by Crave Up, Inc., released under the MIT License. Parts of its project scaffold come
from the Expo project template by 650 Industries, Inc. (MIT). The original license text is kept in
[LICENSE-UPSTREAM](LICENSE-UPSTREAM).

## What changed

The upstream template is a single-restaurant ordering app wired to the Crave Storefront API. Spoonlet keeps its
flows and screens (welcome onboarding and location, menu browsing with categories and search, item detail with
required and optional modifier groups, the bag with quantity, remove and clear confirmations, delivery timing and
scheduling, checkout review, order and delivery status, order history, account, favourites and rewards) and
rebuilds every screen as a multi-restaurant delivery app with a new design:

- All Crave SDK and API calls, hosted checkout, secure-store sessions, OTP sign-in, environment configuration and
  map keys were removed. Restaurants, menus, prices, fees, promo codes and past orders are local sample data in
  `constants/content.ts` and `data/`. The bag, orders, address and favourites are saved with AsyncStorage.
- Checkout is a demo: no payment is taken. Order tracking is simulated on the device.
- The store-location map became an order-tracking map: a live map with react-native-maps on iPhone and Android, and
  a drawn map on the web.
- New brand (Spoonlet), palette, typography, icons, motion, app icon and splash.
- Upstream tests, scripts, release tooling, CI, docs, placeholder brand assets and the Maple & Main demo photos were
  removed.

## Fonts

- Bricolage Grotesque by Mathieu Triay, SIL Open Font License 1.1 (via `@expo-google-fonts/bricolage-grotesque`).
- Figtree by Erik Kennedy, SIL Open Font License 1.1 (via `@expo-google-fonts/figtree`).

## Icons

Icon shapes in `components/ui/icons.ts` come from [Lucide](https://lucide.dev), ISC License:

```
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other
copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby
granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
```

## Images

Images in `assets/food` and `assets/people`: AI-generated for GenVibe. The app icon, splash and the drawn map are
original artwork made for this template.

## Fictional content

Spoonlet, its restaurants, people, addresses, ratings, prices, promo codes, quotes and numbers are fictional.
Phone numbers use 555 and emails use `.example`. The demo card is not a real payment method.

Dependencies keep their own licenses.
