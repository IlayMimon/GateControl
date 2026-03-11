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

// ── הגדרת העדכון: מספרים אישיים ו-Branch ID יעד ─────────────────────────────
const ARMY_IDS_TO_UPDATE = [
  '8894351',
  // '9250152',
];
const TARGET_BRANCH_ID = 1;
// ─────────────────────────────────────────────────────────────────────────────

function HomePage() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location');
  const [updating, setUpdating] = useState(false);

  const handleUpdateBranch = async () => {
    setUpdating(true);
    try {
      const { success, failed } = await updateBranchByArmyIds(
        ARMY_IDS_TO_UPDATE,
        TARGET_BRANCH_ID,
      );
      if (failed === 0) {
        toast.success(`עודכנו ${success} רשומות בהצלחה`);
      } else {
        toast.warning(`עודכנו ${success} רשומות, נכשלו ${failed}`);
      }
    } catch {
      toast.error('שגיאה בעדכון המספרים האישיים');
    } finally {
      setUpdating(false);
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
