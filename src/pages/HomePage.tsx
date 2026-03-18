import dayjs from 'dayjs';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HomePageBody from '../components/HomePageBody';
import { ToastContainer, toast } from 'react-toastify';
import LocationSelector from '../components/LocationSelector';
import BiLogo from '../assets/pictures/bi-logo.png';
import MashaanLogo from '../assets/pictures/mashaan-logo.png';
import TiksuvPdmLogo from '../assets/pictures/tikshuv-pdm-logo.png';
import { updateBranchByArmyIds } from '../functions/updateBranchByArmyIds';
import { updateLocationByArmyIds } from '../functions/updateLocationByArmyIds';

const ARMY_IDS_TO_UPDATE = ['8894351'];

const TARGET_BRANCH_ID = 15;
const TARGET_LOCATION = 'לא נמצא';
// ─────────────────────────────────────────────────────────────────────────────

function HomePage() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location');
  const [updating, setUpdating] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const handleUpdateBranch = async () => {
    setUpdating(true);
    const CHUNK_SIZE = 10;
    const START_CHUNK_INDEX = 0; // מתחיל מההתחלה
    const END_CHUNK_INDEX = 18; // עוצר לפני מערך 19 (אינדקס 18)
    const chunks: string[][] = [];
    for (let i = 0; i < ARMY_IDS_TO_UPDATE.length; i += CHUNK_SIZE) {
      chunks.push(ARMY_IDS_TO_UPDATE.slice(i, i + CHUNK_SIZE));
    }

    let totalSuccess = 0;
    let totalFailed = 0;
    const allFailedIds: string[] = [];

    try {
      for (
        let i = START_CHUNK_INDEX;
        i < Math.min(END_CHUNK_INDEX, chunks.length);
        i++
      ) {
        console.log(
          `[updateBranch] מתחיל מערך ${i + 1}/${chunks.length}:`,
          chunks[i],
        );
        const { success, failed, failedIds } = await updateBranchByArmyIds(
          chunks[i],
          TARGET_BRANCH_ID,
        );
        totalSuccess += success;
        totalFailed += failed;
        allFailedIds.push(...failedIds);
        console.log(
          `[updateBranch] מערך ${i + 1}/${chunks.length} הסתיים ✓ | הצליחו: ${success}, נכשלו: ${failed}`,
        );
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (allFailedIds.length > 0) {
        console.warn('[updateBranch] מספרים אישיים שנכשלו:', allFailedIds);
        console.warn(
          '[updateBranch] כמערך להעתקה:',
          JSON.stringify(allFailedIds),
        );
      }

      if (totalFailed === 0) {
        toast.success(`עודכנו ${totalSuccess} רשומות בהצלחה`);
      } else {
        toast.warning(`עודכנו ${totalSuccess} רשומות, נכשלו ${totalFailed}`);
      }
    } catch (err) {
      console.error('[updateBranch] שגיאה:', err);
      if (allFailedIds.length > 0) {
        console.warn(
          '[updateBranch] מספרים שנכשלו עד כה:',
          JSON.stringify(allFailedIds),
        );
      }
      toast.error('שגיאה בעדכון המספרים האישיים');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateLocation = async () => {
    setUpdatingLocation(true);
    const CHUNK_SIZE = 10;
    const chunks: string[][] = [];
    for (let i = 0; i < ARMY_IDS_TO_UPDATE.length; i += CHUNK_SIZE) {
      chunks.push(ARMY_IDS_TO_UPDATE.slice(i, i + CHUNK_SIZE));
    }

    let totalSuccess = 0;
    let totalFailed = 0;
    const allFailedIds: string[] = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        console.log(
          `[updateLocation] מתחיל מערך ${i + 1}/${chunks.length}:`,
          chunks[i],
        );
        const { success, failed, failedIds } = await updateLocationByArmyIds(
          chunks[i],
          TARGET_LOCATION,
        );
        totalSuccess += success;
        totalFailed += failed;
        allFailedIds.push(...failedIds);
        console.log(
          `[updateLocation] מערך ${i + 1}/${chunks.length} הסתיים ✓ | הצליחו: ${success}, נכשלו: ${failed}`,
        );
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (allFailedIds.length > 0) {
        console.warn('[updateLocation] מספרים אישיים שנכשלו:', allFailedIds);
        console.warn(
          '[updateLocation] כמערך להעתקה:',
          JSON.stringify(allFailedIds),
        );
      }

      if (totalFailed === 0) {
        toast.success(`עודכנו ${totalSuccess} רשומות בהצלחה`);
      } else {
        toast.warning(`עודכנו ${totalSuccess} רשומות, נכשלו ${totalFailed}`);
      }
    } catch (err) {
      console.error('[updateLocation] שגיאה:', err);
      if (allFailedIds.length > 0) {
        console.warn(
          '[updateLocation] מספרים שנכשלו עד כה:',
          JSON.stringify(allFailedIds),
        );
      }
      toast.error('שגיאה בעדכון המיקום');
    } finally {
      setUpdatingLocation(false);
    }
  };

  return (
    <div className="home-page">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
      />
      <div className="home-page__header-logos">
        <img
          src={MashaanLogo}
          alt="לוגו מש״אן"
          className="home-page__header-logo"
        />
        <img
          src={TiksuvPdmLogo}
          alt="לוגו תקשוב פד״ם"
          className="home-page__header-logo"
        />
      </div>
      <div className="home-page__header">
        <h1>מעקב גישה למתקן {location && ` - ${location}`}</h1>
        <h2>{dayjs(new Date()).format('DD/MM/YYYY')}</h2>
      </div>
      <div className="home-page__body">
        {/* TODO fix location logic in multiple places, maybe move it to context or create a custom hook for it */}
        {location ? (
          <HomePageBody />
        ) : (
          <div className="home-page__location-wrap">
            <LocationSelector titles={['פד"ם', 'מצודת האבות', 'באזל']} />
            <button
              className="home-page__update-branch-btn"
              onClick={handleUpdateBranch}
              disabled={updating}
            >
              {updating ? 'מעדכן...' : 'עדכון מספרים אישיים'}
            </button>
            <button
              className="home-page__update-branch-btn"
              onClick={handleUpdateLocation}
              disabled={updatingLocation}
            >
              {updatingLocation ? 'מעדכן...' : 'עדכון מיקום'}
            </button>
          </div>
        )}
      </div>
      <div className="home-page__credit">
        <img src={BiLogo} alt="BI Logo" className="home-page__credit-logo" />
        <span>פותח ע״י פלוגת BI DATA גדוד 373</span>
      </div>
    </div>
  );
}

export default HomePage;
