import * as Clipboard from 'expo-clipboard';
import { Platform, Share } from 'react-native';

// The app has no hosted web presence to link to, so a share links back into
// the app itself via its own URL scheme (app.json's "scheme": "myapp") along
// with the post's own text — genuinely useful content, not a dead link.
function shareMessageFor(post: { id: string; text: string }): string {
  const link = `myapp://post/${post.id}`;
  return post.text.trim().length > 0 ? `${post.text.trim()}\n\n${link}` : link;
}

/**
 * Shares a post via the platform's native share sheet, falling back to a
 * clipboard copy on web when `navigator.share` isn't available (most
 * desktop browsers). Returns true only when the share (or the fallback
 * copy) actually completed — never for a dismissed sheet or a rejected
 * call — so callers can use the result to decide whether to record it.
 */
export async function sharePost(post: { id: string; text: string }): Promise<boolean> {
  const message = shareMessageFor(post);
  try {
    const result = await Share.share({ message, title: 'ThrillIQ' }, { dialogTitle: 'Share this post' });
    // react-native-web's Share.share wraps navigator.share(), which has no
    // separate "dismissed" outcome — a resolved promise there means done.
    // Native RN resolves even a dismissed iOS sheet, so that one does need
    // the explicit action check.
    if (Platform.OS === 'web') return true;
    return result.action === Share.sharedAction;
  } catch {
    if (Platform.OS !== 'web') return false;
    try {
      return await Clipboard.setStringAsync(message);
    } catch {
      return false;
    }
  }
}
