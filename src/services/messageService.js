import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp,
  limit, startAfter, getDocs, arrayUnion
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateChatLastMessage } from './chatService';
import { deleteFile } from './storageService';
import { MESSAGES_PER_PAGE } from '../utils/constants';

export async function sendMessage(chatId, messageData) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');

  const message = {
    text: messageData.text || null,
    senderId: messageData.senderId,
    senderName: messageData.senderName,
    timestamp: serverTimestamp(),
    type: messageData.type || 'text',
    fileUrl: messageData.fileUrl || null,
    fileName: messageData.fileName || null,
    fileSize: messageData.fileSize || null,
    fileType: messageData.fileType || null,
    thumbnailUrl: messageData.thumbnailUrl || null,
    readBy: [messageData.senderId],
    deletedFor: [],
    isDeleted: false,
  };

  const docRef = await addDoc(messagesRef, message);

  // Update last message on chat
  await updateChatLastMessage(chatId, {
    text: messageData.type === 'image' ? '📷 Photo' :
      messageData.type === 'file' ? `📎 ${messageData.fileName || 'File'}` :
        messageData.text || '',
    senderId: messageData.senderId,
    senderName: messageData.senderName,
    timestamp: serverTimestamp(),
    type: messageData.type || 'text',
  });

  return docRef.id;
}

export function subscribeToMessages(chatId, callback, messageLimit = MESSAGES_PER_PAGE) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(messageLimit)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(messages);
  });
}

export async function loadOlderMessages(chatId, lastDoc, pageSize = MESSAGES_PER_PAGE) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'desc'),
    startAfter(lastDoc),
    limit(pageSize)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
}

export async function deleteMessageForMe(chatId, messageId, userId) {
  const ref = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(ref, {
    deletedFor: arrayUnion(userId),
  });
}

export async function deleteMessageForEveryone(chatId, messageId, messageData) {
  const ref = doc(db, 'chats', chatId, 'messages', messageId);

  // Delete associated files from storage
  if (messageData?.fileUrl) {
    try {
      await deleteFile(messageData.fileUrl);
    } catch (e) {
      console.warn('Failed to delete file from storage:', e);
    }
  }
  if (messageData?.thumbnailUrl) {
    try {
      await deleteFile(messageData.thumbnailUrl);
    } catch (e) {
      console.warn('Failed to delete thumbnail from storage:', e);
    }
  }

  await updateDoc(ref, {
    isDeleted: true,
    text: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    fileType: null,
    thumbnailUrl: null,
  });
}

export async function markMessageRead(chatId, messageId, userId) {
  const ref = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(ref, {
    readBy: arrayUnion(userId),
  });
}
