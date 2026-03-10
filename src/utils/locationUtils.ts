// Normalize Hebrew gershayim ״ (U+05F4) to ASCII " for consistent comparison
export const normalizeQuotes = (s: string) => s.replace(/״/g, '"');

// Old name → new name aliases (for backwards compatibility with stored data)
// Also used to include people from sub-locations (e.g. גני יעלים residents appear in מצודת האבות)
export const LOCATION_ALIASES: Record<string, string[]> = {
  'מחנה פד"ם': ['פד"ם'],
  'מצודת האבות': ['גני יעלים'],
};

export const matchesLocation = (personLoc: string, location: string): boolean => {
  const normPersonLoc = normalizeQuotes(personLoc);
  const normLocation = normalizeQuotes(location);
  const aliases = (LOCATION_ALIASES[normLocation] ?? []).map(normalizeQuotes);
  return normPersonLoc === normLocation || aliases.includes(normPersonLoc);
};
