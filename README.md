# Movieticketbookingsystem

Build a complete, polished, responsive Movie Ticket Booking Website called CineBook in this project. Complete the implementation in one pass. Do not ask questions, generate alternative designs, or stop at a plan.

### DESIGN
Create a premium cinema-style UI with:
- Dark charcoal/black background with elegant orange accents.
- Modern typography, clean spacing, rounded movie cards, subtle hover effects.
- Responsive desktop and mobile layouts.
- Attractive movie posters using existing or publicly accessible image URLs; use CSS placeholders if images fail.
- A professional navigation bar, hero banner, and organized content sections.

### FEATURES
Implement these core features with functional interactions:

1. **Home page:** Featured movie, now-showing and coming-soon movies, search, genre filters, movie ratings and booking buttons.

2. **Movie details:** Poster, synopsis, genre, duration, rating, available dates, cinema locations and selectable showtimes.

3. **Seat selection:** Interactive cinema seating layout with screen indicator, available/booked/selected seats, standard and premium seat prices, and automatic total-price calculation. Prevent selecting seats marked as booked.

4. **Booking confirmation:** Collect customer name and email, show an order summary, confirm the booking and generate a unique booking reference. Use a clearly labelled simulated payment flow. Do not collect real payment details.

5. **My bookings:** Save bookings, display tickets and allow users to retrieve their own demo bookings using their email address.

6. **Admin dashboard:** Add, edit and delete movies, manage demo showtimes, and view bookings. Include basic form validation and confirmation dialogs.

### TECHNICAL REQUIREMENTS
- Use the project's existing technology stack. If starting fresh, use React, TypeScript and Tailwind CSS.
- Use localStorage for demo movie changes and booking persistence. Keep the implementation simple and avoid unnecessary dependencies.
- Include realistic sample movies and showtimes.
- Ensure buttons, forms, search, filters, navigation, seat selection and booking confirmation work.
- Validate inputs, handle errors and prevent duplicate seat selections or bookings in the demo.
- Use reusable components and clean, maintainable code.
- Do not add a database, Supabase, paid integrations, real payment gateways, AI features or external authentication in this version.
- Do not generate images or install unnecessary packages.
- Do not rewrite existing working files unless required.

### FINAL CHECK
Implement the complete website rather than only describing it. Check all routes and interactions, fix obvious errors, and keep the design consistent.

Prioritize a visually impressive, fully navigable college-project demo that works without API keys or additional service setup. Do not add features beyond this scope. Finish with a brief summary of the implemented features and any limitations.

Important: Seat locking and admin controls in this localStorage version are for demonstration only, not production security or multi-user booking protection.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://movieticketbookingsystem.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/06faa343-c7db-477e-9505-90d03c828bcc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
