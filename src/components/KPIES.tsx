import { useSearchParams } from "react-router-dom";
import useGetActions from "../hooks/data/useGetActions";
import useGetPeople from "../hooks/data/useGetPeople";
import KPI from "./KPI";

function KPIES() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

  const { data: actionsData } = useGetActions(true);
  const { data: peopleData } = useGetPeople();

  return location ? (
    <div className="kpies">
      <KPI
        title={"נמצא במתקן"}
        value={peopleData?.filter((person) => person.Location === location).length || 0}
        icon={undefined}
      />
      <KPI
        title={"פעילות היום"}
        value={actionsData?.filter((action) => action.ActionType.includes(location))?.length || 0}
        icon={undefined}
      />
      <KPI title={'סה"כ אנשים'} value={peopleData?.length || 0} icon={undefined} />
    </div>
  ) : (
    <span>לא נבחר מיקום</span>
  );
}

export default KPIES;
