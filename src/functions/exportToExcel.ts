import * as XLSX from "xlsx";
import { Action } from "../hooks/data/useGetActions";
import { Person } from "../hooks/data/useGetPeople";

export function exportPeopleToExcel(
  people: Person[],
  location: string,
  actions: Action[] = []
) {
  const rows = people.map((person) => {
    // Find the most recent inbound action for this person at this location today
    const entryAction = actions
      .filter(
        (a) =>
          a.ArmyId.ArmyId === person.ArmyId &&
          a.ActionType === "inbound" &&
          a.Location === location
      )
      .sort(
        (a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime()
      )[0];

    return {
      "שם פרטי": person.Title,
      "שם משפחה": person.LastName,
      "מספר אישי": person.ArmyId,
      אגף: person.Branch?.Title ?? "לא משויך",
      מיקום: person.Location,
      "שעת כניסה": entryAction
        ? new Date(entryAction.Created).toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "נמצאים כעת");

  worksheet["!cols"] = [
    { wch: 15 }, // שם פרטי
    { wch: 15 }, // שם משפחה
    { wch: 12 }, // מספר אישי
    { wch: 15 }, // אגף
    { wch: 15 }, // מיקום
    { wch: 12 }, // שעת כניסה
  ];

  const date = new Date()
    .toLocaleDateString("he-IL")
    .replace(/\//g, "-");

  XLSX.writeFile(workbook, `נוכחות_${location}_${date}.xlsx`);
}
