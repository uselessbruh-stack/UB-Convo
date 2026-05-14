import {
  collection, doc, setDoc, getDoc, updateDoc, deleteDoc,
  query, where, getDocs, serverTimestamp, onSnapshot, orderBy, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function createDirectChat(user1, user2) {
  // Check if a direct chat already exists
  const q = query(
    collection(db, 'chats'),
    where('type', '==', 'direct'),
    where('members', 'array-contains', user1.id)
  );

  const snap = await getDocs(q);
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.members.includes(user2.id)) {
      return docSnap.id; // Return existing chat
    }
  }

  // Create new chat
  const chatRef = doc(collection(db, 'chats'));
  const chatData = {
    type: 'direct',
    members: [user1.id, user2.id],
    memberDetails: {
      [user1.id]: {
        name: user1.name || '',
        username: user1.username || '',
        profilePicUrl: user1.profilePicUrl || null,
      },
      [user2.id]: {
        name: user2.name || '',
        username: user2.username || '',
        profilePicUrl: user2.profilePicUrl || null,
      },
    },
    createdAt: serverTimestamp(),
    createdBy: user1.id,
    lastMessage: null,
    updatedAt: serverTimestamp(),
  };

  await setDoc(chatRef, chatData);
  return chatRef.id;
}

export async function createGroupChat(creator, memberUsers, groupName, groupDescription = '') {
  const chatRef = doc(collection(db, 'chats'));
  const memberIds = [creator.id, ...memberUsers.map(m => m.id)];

  const memberDetails = {};
  memberDetails[creator.id] = {
    name: creator.name || '',
    username: creator.username || '',
    profilePicUrl: creator.profilePicUrl || null,
  };

  memberUsers.forEach((m) => {
    memberDetails[m.id] = {
      name: m.name || '',
      username: m.username || '',
      profilePicUrl: m.profilePicUrl || null,
    };
  });

  const chatData = {
    type: 'group',
    members: memberIds,
    memberDetails,
    createdAt: serverTimestamp(),
    createdBy: creator.id,
    lastMessage: null,
    updatedAt: serverTimestamp(),
    groupName: groupName || 'New Group',
    groupIcon: null,
    groupDescription: groupDescription || '',
    admins: [creator.id],
  };

  await setDoc(chatRef, chatData);
  return chatRef.id;
}

export function subscribeToChatList(userId, callback) {
  const q = query(
    collection(db, 'chats'),
    where('members', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(chats);
  });
}

export async function getChatById(chatId) {
  const ref = doc(db, 'chats', chatId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}

export function subscribeToChat(chatId, callback) {
  const ref = doc(db, 'chats', chatId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
}

export async function updateChatLastMessage(chatId, messageData) {
  const ref = doc(db, 'chats', chatId);
  await updateDoc(ref, {
    lastMessage: messageData,
    updatedAt: serverTimestamp(),
  });
}

export async function updateGroupInfo(chatId, data) {
  const ref = doc(db, 'chats', chatId);
  await updateDoc(ref, data);
}

export async function addGroupMember(chatId, user) {
  const ref = doc(db, 'chats', chatId);
  await updateDoc(ref, {
    members: arrayUnion(user.id),
    [`memberDetails.${user.id}`]: {
      name: user.name || '',
      username: user.username || '',
      profilePicUrl: user.profilePicUrl || null,
    },
  });
}

export async function removeGroupMember(chatId, userId) {
  const ref = doc(db, 'chats', chatId);
  await updateDoc(ref, {
    members: arrayRemove(userId),
  });
}

export async function leaveGroup(chatId, userId) {
  await removeGroupMember(chatId, userId);
}

export async function deleteChat(chatId) {
  // Note: In production, you'd also delete subcollections
  const ref = doc(db, 'chats', chatId);
  await deleteDoc(ref);
}
