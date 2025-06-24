import { IoAnalyticsOutline, IoPeople, IoPersonSharp } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import useGetActions from "../hooks/data/useGetActions";

import { usePeopleContext } from "../context/PeopleContext";
import KPI from "./KPI";

function KPIES() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

  const { data: actionsData } = useGetActions(true);
  const { peopleData } = usePeopleContext();

  return location ? (
    <div className="kpies">
      <KPI
        title={"נמצא במתקן"}
        value={peopleData?.filter((person) => person.Location === location).length || 0}
        icon={<IoPersonSharp />}
      />
      <KPI
        title={"פעילות היום"}
        value={actionsData?.filter((action) => action.Location === location)?.length || 0}
        icon={<IoAnalyticsOutline />}
      />
      <KPI title={'סה"כ אנשים'} value={peopleData?.length || 0} icon={<IoPeople />} />
    </div>
  ) : (
    <span>לא נבחר מיקום</span>
  );
}

export default KPIES;
