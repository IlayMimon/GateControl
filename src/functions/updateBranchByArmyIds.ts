import axios from 'axios';
import { patchItemInList } from './postToSharepoint';

/**
 * Updates the Branch (lookup) field for all people matching the given ArmyIds.
 * @param armyIds  - list of ArmyId strings to update
 * @param newBranchId - the SharePoint ID of the target Branch item
 * @returns counts of successes and failures
 */
export const updateBranchByArmyIds = async (
  armyIds: string[],
  newBranchId: number
): Promise<{ success: number; failed: number; failedIds: string[] }> => {
  // Build OData filter: ArmyId eq '...' or ArmyId eq '...'
  const filter = armyIds.map(id => `ArmyId eq '${id}'`).join(' or ');
  const url = `/_api/web/lists/getbytitle('People')/items?$select=ID,ArmyId&$filter=${encodeURIComponent(filter)}&$top=5000`;

  const { data } = await axios.get<{ d: { results: { ID: number; ArmyId: string }[] } }>(url, {
    headers: { Accept: 'application/json;odata=verbose' },
  });

  const items = data.d.results;
  let success = 0;
  let failed = 0;
  const failedIds: string[] = [];

  await Promise.all(
    items.map(async (item) => {
      try {
        const res = await patchItemInList('People', { BranchId: newBranchId }, item.ID, '*');
        if (res.status === 204) success++;
        else {
          failed++;
          failedIds.push(item.ArmyId);
        }
      } catch {
        failed++;
        failedIds.push(item.ArmyId);
      }
    })
  );

  return { success, failed, failedIds };
};
