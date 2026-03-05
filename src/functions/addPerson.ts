import { addItemToList } from "./postToSharepoint";

const addPerson = async (values: {
  firstName: string;
  lastName: string;
  armyId: string;
  branch: number;
}) => {
  const personResponse = await addItemToList("People", {
    ArmyId: values.armyId,
    Title: values.firstName,
    LastName: values.lastName,
    BranchId: values.branch,
  });

  if (personResponse.status === 201) {
    const newId = (personResponse.data as { d: { ID: number } }).d.ID;
    return { status: "success", id: newId };
  }
  return { status: "error", id: null };
};

export default addPerson;
