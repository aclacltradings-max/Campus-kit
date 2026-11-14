import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNative, attempt } from '@/lib/platform';

export type ExportFormat = 'json' | 'csv' | 'markdown';

const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  json: 'application/json',
  csv: 'text/csv',
  markdown: 'text/markdown',
};

/** Web fallback: an anchor click with an object URL. */
function downloadViaBrowser(filename: string, contents: string, mime: string): void {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export interface SaveResult {
  /** How the file reached the user, so the caller can word its confirmation. */
  via: 'share' | 'cached' | 'download';
  path?: string;
}

/**
 * Writes a text file and hands it to the user.
 *
 * On native there is no download folder to drop a blob into, so the file is
 * written into the app's cache and passed to the Android share sheet. That lets
 * the user send it to Drive, email, WhatsApp and so on — the closest equivalent
 * of "save this file" on a phone.
 */
export async function saveTextFile(
  filename: string,
  contents: string,
  format: ExportFormat,
): Promise<SaveResult> {
  const mime = MIME_BY_FORMAT[format];

  if (!isNative) {
    downloadViaBrowser(filename, contents, mime);
    return { via: 'download' };
  }

  const written = await Filesystem.writeFile({
    path: filename,
    data: contents,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
    recursive: true,
  });

  const shared = await attempt(() =>
    Share.share({
      title: filename,
      text: 'CampusKit Private export',
      url: written.uri,
      dialogTitle: 'Save or share your CampusKit export',
    }),
  );

  if (shared) return { via: 'share' };

  // The share sheet can be dismissed. The file is still written to app storage,
  // so say so rather than reporting a failure that did not happen.
  return { via: 'cached' };
}
