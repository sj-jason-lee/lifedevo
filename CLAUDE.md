# CLAUDE.md

## Project Overview

**Pasture** — A Bible devotional mobile app built with React Native and Expo. Provides daily Bible readings, devotionals, and reflections to support users' spiritual growth. The app should feel like a premium digital instrument — every gesture intentional, every animation weighted and professional.|

two types of users. the reader and the person posting the devotionals.

## Tech Stack

- **Framework**: React Native with Expo (managed workflow, SDK 52+)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Styling**: StyleSheet API (or NativeWind if added later)
- **State Management**: React Context / Zustand (TBD)
- **Storage**: AsyncStorage for local persistence
- **Animation**: `react-native-reanimated` v3 — use `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSpring`, `withRepeat`, `interpolate`, `useAnimatedScrollHandler`
- **SVG**: `react-native-svg` for vector graphics, waveforms, decorative elements
- **Icons**: `@expo/vector-icons` (Feather, Ionicons) or `lucide-react-native`
- **Fonts**: `expo-font` + `@expo-google-fonts/*`
- **Images**: `expo-image` for performant caching
- **Gradients**: `expo-linear-gradient`
- **Blur**: `expo-blur` for frosted glass effects
- **Safe Areas**: `react-native-safe-area-context` — always use `useSafeAreaInsets()`
- **Haptics**: `expo-haptics` — trigger `ImpactFeedbackStyle.Light` on button presses

## Project Structure

```
├── app/                      # Expo Router screens (file-based routing)
│   ├── (tabs)/               # Tab navigator screens
│   ├── _layout.tsx           # Root layout
│   └── index.tsx             # Entry screen
├── components/               # Reusable UI components
│   ├── ui/                   # Atomic design primitives (buttons, cards, badges)
│   └── sections/             # Larger composed sections (hero, feature cards, etc.)
├── constants/                # App constants
│   ├── colors.ts             # Palette tokens from active design preset
│   ├── typography.ts         # Font families, sizes, line heights, tracking
│   └── config.ts             # General app config
├── hooks/                    # Custom React hooks
│   └── useScrollAnimation.ts # Shared scroll-linked animation logic
├── lib/                      # Utilities, API clients, helpers
├── assets/                   # Images, fonts, static files
├── types/                    # Shared TypeScript type definitions
└── CLAUDE.md
```

## Commands

```bash
npx expo start            # Start dev server
npx expo start --clear    # Start with cache cleared
npx expo run:android      # Run on Android
npx expo run:ios          # Run on iOS
npx expo install <pkg>    # Install Expo-compatible package
npx expo lint             # Lint the project
```

## Code Conventions

- Use functional components with hooks (no class components)
- Use TypeScript strict mode — always type props, state, and function returns
- File naming: PascalCase for components (`DevotionalCard.tsx`), camelCase for utils (`formatDate.ts`)
- Keep components small and focused — extract reusable pieces into `components/`
- Co-locate component-specific types in the same file; shared types go in `types/`
- Use `const` by default; avoid `let` unless mutation is needed
- Prefer named exports over default exports
- All animated values managed through `useSharedValue` — never use React state for animation-driving values
- Use `useAnimatedStyle` for all style interpolations — never set animated styles directly
- Wrap animated components properly (`Animated.View`, `Animated.ScrollView`, `Animated.Image`)
- Clean up all intervals/timeouts in `useEffect` return functions
- Respect safe areas on all screens (notch, home indicator, status bar)

## Git Workflow

- **Main branch**: `main`
- **Current dev branch**: `v3`
- Write concise commit messages describing the "why"
- Do not push unless explicitly asked

---

## Design System

The visual language below applies to all screens and components. The goal is a premium, tactile, cinematic feel — not generic mobile UI.

### Gathering Requirements for New Screens

When building a new screen or major feature, collect these before starting:

1. **Purpose and one-line description** — What does this screen do?
2. **Aesthetic direction** — Which preset (A–D) or custom direction?
3. **Key content blocks** — What are the 2–4 main content areas?
4. **Primary action** — What should the user do on this screen?

### Aesthetic Presets

Each preset defines: `palette`, `typography`, `identity`, and `imageMood`. Export the active preset's tokens from `constants/colors.ts` and `constants/typography.ts`.

#### Preset A — "Organic Tech" (Clinical Boutique)

- **Identity:** A bridge between a biological research lab and an avant-garde luxury magazine.
- **Palette:** Moss `#2E4036` (Primary), Clay `#CC5833` (Accent), Cream `#F2F0E9` (Background), Charcoal `#1A1A1A` (Text/Dark)
- **Typography:** Headings: Plus Jakarta Sans (tight tracking). Drama: Cormorant Garamond Italic. Data: IBM Plex Mono.
- **Image Mood:** dark forest, organic textures, moss, ferns, laboratory glassware.

#### Preset B — "Midnight Luxe" (Dark Editorial)

