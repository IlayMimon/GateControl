import { IoAnalyticsOutline, IoPeople, IoPersonSharp } from 'react-icons/io5';
import { useSearchParams } from 'react-router-dom';
import useGetActions from '../hooks/data/useGetActions';

import { useGateControlContext } from '../context/GateControlContext';
import KPI from './KPI';

function KPIES() {
  const [searchParams] = useSearchParams();
  //TODO fix location logic in multiple places, maybe move it to context or create a custom hook for it
  let location = searchParams.get('location');
  if (location === 'מצודת האבות') {
    location = 'גני יעלים';
  }

  const { data: actionsData } = useGetActions(true);
  const { peopleData } = useGateControlContext();

  return location ? (
    <div className="kpies">
      <KPI
        title={'נמצא במתקן'}
        value={
          peopleData?.filter((person) => person.Location === location).length ||
          0
        }
        icon={<IoPersonSharp />}
      />
      <KPI
        title={'פעילות היום'}
        value={
          actionsData?.filter((action) => {
            console.log(action.Location, Location);
            return action.Location === location;
          })?.length || 0
        }
        icon={<IoAnalyticsOutline />}
      />
      <KPI
        title={'סה"כ אנשים'}
        value={peopleData?.length || 0}
        icon={<IoPeople />}
      />
    </div>
  ) : (
    <span>לא נבחר מיקום</span>
  );
}

export default KPIES;
