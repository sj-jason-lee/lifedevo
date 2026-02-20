import firestore from '@react-native-firebase/firestore';

const usersCollection = () => firestore().collection('users');

export async function updateShepherdProfile(
  uid: string,
  data: { displayName: string; bio: string; churchName: string },
): Promise<void> {
  await usersCollection().doc(uid).update({
    displayName: data.displayName,
    bio: data.bio,
    churchName: data.churchName,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function updateReaderPreferences(
  uid: string,
  data: {
    notificationTime: string | null;
    readingGoal: 'daily' | 'weekly' | null;
    devotionalFrequency: 'every_day' | 'weekdays' | 'custom' | null;
  },
): Promise<void> {
  await usersCollection().doc(uid).update({
    notificationTime: data.notificationTime,
    readingGoal: data.readingGoal,
    devotionalFrequency: data.devotionalFrequency,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}
