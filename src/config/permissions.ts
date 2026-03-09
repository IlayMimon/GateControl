/**
 * Maps SharePoint security group titles to the location labels they grant access to.
 * A user can belong to multiple groups and will see all their permitted locations.
 */
export const GROUP_LOCATION_MAP: Record<string, string> = {
  'מחנה פד״ם עריכה': 'פד"ם',
  'מצודת האבות עריכה': 'מצודת האבות',
  'באזל עריכה': 'באזל',
};

/** All known locations in display order */
export const ALL_LOCATIONS = ['פד"ם', 'מצודת האבות', 'באזל'];
