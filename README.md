# Lookout Scout

<a href="https://astro.build/">![Astro](.github/images/astro-icon.png)</a>
<a href="https://tailwindcss.com/">![Tailwind](.github/images/tailwind-icon.png)</a>
<a href="https://alpinejs.dev/">![Alpine js](.github/images/alpine-icon.png)</a>

A professional location scouting company website built with [Astro](https://astro.build), [Tailwind](https://tailwindcss.com/), and [AlpineJS](https://alpinejs.dev/).

### [🌐 Live Site →](https://lookoutscout.ca)

---

## About the Project

Lookout Scout is a location scouting company website designed to showcase locations for film, photography, and production purposes. The site serves as a professional landing page with a strong emphasis on visual content and easy client contact.

## 🏗️ Project Structure

```
├── src/
│   ├── assets/          # Images and media assets
│   ├── components/      # Reusable Astro components
│   ├── content/         # Content collections (works, posts, authors)
│   ├── layouts/         # Page layouts
│   ├── pages/           # Page routes
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
├── public/              # Static assets
└── astro.config.ts      # Astro configuration
```

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   bun run dev
   ```

3. Build for production:
   ```bash
   bun run build
   ```

## ✨ Features

- **Works Portfolio** - Showcase scouted locations and completed projects
- **About Section** - Company information and team highlights
- **FAQ Section** - Common questions about location scouting services
- **Contact Form** - Easy client inquiry system
- **Multilingual Support** - English and French localization
- **Content Management** - Keystatic CMS for easy content editing
- **PWA Support** - Progressive Web App capabilities
- **SEO Optimized** - Proper metadata and social sharing support
- **Responsive Design** - Mobile-friendly interface

## 📝 Content Management

Content is managed through:
- **Markdoc (`.mdoc`)** files for structured content
- **Keystatic CMS** - Access the admin dashboard at `/keystatic`
- JSON configuration files in `src/content/global/`

### Content Types
- **Works** - Portfolio projects and locations
- **Posts** - Blog articles and updates
- **Authors** - Team member profiles
- **Pages** - Core site pages (About, Contact, FAQ)

## 🎨 Tech Stack

- **Framework:** Astro 4.x
- **Styling:** TailwindCSS
- **Animations:** GSAP
- **CMS:** Keystatic
- **Deployment:** Vercel
- **Package Manager:** Bun

## 🛠️ Development Notes

- Use `.mdoc` files for content pages with proper frontmatter
- Follow Markdoc syntax for component integration
- Configure Prettier with Astro plugin for safe formatting
- Ensure Vercel adapter is configured for deployment
- Maintain modular component structure for reusability

## 📦 Deployment

The site is configured for deployment on Vercel. Make sure the Vercel adapter is properly set up in `astro.config.ts` and the site URL is configured.

