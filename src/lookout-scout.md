# Lookout Scout - Application Context

## Overview
Lookout Scout is a location scouting company website designed to showcase locations for film, photography, and other production purposes. Its goal is to present the company’s work, highlight locations, provide easy contact options, and answer frequently asked questions. The website serves as a landing page / brochure site with strong emphasis on visual content.

The current live site: [https://lookoutscout.ca](https://lookoutscout.ca)

---

## Current Structure

### **1. Home / Landing Section**
- Presents a clean, professional introduction to the company.
- Highlights the company’s focus on location scouting.
- Key visual elements include:
  - Hero imagery or banner.
  - Brief tagline or company description.
- Call-to-action buttons for:
  - Contact
  - Explore locations or portfolio

---

### **2. Works / Portfolio Section**
- Displays selected projects or locations previously scouted.
- Typically includes:
  - Images or short videos of locations.
  - Project titles.
  - Brief descriptions.
- “See Project” links may currently point to individual posts or blog entries (potential for video embedding directly).

---

### **3. About / Company Information**
- Provides context on who the company is.
- Explains mission, values, or unique selling propositions.
- Can include:
  - Team member highlights.
  - Experience in film or production industries.

---

### **4. FAQ Section**
- Addresses common questions from clients or prospective users.
- Topics may include:
  - How to book a scout.
  - Licensing or usage of locations.
  - Scheduling and availability.

---

### **5. Contact Section**
- Provides a form or contact information for inquiries.
- May include:
  - Email address
  - Phone number
  - Physical address or region served.
- Optional integration with scheduling or booking tools.

---

### **6. Footer**
- Links to:
  - Social media
  - Legal pages (if applicable)
  - Quick navigation links to main sections

---

## Technical Context

- Built with the **Mizar Astro template**.
- Uses **Astro + Markdoc** (`.mdoc` files) for content management.
- TailwindCSS is used for styling.
- Potential integrations include:
  - GSAP animations for interactive content.
  - Video embedding for portfolio/projects.
  - Sitemap and SEO enhancements.
- Designed to deploy on **Vercel**, using the Vercel adapter.
- Frontmatter in `.mdoc` files defines layout and metadata.
- Components are modular and can be reused across pages.

---

## Current Pain Points / Observations

1. **Sitemap and build errors** due to undefined site URL or adapter mismatch.
2. Editing `.mdoc` files can produce Astro build errors if syntax/frontmatter/components are not properly maintained.
3. Navigation:
   - Top toolbar does not include quick links to lower sections.
   - Could benefit from in-page anchors or structured navigation.
4. Portfolio/Works section:
   - “See Project” links could point directly to video content instead of blog pages.
5. Branding:
   - Currently may not fully reflect the desired black + red color scheme.
6. Vercel deployment:
   - Requires Vercel adapter and properly set site URL to build successfully.
7. `.mdoc` formatting:
   - Needs Prettier + Astro VS Code setup to avoid breaking builds.

---

## Suggestions for Improvement / Expansion

- **Visual Design**
  - Enhance hero section with animation or subtle GSAP transitions.
  - Apply black + red branding consistently across buttons, headers, and accents.
- **Portfolio / Works**
  - Embed video content directly in cards or modals.
  - Include project filters or categories (e.g., interior, exterior, urban, rural).
- **Navigation**
  - Add quick nav links in header for About, Works, FAQ, Contact.
  - Enable smooth scrolling to sections.
- **Content**
  - Expand About section with team highlights, testimonials, or experience.
  - Make FAQ comprehensive and structured.
- **Contact**
  - Use a clean, simple form that maps to email or CRM.
  - Optional: integrate Google Maps or service areas.
- **Technical**
  - Ensure `.mdoc` files have frontmatter and follow Astro + Markdoc syntax.
  - Configure Prettier / VS Code for safe formatting.
  - Keep sitemap integration functional with proper `siteUrl`.
  - Maintain modular Astro components for reusability.
- **SEO / Accessibility**
  - Optimize headings and alt text for images/videos.
  - Add proper metadata for social sharing.

---

## Summary

Lookout Scout is a professional, visually-driven landing site for location scouting services. Its core purpose is to showcase past work, convey company credibility, and provide easy ways for clients to contact the company.

Currently, the site is built on the Mizar Astro template, with content managed via `.mdoc` files, Tailwind styling, and Vercel hosting.

The main areas of improvement include:
- Streamlined `.mdoc` editing and formatting.
- Direct video embedding for the Works section.
- Enhanced navigation and branding.
- Minor technical setup for deployment and sitemap generation.

This context should provide Copilot with a **comprehensive understanding of the current application**, so future edits or enhancements can align with the company’s goals and design philosophy.

---

