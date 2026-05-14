import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from 'firebase/storage';
import { storage } from '../config/firebase';

export function uploadFile(path, file, onProgress) {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

export async function uploadProfilePicture(userId, file, onProgress) {
  const path = `profilePictures/${userId}/${Date.now()}_${file.name}`;
  return uploadFile(path, file, onProgress);
}

export async function uploadChatMedia(chatId, file, messageId, onProgress) {
  const path = `chatMedia/${chatId}/${messageId || Date.now()}_${file.name}`;
  return uploadFile(path, file, onProgress);
}

export async function uploadGroupIcon(chatId, file, onProgress) {
  const path = `groupIcons/${chatId}/${Date.now()}_${file.name}`;
  return uploadFile(path, file, onProgress);
}

export async function deleteFile(fileUrl) {
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    // File may not exist or URL might be a full download URL
    if (error.code !== 'storage/object-not-found') {
      console.warn('Error deleting file:', error);
    }
  }
}

export function getStoragePath(fileUrl) {
  try {
    const storageRef = ref(storage, fileUrl);
    return storageRef.fullPath;
  } catch {
    return null;
  }
}
