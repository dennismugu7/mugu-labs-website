# Product content pack — Bookflow & ODA

For Claude Code. Save this file as `docs/content/product-content-pack.md` in the repo.
Screens go in `public/assets/bookflow/` and `public/assets/oda/` (WebP, 720px wide).

Both apps are **in development**. Copy is written as "what we're building", so nothing promises a shipped feature.

---

## Bookflow

**Brand:** purple gradient `#9D38EE → #4C1BB2`, mint `#E3FDFC`. Button: use `#4C1BB2` with white text (check AA contrast).
**Status:** In development
**Primary CTA:** Become an early tester → ContactChoice, prefill: "Hi Mugu Labs, I'd like to become an early tester for Bookflow."
**Secondary CTA:** See the other apps

**Tagline (keep):** Your salon's full calendar, running on autopilot

**Intro:**
Bookflow is a booking app for salons, barbers and beauty studios. Share one link, let clients book themselves, and run the whole day from your phone, deposits, changes and all.

**What we're building**

1. **Your day at a glance**: Open the app and see today's bookings, what you expect to take home, and the free gaps you could still fill. Unpaid deposits get flagged before they cost you a slot.
2. **Deposits that protect your time**: Clients pay a small M-Pesa deposit to hold their slot. If someone doesn't show, you decide: keep the deposit or refund it in a tap.
3. **Changes without the chaos**: Reschedule, move a booking to another stylist, add a service or adjust the price. The client gets an SMS with the new details, so nobody is left guessing.
4. **The whole team, side by side**: A day view with every stylist's bookings in their own column, including who's off and when.
5. **A client list that builds itself**: Everyone who books, whether online, by phone or walk-in, lands in your client list with their visit history. Regulars who've gone quiet are easy to spot.
6. **One link, anywhere**: Put your booking link on WhatsApp or Instagram and appointments land in your calendar automatically.

**Small print under features:** Bookflow is still being built with real salons. Features may change before launch.

**Caption above the screens:** Early designs, still in progress. Shop names and links are examples. (Muted, like the small print.)

**Screens (in order) + alt text**

| File | Alt text |
|---|---|
| bookflow-today.webp | Bookflow's Today screen showing 8 bookings, 23k expected and 3 gaps, with an unpaid-deposit reminder |
| bookflow-booking-detail.webp | A booking with services, an M-Pesa deposit paid and the balance due on the day |
| bookflow-reschedule.webp | Rescheduling a booking to a new time slot, with an SMS sent to the client |
| bookflow-calendar.webp | Team day view with each stylist's bookings side by side |
| bookflow-clients.webp | Client list filtered into new, regular and lapsed clients |
| bookflow-client-profile.webp | A client profile showing visits, total spent and visit history |

**Do not use:** the Bookflow *web* screens. They contain photos of real people and a real business (Greek names, Peristeri map) from a reference design. Also avoid native screens that show a personal Gmail address (e.g. 4, 32, 34).

---

## ODA

**Brand:** tomato `#D94B26` (pressed `#BE3F1F`), leaf `#23795A`, ink `#1E1A33`. Button: tomato with white text. White on `#D94B26` may fall just under 4.5:1; if so use `#BE3F1F`.
**Status:** In development
**Primary CTA:** Become an early tester → ContactChoice, prefill: "Hi Mugu Labs, I'd like to become an early tester for ODA."
**Secondary CTA:** See the other apps

**Tagline (keep):** Sleek e-commerce checkout, same personal WhatsApp touch

**Intro:**
ODA gives people who sell on WhatsApp, TikTok and Instagram a shop link of their own. Buyers browse, order and pay with M-Pesa in a few taps, then follow their order all the way to their door. No more chasing screenshots in the chat.

**What we're building**

1. **Your own shop link**: Products, colours, sizes and prices on one page, with search and filters. Put it in your TikTok bio or Instagram profile; buyers don't need an app.
2. **Checkout in a few taps**: Name, phone number, delivery address. No account needed.
3. **Pay with M-Pesa**: The payment prompt lands on the buyer's phone, and the order page updates by itself once it's paid.
4. **Updates on WhatsApp**: Buyers hear from you on WhatsApp when their order is confirmed and on its way.
5. **Live delivery tracking**: Buyers see their order on the way, and a delivery code makes sure it reaches the right person.
6. **Ratings that mean something**: Only buyers who received their order can rate it, so your rating reflects real deliveries.

**Pricing line:** none. Pricing is unconfirmed; nothing about price or fees goes on the site until Dennis confirms it, and that includes calling anything "free" (the e2e pricing guard checks the ODA page for it). The one exception is the cart screen's alt text, "free-delivery", which describes the seller's own delivery offer in the app, not ODA's pricing.

**Not to claim:** no "Payment details checked" or other badges, nothing "checked" or "verified", no "ODA never holds your money", no Till/Pochi/Paybill (an e2e test checks the ODA page).

**Small print under features:** ODA is still being built with real sellers. Features may change before launch.

**Caption above the screens:** Early designs, still in progress. Shop names and links are examples. (Muted, like the small print.)

**Screens (in order) + alt text**

One row, no group labels.

| File | Alt text |
|---|---|
| oda-buyer-shop.webp | A seller's ODA shop page with products, ratings and delivery count |
| oda-buyer-search.webp | Searching a shop with size and price filters |
| oda-buyer-cart.webp | A buyer's cart with a free-delivery progress bar |
| oda-buyer-checkout.webp | Checkout asking only for name, phone number and delivery address |
| oda-buyer-confirmation.webp | Order placed, with the next steps explained |
| oda-buyer-tracking.webp | Live delivery tracking with the rider's details and a delivery code |
| oda-buyer-delivered.webp | Delivered order with a prompt to rate it |
