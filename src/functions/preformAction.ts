import axios from 'axios';
import { addItemToList, patchItemInList } from './postToSharepoint';

// Fetches and caches the internal field name for the 'מיקום' lookup column.
// undefined = not yet fetched, null = fetched but not found, string = found
let _locationLookupFieldId: string | null | undefined = undefined;

async function getLocationLookupFieldId(): Promise<string | null> {
  if (_locationLookupFieldId !== undefined) return _locationLookupFieldId;
  try {
    // Fetch all Lookup fields and filter in JS — avoids OData filter encoding issues with Hebrew
    const res = await axios.get<{
      d: { results: { StaticName: string; Title: string }[] };
    }>(
      "/_api/web/lists/getbytitle('People')/fields?$filter=TypeAsString eq 'Lookup'&$select=StaticName,Title",
    );
    const field = res.data?.d?.results?.find((f) => f.Title === 'מיקום');
    _locationLookupFieldId = field ? `${field.StaticName}Id` : null;
  } catch {
    _locationLookupFieldId = null;
  }
  return _locationLookupFieldId;
}

const preformAction = async (
  location: string,
  actionType: 'inbound' | 'outbound',
  personId: number,
  locationId: number | null,
  personBranch?: number,
  notFoundLocationId?: number,
) => {
  const actionResponse = await addItemToList('Actions', {
    ArmyIdId: personId,
    ActionType: actionType,
    Location: location,
  });

  const personResponse = await patchItemInList(
    'People',
    {
      Location: actionType === 'inbound' ? location : 'לא נמצא',
      BaseLocationId: actionType === 'inbound' ? locationId : (notFoundLocationId ?? 0),
      BranchId: personBranch,
    },
    personId,
    '*',
  );

  // Sync the lookup column separately so a bad field name doesn't break the action.
  getLocationLookupFieldId().then((fieldId) => {
    if (!fieldId) return;
    patchItemInList(
      'People',
      { [fieldId]: actionType === 'inbound' ? locationId : 0 },
      personId,
      '*',
    ).catch((err) => console.warn('lookup sync failed:', err));
  });

  return actionResponse.status === 201 && personResponse.status === 204
    ? 'success'
    : 'error';
};

export default preformAction;
