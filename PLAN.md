# Church Create/Join Flow — Implementation Plan

## What We're Building
After signing up (or in Demo Mode), users who don't have a church should see a "Church Setup" screen where they can either **create a new church** (as a pastor/admin) or **join an existing one** (with an invite code). The Settings screen should let users view their church info and share the invite code.

## What Already Exists
- **API layer** (`supabaseApi.ts`): `createChurch()`, `joinChurchByCode()`, `getChurch()` already written
- **Database schema**: `churches` table with RLS policies
- **Store**: `church` state, `persistChurch()` in AsyncStorage
- **Settings screen**: Shows church name, member count, invite code (static display)

## Implementation Steps

### 1. Create `ChurchSetupScreen`
**File:** `src/screens/Church/ChurchSetupScreen.tsx`

Two-tab screen:
- **"Create Church" tab** — Name input + "Create" button → generates invite code → shows success with the code to share
- **"Join Church" tab** — Invite code input + "Join" button → looks up church → joins

Both paths update the user's profile with `church_id` and `church_name`, then navigate to the main app.

For Demo Mode (no Supabase): create/join stores the church locally in state + AsyncStorage.

### 2. Add store actions: `createChurch` and `joinChurch`
**File:** `src/services/store.ts`

Add to `AppActions`:
- `createChurch(name: string) → Promise<string | null>` — calls API, updates state with new church + sets user role to 'pastor'
- `joinChurch(inviteCode: string) → Promise<string | null>` — calls API, updates state with found church

Both persist to AsyncStorage and sync to Supabase (fire-and-forget for demo mode).

### 3. Update navigation to show `ChurchSetupScreen`
**File:** `src/navigation/AppNavigator.tsx`

After auth, if `user` exists but `church` is null → show `ChurchSetupScreen` instead of the main tab navigator.

Flow: Auth → (no church?) → ChurchSetupScreen → Main Tabs

### 4. Update Settings screen with church management
**File:** `src/screens/Settings/SettingsScreen.tsx`

- If user has a church: show church name, member count, invite code with a **copy** button, and a **"Leave Church"** option
- If user has no church: show a **"Join or Create a Church"** button that navigates to ChurchSetupScreen

### 5. Wire up demo mode church flow
When in demo mode (mock login), the user already has `mockChurch`. But if a new demo user creates/joins a church, it should work locally without hitting Supabase.

## Files Changed
| File | Change |
|------|--------|
| `src/screens/Church/ChurchSetupScreen.tsx` | **NEW** — Create/Join church screen |
| `src/services/store.ts` | Add `createChurch()`, `joinChurch()` actions |
| `src/navigation/AppNavigator.tsx` | Add church gate between auth and main tabs |
| `src/screens/Settings/SettingsScreen.tsx` | Add copy invite code, leave church, join/create button |
