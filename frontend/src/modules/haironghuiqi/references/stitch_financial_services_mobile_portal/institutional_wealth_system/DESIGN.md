---
name: Institutional Wealth System
colors:
  surface: '#f7fafd'
  surface-dim: '#d7dadd'
  surface-bright: '#f7fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f7'
  surface-container: '#ebeef1'
  surface-container-high: '#e5e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#181c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f4'
  outline: '#747782'
  outline-variant: '#c4c6d2'
  surface-tint: '#3d5ca2'
  primary: '#001a48'
  on-primary: '#ffffff'
  primary-container: '#002d72'
  on-primary-container: '#7a97e2'
  inverse-primary: '#b1c5ff'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#002121'
  on-tertiary: '#ffffff'
  tertiary-container: '#003838'
  on-tertiary-container: '#55a6a6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#224489'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#9ff1f0'
  tertiary-fixed-dim: '#83d4d3'
  on-tertiary-fixed: '#002020'
  on-tertiary-fixed-variant: '#004f4f'
  background: '#f7fafd'
  on-background: '#181c1e'
  surface-variant: '#e0e3e6'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 16px
  gutter-mobile: 12px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
  section-padding: 32px
---

## Brand & Style

The design system is engineered to project absolute stability, precision, and legacy. It targets a sophisticated audience that demands clarity and security in their financial dealings. The aesthetic is rooted in **Corporate Modernism**, blending the traditional authority of high-finance institutions with the fluid accessibility of contemporary digital interfaces.

To differentiate from typical "fintech" visuals, this design system employs a refined layering strategy. It utilizes a **Glassmorphic** approach specifically for high-level dashboard overviews—using backdrop blurs over premium photographic textures—while maintaining strict, high-contrast **Minimalism** for transactional and data-heavy environments. The emotional response should be one of "effortless control": the user feels their assets are protected by a robust, well-structured entity.

## Colors

The palette is anchored by **Deep Navy (#002D72)**, a color synonymous with global banking and institutional trust. This is used for primary actions, navigation, and structural headers. **Financial Gold (#D4AF37)** is reserved strictly for premium tiering, high-value CTAs, and success states to evoke a sense of prosperity and exclusivity.

A **Subtle Teal (#006B6B)** serves as the tertiary color, primarily used for "positive growth" indicators and interactive data points, providing a more modern alternative to standard green. Backgrounds utilize a cool-toned neutral spectrum to reduce eye strain during long sessions of data review.

- **Primary:** Core branding and high-importance UI elements.
- **Secondary:** Premium accents and "Gold Standard" features.
- **Tertiary:** Growth metrics and interactive data visualization.
- **Surface:** Off-white/Light-gray to define content containers against the page background.

## Typography

This design system uses **Inter** exclusively to achieve a systematic, utilitarian aesthetic that remains highly readable at small sizes. The typographic scale is optimized for high-density financial data, prioritizing vertical rhythm and clear distinction between "Reading" and "Scanning" content.

Headlines use tighter letter spacing and heavier weights to project confidence. Body copy is set with generous line-height to ensure complex financial terms and numbers are easily digestible. Numeric data should, where possible, utilize tabular figures to ensure alignment in columns and tables.

## Layout & Spacing

The layout follows a **Strict 8px Grid System**. This ensures mathematical harmony across all components. For mobile, a 4-column fluid grid is used with 16px outer margins.

- **Grouping:** Use the `stack-md` (12px) for related items within a card.
- **Separation:** Use `stack-lg` (24px) to separate distinct content blocks or modules.
- **Density:** Financial tables and lists can opt for a condensed 4px spacing (`stack-sm`) to maximize data visibility without sacrificing touch targets (minimum 44px).

## Elevation & Depth

Visual hierarchy in the design system is achieved through **Tonal Layers** and **Ambient Shadows**. 

1.  **Level 0 (Background):** Neutral surface (#F4F7FA).
2.  **Level 1 (Cards/Containers):** Pure White (#FFFFFF) with a very soft, diffused shadow (0px 4px 12px, 5% opacity Navy).
3.  **Level 2 (Overlays/Modals):** Pure White with a 10% opacity shadow and a 1px border (#E1E8F0).
4.  **Premium Level (Hero):** Backdrop blur (20px) over image-based backgrounds with a 15% opacity white border to simulate "Safe Glass."

Avoid heavy shadows or neomorphism; depth should feel professional and structural, not decorative.

## Shapes

The design system utilizes **Rounded (0.5rem)** corners as the standard. This strikes a balance between the "friendliness" of fully rounded shapes and the "seriousness" of sharp geometric edges.

- **Buttons & Inputs:** 8px (0.5rem) radius.
- **Cards & Modals:** 16px (1rem) radius for a softer, more modern container feel.
- **Selection Indicators:** Pill-shaped (fully rounded) only for small status chips or toggles.

## Components

### Buttons
- **Primary:** Deep Navy background, White text. High-contrast, no shadow.
- **Secondary:** Ghost style with 1.5px Navy border or Gold background for "Premium" features.
- **Tertiary:** Text-only with 600 weight, used for low-priority actions like "Cancel" or "View All."

### Cards
All cards must have a white background and a subtle border (#E1E8F0). In the dashboard, the "Primary Balance Card" may use a Deep Navy gradient or the Glassmorphic treatment to denote importance.

### Input Fields
Inputs use a "Structured" look: a 1px border that thickens to 2px Navy on focus. Labels are always visible above the field in `label-md` style. Error states use a high-visibility Crimson (#D32F2F) with 12px icon indicators.

### Lists & Data
Transaction lists use a clean horizontal divider (1px, #EDF2F7). Amounts are right-aligned. Use the Tertiary Teal for positive cash flow and a neutral Slate for expenditures, avoiding red unless the account is in a "Danger" state (overdraft).

### Chips & Badges
Small, softly rounded containers used for "Transaction Category" or "Account Status." These use low-saturation background tints of the primary/secondary colors to remain unobtrusive.