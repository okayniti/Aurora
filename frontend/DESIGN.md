# Design System Specification: The Fluid Intelligence

## 1. Overview & Creative North Star
**Creative North Star: "The Celestial Observer"**

This design system rejects the rigidity of traditional dashboard layouts in favor of an atmospheric, immersive experience. We are not building a "tool"; we are crafting a digital entity that feels like "Intelligent glass floating in space." 

To break the "template" look, designers must embrace **Intentional Asymmetry**. Elements should not always align to a hard vertical axis. Instead, use the organic flow of "Aurora" gradients to pull the user’s eye across the canvas. High-contrast typography scales (pairing massive `display-lg` headings with whisper-quiet `label-sm` metadata) create an editorial depth that feels both premium and futuristic.

---

## 2. Colors & Atmospheric Depth

The palette is rooted in the void of deep space, punctuated by the vibrant energy of a digital nebula.

### The Palette (Material Design Convention)
*   **Background / Surface:** `#0a0e13` (The Void)
*   **Primary (Aurora Purple):** `#cc97ff` | **Primary Dim:** `#9c48ea`
*   **Secondary (Ethereal Teal):** `#3adffa` | **Secondary Container:** `#006877`
*   **Tertiary (Deep Blue):** `#9093ff`
*   **Neutral Surfaces:** 
    *   `surface-container-low`: `#0f1419`
    *   `surface-container-highest`: `#21262e`

### The "No-Line" Rule
**Explicit Prohibition:** Do not use 1px solid borders to define sections. 
In this system, boundaries are "felt," not "seen." Divide content areas using:
1.  **Tonal Shifts:** Place a `surface-container-high` card against the `background` to create a natural edge.
2.  **Negative Space:** Use the generous spacing scale (e.g., `spacing-12` or `spacing-16`) to let sections breathe.

### The Glass & Gradient Rule
All floating panels must utilize **Glassmorphism**. 
*   **Recipe:** Background color at 40-60% opacity + `backdrop-blur` (min 20px).
*   **Signature Textures:** Apply a linear gradient (Primary to Tertiary at 45°) with a 5% opacity overlay on large surfaces to give the "glass" a microscopic shimmer.

---

## 3. Typography: The Wide-Spaced Inter

We use **Inter** not as a standard sans-serif, but as a precision instrument.

*   **Letter Spacing:** Increase `letter-spacing` by 0.02em for all Body text and 0.05em for Labels to achieve a "breathable" high-end feel.
*   **Hierarchy as Identity:** 
    *   **Display (3.5rem):** Use for "hero" moments. It should feel like a statement, not just a title.
    *   **Headline (1.5rem - 2rem):** Use sparingly to announce new contexts.
    *   **Label (0.6875rem):** Use `on-surface-variant` (`#a8abb2`) for technical metadata, creating a sophisticated contrast against the vibrant primary accents.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "heavy" for a system based on light and glass. We use **Tonal Layering**.

*   **The Layering Principle:** Stacking determines importance.
    *   *Base:* `background` (`#0a0e13`)
    *   *Section:* `surface-container-low`
    *   *Interaction Element:* `surface-container-highest` or Glassmorphism.
*   **Ambient Shadows:** If an element must "float" (e.g., a modal), use a shadow color tinted with the `primary` token at 5% opacity. 
    *   *Value:* `0px 20px 40px rgba(204, 151, 255, 0.08)`.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline-variant` at 15% opacity. It should appear as a faint catch-light on the edge of a glass pane.

---

## 5. Components: Fluid Primitives

### Buttons
*   **Primary:** A fluid gradient transition from `primary` to `primary-dim`. **Roundedness: full**. No sharp corners.
*   **Tertiary (Ghost):** No background. Use `primary` text with a subtle `backdrop-blur` behind the hit area.

### Cards & Containers
*   **Forbid Dividers:** Never use a line to separate a card header from its body. Use a `surface-container` shift or `spacing-4`.
*   **Organic Shape:** Use `rounded-xl` (3rem) for large containers to mimic the "fluid" nature of intelligence.

### Input Fields
*   **Style:** Minimalist. A `surface-container-lowest` background with a `ghost-border` that glows (opacity increases to 60%) on focus.
*   **Helper Text:** Always use `label-sm` with increased letter spacing.

### Aurora Glow-Points (Custom Component)
*   A non-functional decorative component. Soft, 200px blurred circles of `secondary` or `tertiary` colors placed behind glass panels at 10% opacity to simulate light refracting through the UI.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** allow elements to overlap slightly. A glass card over a soft gradient creates the "Intelligent Glass" effect.
*   **Do** use asymmetrical margins. If the left margin is `spacing-16`, the right can be `spacing-10` for a more editorial, custom feel.
*   **Do** prioritize legibility. Glassmorphism must never compromise the contrast of `on-surface` text.

### Don’t:
*   **Don’t** use pure black (#000000) for backgrounds; use the specified deep navy-grey `background` token to maintain depth.
*   **Don’t** use "hard" animation. All transitions should use a `cubic-bezier(0.2, 0.8, 0.2, 1)` easing to feel "fluid" and "adaptive."
*   **Don’t** use icons with sharp 90-degree caps. Use rounded icon sets to match the `rounded-lg` scale.

---

## 7. Spacing & Rhythm
Rhythm is achieved through the **Spacing Scale**. Avoid odd-numbered pixel values. Use the scale to create "groupings" of intelligence:
*   **Related elements:** `spacing-2` (0.7rem)
*   **Unrelated sections:** `spacing-16` (5.5rem)

*Note: This system is a living organism. When in doubt, ask: "Does this feel like it’s floating, or is it pinned down?" If it feels pinned, add blur, remove borders, and increase roundedness.*