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

  return personResponse.status === 201 ? "success" : "error";
};

export default addPerson;
