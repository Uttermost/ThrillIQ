const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Manual formatting rather than Intl/toLocale*String — keeps the exact
// "Sat, Sep 12" / "6:00am" style used throughout the app (and sidesteps any
// gaps in Hermes's bundled ICU data across RN/Expo versions).
export function formatDateLabel(ts: number): string {
  const d = new Date(ts);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTimeLabel(ts: number): string {
  const d = new Date(ts);
  const hours24 = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const period = hours24 >= 12 ? 'pm' : 'am';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes}${period}`;
}
