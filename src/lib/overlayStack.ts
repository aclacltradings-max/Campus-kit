/**
 * A stack of currently-open overlays (modals and drawers).
 *
 * Android's hardware back button has to mean "close the thing on top", which the
 * browser cannot tell us on its own — a React modal is not a history entry. Each
 * overlay registers its close handler while it is open, and the back-button
 * handler pops the most recently opened one. LIFO order matters because a confirm
 * dialog can sit on top of a task editor.
 */

type CloseHandler = () => void;

interface Entry {
  id: symbol;
  close: CloseHandler;
}

const stack: Entry[] = [];

export function pushOverlay(close: CloseHandler): () => void {
  const entry: Entry = { id: Symbol('overlay'), close };
  stack.push(entry);
  return () => {
    const index = stack.findIndex((item) => item.id === entry.id);
    if (index !== -1) stack.splice(index, 1);
  };
}

export function hasOpenOverlay(): boolean {
  return stack.length > 0;
}

/** Closes the topmost overlay. Returns false when nothing was open. */
export function closeTopOverlay(): boolean {
  const entry = stack.pop();
  if (!entry) return false;
  entry.close();
  return true;
}
