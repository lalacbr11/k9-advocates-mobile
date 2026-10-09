export type ProfileRoute = { kind: 'dog'; id: string } | { kind: 'client'; id: string };

// Revisit an existing profile instead of growing a dog/owner navigation loop.
export function openProfile(history: readonly ProfileRoute[], next: ProfileRoute): readonly ProfileRoute[] {
  const existing = history.findIndex((route) => route.kind === next.kind && route.id === next.id);
  return existing < 0 ? [...history, next] : history.slice(0, existing + 1);
}

export function backFromProfile(history: readonly ProfileRoute[]): readonly ProfileRoute[] {
  return history.slice(0, -1);
}

// Reselect only scrolls the visible monthly calendar; nested screens retain
// their existing tab behavior (return to the calendar at its saved position).
export function shouldScrollCalendarToTop(active: string, next: string, hasSelectedDate: boolean, hasProfile: boolean): boolean {
  return active === 'Calendar' && next === 'Calendar' && !hasSelectedDate && !hasProfile;
}