- **Identity:** A private members' club meets a high-end watchmaker's atelier.
- **Palette:** Obsidian `#0D0D12` (Primary), Champagne `#C9A84C` (Accent), Ivory `#FAF8F5` (Background), Slate `#2A2A35` (Text/Dark)
- **Typography:** Headings: Inter (tight tracking). Drama: Playfair Display Italic. Data: JetBrains Mono.
- **Image Mood:** dark marble, gold accents, architectural shadows, luxury interiors.

#### Preset C — "Brutalist Signal" (Raw Precision)

- **Identity:** A control room for the future — no decoration, pure information density.
- **Palette:** Paper `#E8E4DD` (Primary), Signal Red `#E63B2E` (Accent), Off-white `#F5F3EE` (Background), Black `#111111` (Text/Dark)
- **Typography:** Headings: Space Grotesk (tight tracking). Drama: DM Serif Display Italic. Data: Space Mono.
- **Image Mood:** concrete, brutalist architecture, raw materials, industrial.

#### Preset D — "Vapor Clinic" (Neon Biotech)

- **Identity:** A genome sequencing lab inside a Tokyo nightclub.
- **Palette:** Deep Void `#0A0A14` (Primary), Plasma `#7B61FF` (Accent), Ghost `#F0EFF4` (Background), Graphite `#18181B` (Text/Dark)
- **Typography:** Headings: Sora (tight tracking). Drama: Instrument Serif Italic. Data: Fira Code.
- **Image Mood:** bioluminescence, dark water, neon reflections, microscopy.

### Visual Texture

- Implement a global noise overlay using an `<Svg>` component with `<feTurbulence>` at **0.04–0.06 opacity**, absolutely positioned full-screen with `pointerEvents: 'none'`.
- Use `borderRadius: 24` to `borderRadius: 32` for all card containers. No sharp corners.
- Generous padding: minimum `padding: 20` on screen edges, `padding: 24` inside cards.

### Micro-Interactions

- All pressable elements use `Animated` scale feedback: press-in to `0.97`, release springs back to `1.0` with `{ damping: 15, stiffness: 150 }`.
- Use `react-native-reanimated` for gesture-driven animations and shared element transitions.
- Accent-colored elements get a subtle pulsing glow (looping opacity animation on a blurred shadow layer).
- Trigger `expo-haptics` `ImpactFeedbackStyle.Light` on meaningful presses.

### Animation Patterns

- **Entrances:** Fade-up (`translateY: 30 → 0`, `opacity: 0 → 1`) with `withTiming` 600ms, `Easing.out(Easing.cubic)`.
- **Staggers:** Delay each element by `index * 100ms` for text, `index * 150ms` for cards.
- **Springs:** `withSpring({ damping: 12, stiffness: 100 })` for interactive feedback.
- **Scroll-linked:** `useAnimatedScrollHandler` + `interpolate` for parallax and header morphing.

### Typography Scale

| Token           | Size  | Line Height     | Notes                         |
| --------------- | ----- | --------------- | ----------------------------- |
| Hero dramatic   | 48–56 | 1.05 × fontSize | Drama serif italic font       |
| Hero sans       | 16–18 | —               | Uppercase, letterSpacing: 3–5 |
| Section heading | 32–40 | 1.1 × fontSize  | Heading font                  |
| Body            | 16    | 26              | Default readable text         |
| Mono/data label | 12–13 | —               | letterSpacing: 1.5, monospace |

---

## Interactive Component Patterns

When building feature showcase cards or interactive content blocks, use these proven patterns:

### "Diagnostic Shuffler"

Stack of 3 overlapping mini-cards that cycle every 3 seconds. Each slides up and out with `withSpring` while the next enters from below. Reorders using `array.unshift(array.pop())` logic.

### "Telemetry Typewriter"

Monospace live-text feed typing messages character-by-character (40ms/char) with a blinking accent-colored cursor (500ms opacity toggle). Includes a "Live" badge with pulsing dot.

### "Protocol Scheduler"

Weekly grid (S M T W T F S) where cells highlight in sequence with scale bumps and accent color fills, simulating auto-scheduling. "Confirmed" label fades in after sequence. Auto-replays every 6 seconds.

### "Stacking Cards"

Absolutely positioned cards that reveal on scroll. Front card scales to `0.92` and fades to `0.5` as next card slides up. Use `useAnimatedScrollHandler` + `interpolate`.

### Looping SVG Animations

- Rotating geometric motifs via `withRepeat` + `withTiming` on rotation.
- Horizontal scan line across a dot grid with animated `translateX`.
- EKG-style waveform with animated `strokeDashoffset` on an `<Svg><Path>`.

---

## Guidelines for Claude

- Always read existing files before modifying them
- Match the existing code style and patterns in the project
- Prefer editing existing files over creating new ones
- Keep changes minimal and focused on the task at hand
- Do not add unnecessary dependencies — check if Expo SDK already provides what's needed
- When creating new screens, follow Expo Router file-based routing conventions
- Test that imports resolve correctly (no circular dependencies)
- When building new UI, reference the active design preset tokens from `constants/`
- Every animation must be fully implemented — no TODO stubs or placeholder animations
- Every pressable element needs haptic + scale feedback
- Always respect safe areas and test sizing mentally against iPhone SE and iPhone 15 Pro Max
