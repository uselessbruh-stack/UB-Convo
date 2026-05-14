import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'h:mm a');
}

export function formatChatListTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE');
  }
  if (isThisYear(date)) {
    return format(date, 'MMM d');
  }
  return format(date, 'MM/dd/yyyy');
}

export function formatDateSeparator(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisYear(date)) return format(date, 'MMMM d');
  return format(date, 'MMMM d, yyyy');
}

export function formatLastSeen(timestamp) {
  if (!timestamp) return 'long time ago';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatJoinDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'MMMM yyyy');
}
