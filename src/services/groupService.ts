import firestore from '@react-native-firebase/firestore';
import type { Group } from '../types';

const groupsCollection = () => firestore().collection('groups');
const membershipsCollection = () => firestore().collection('memberships');

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

export function generateInviteCode(): string {
  let code = 'FLOCK-';
  for (let i = 0; i < 4; i++) {
    code += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
  }
  return code;
}

export async function createGroup(
  shepherdId: string,
  name: string,
  description: string,
): Promise<{ groupId: string; inviteCode: string }> {
  const inviteCode = generateInviteCode();
  const now = firestore.FieldValue.serverTimestamp();

  const groupRef = await groupsCollection().add({
    name,
    description,
    imageURL: null,
    shepherdId,
    inviteCode,
    memberCount: 1,
    createdAt: now,
    updatedAt: now,
  });

  await membershipsCollection().add({
    groupId: groupRef.id,
    userId: shepherdId,
    role: 'shepherd',
    joinedAt: now,
  });

  return { groupId: groupRef.id, inviteCode };
}

export async function joinGroupByCode(
  userId: string,
  inviteCode: string,
): Promise<Group> {
  const snapshot = await groupsCollection()
    .where('inviteCode', '==', inviteCode.toUpperCase().trim())
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error('No group found with that invite code.');
  }

  const groupDoc = snapshot.docs[0];
  const groupData = groupDoc.data();

  // Check if already a member
  const existing = await membershipsCollection()
    .where('groupId', '==', groupDoc.id)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw new Error("You're already a member of this group.");
  }

  const now = firestore.FieldValue.serverTimestamp();

  await membershipsCollection().add({
    groupId: groupDoc.id,
    userId,
    role: 'reader',
    joinedAt: now,
  });

  await groupsCollection().doc(groupDoc.id).update({
    memberCount: firestore.FieldValue.increment(1),
    updatedAt: now,
  });

  return {
    id: groupDoc.id,
    name: groupData.name,
    description: groupData.description,
    imageURL: groupData.imageURL ?? null,
    shepherdId: groupData.shepherdId,
    inviteCode: groupData.inviteCode,
    memberCount: (groupData.memberCount ?? 0) + 1,
    createdAt: groupData.createdAt?.toDate() ?? new Date(),
    updatedAt: new Date(),
  };
}
