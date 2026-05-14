export const APP_NAME = 'UB Convo';

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_GROUP_MEMBERS = 100;
export const MAX_MESSAGE_LENGTH = 5000;
export const MESSAGES_PER_PAGE = 50;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
};

export const CHAT_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
};

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-rar-compressed',
  'text/plain',
  'text/csv',
  'application/json',
];

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  showEmail: false,
  showPhone: false,
  readReceipts: true,
  notifications: true,
  notificationSound: true,
  lastActiveStatus: true,
};

export const FILE_ICONS = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📽️',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
  'application/zip': '📦',
  'application/x-rar-compressed': '📦',
  'text/plain': '📃',
  'text/csv': '📊',
  'application/json': '📋',
};
