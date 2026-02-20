import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { UserProfile, UserRole } from '../types';

GoogleSignin.configure({
  webClientId: '782405004129-ve2n6f9smu6811190cguk7u4s9p930fn.apps.googleusercontent.com',
});

const usersCollection = () => firestore().collection('users');

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  role: UserRole,
): Promise<void> {
  const { user } = await auth().createUserWithEmailAndPassword(email, password);
  await user.updateProfile({ displayName: name });

  const now = firestore.FieldValue.serverTimestamp();
  await usersCollection().doc(user.uid).set({
    displayName: name,
    email: user.email,
    role,
    createdAt: now,
    updatedAt: now,
    hasCompletedOnboarding: false,
    photoURL: null,
    bio: null,
    churchName: null,
    notificationTime: null,
    readingGoal: null,
    devotionalFrequency: null,
  });
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<void> {
  await auth().signInWithEmailAndPassword(email, password);
}

export async function signInWithGoogle(role?: UserRole): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!response.data?.idToken) {
    throw new Error('Google sign-in failed — no ID token returned.');
  }

  const credential = auth.GoogleAuthProvider.credential(response.data.idToken);
  const { user, additionalUserInfo } = await auth().signInWithCredential(credential);

  if (additionalUserInfo?.isNewUser) {
    const now = firestore.FieldValue.serverTimestamp();
    await usersCollection().doc(user.uid).set({
      displayName: user.displayName ?? 'Friend',
      email: user.email,
      role: role ?? 'reader',
      createdAt: now,
      updatedAt: now,
      hasCompletedOnboarding: false,
      photoURL: user.photoURL ?? null,
      bio: null,
      churchName: null,
      notificationTime: null,
      readingGoal: null,
      devotionalFrequency: null,
    });
  } else if (role) {
    // Existing user going through sign-up flow — check for role mismatch
    const doc = await usersCollection().doc(user.uid).get();
    if (doc.exists && doc.data()?.role !== role) {
      await auth().signOut();
      const existing = doc.data()?.role === 'reader' ? 'Reader' : 'Shepherd';
      throw Object.assign(
        new Error(`You already have an account as a ${existing}. Please sign in instead.`),
        { code: 'auth/account-exists-different-role' },
      );
    }
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const doc = await usersCollection().doc(uid).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    displayName: data.displayName,
    email: data.email,
    role: data.role,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
    photoURL: data.photoURL ?? null,
    bio: data.bio ?? null,
    churchName: data.churchName ?? null,
    notificationTime: data.notificationTime ?? null,
    readingGoal: data.readingGoal ?? null,
    devotionalFrequency: data.devotionalFrequency ?? null,
  } as UserProfile;
}

export async function completeOnboarding(uid: string): Promise<void> {
  await usersCollection().doc(uid).update({
    hasCompletedOnboarding: true,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function resetOnboarding(uid: string): Promise<void> {
  await usersCollection().doc(uid).update({
    hasCompletedOnboarding: false,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not signed in with Google — that's fine
  }
  await auth().signOut();
}
