# Life Devo

A mobile-first platform for churches to deliver daily devotionals and for believers to engage with Scripture through journaling, prayer, and community.

## Tech Stack

- **React Native** (Expo) - Cross-platform iOS/Android
- **TypeScript** - Type-safe development
- **React Navigation** - Tab + stack navigation
- **Expo Vector Icons** - Ionicons for UI

## Getting Started

```bash
npm install
npx expo start
```

## Project Structure

```
src/
  types/          # TypeScript interfaces (Church, User, Devotional, etc.)
  theme/          # Colors, typography, spacing, shadows
  services/       # State management, mock data
  components/     # Reusable UI components (Card, Button, StreakBadge, etc.)
  navigation/     # App navigator with auth flow + tab navigation
  screens/
    Auth/         # Welcome, Sign In, Sign Up
    Today/        # Daily devotional reader with guided flow
    Archive/      # Past devotionals list + detail view
    Community/    # Shared reflections + prayer wall
    MyJourney/    # Streaks, journal history, prayer log
    Settings/     # Profile, church, notifications, privacy
```

## Features

- Daily devotional reader with step-by-step flow (Scripture, Reflection, Journal, Prayer, Share)
- Inline journaling with guided questions
- Prayer journal with answered prayer tracking
- Community sharing with positive-only reactions
- Streak tracking with milestone celebrations
- Church invite code system
- Push notification preferences
