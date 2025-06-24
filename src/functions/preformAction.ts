import { addItemToList, patchItemInList } from './postToSharepoint';

const preformAction = async (
  location: 'פד"ם' | 'גני יעלים',
  actionType: 'inbound' | 'outbound',
  personId: number,
  personBranch?: number
) => {
  const actionResponse = await addItemToList('Actions', {
    ArmyIdId: personId,
    ActionType: actionType,
    Location: location,
    BranchId: personBranch,
  });

  const personResponse = await patchItemInList(
    'People',
    {
      Location: actionType === 'inbound' ? location : 'לא נמצא',
    },
    personId,
    '*'
  );

  return actionResponse.status === 201 && personResponse.status === 204
    ? 'success'
    : 'error';
};

export default preformAction;
