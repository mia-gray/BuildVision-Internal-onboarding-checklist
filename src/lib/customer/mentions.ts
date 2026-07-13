/**
 * Team roster + @mention parsing for internal notes.
 *
 * The roster is the internal team (same list used for CSM assignment). Mentions
 * are always resolved against this known list so a note can only "notify" a real
 * teammate — never arbitrary text.
 */
import { CSM_OPTIONS } from "./service";

export const TEAM_ROSTER = CSM_OPTIONS;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Return the roster names that are @mentioned in `body`, in roster order. */
export function parseMentions(body: string, roster: string[] = TEAM_ROSTER): string[] {
  return roster.filter((name) => new RegExp(`@${escapeRegExp(name)}(?![A-Za-z])`).test(body));
}
