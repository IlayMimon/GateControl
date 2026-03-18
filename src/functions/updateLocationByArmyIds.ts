import axios from 'axios';
import { patchItemInList } from './postToSharepoint';

/**
 * Updates the Location (text) field for all people matching the given ArmyIds.
 * @param armyIds     - list of ArmyId strings to update
 * @param newLocation - the new Location value (e.g. 'לא נמצא')
 * @returns counts of successes and failures
 */
export const updateLocationByArmyIds = async (
  armyIds: string[],
  newLocation: string,
): Promise<{ success: number; failed: number; failedIds: string[] }> => {
  const filter = armyIds.map((id) => `ArmyId eq '${id}'`).join(' or ');
  const url = `/_api/web/lists/getbytitle('People')/items?$select=ID,ArmyId&$filter=${encodeURIComponent(filter)}&$top=5000`;

  const { data } = await axios.get<{
    d: { results: { ID: number; ArmyId: string }[] };
  }>(url, {
    headers: { Accept: 'application/json;odata=verbose' },
  });

  const items = data.d.results;
  let success = 0;
  let failed = 0;
  const failedIds: string[] = [];

  await Promise.all(
    items.map(async (item) => {
      try {
        const res = await patchItemInList(
          'People',
          { Location: newLocation },
          item.ID,
          '*',
        );
        if (res.status === 204) success++;
        else {
          failed++;
          failedIds.push(item.ArmyId);
        }
      } catch {
        failed++;
        failedIds.push(item.ArmyId);
      }
    }),
  );

  return { success, failed, failedIds };
};
