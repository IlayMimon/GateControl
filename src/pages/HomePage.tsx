import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HomePageBody from '../components/HomePageBody';
import { ToastContainer } from 'react-toastify';
import LocationSelector from '../components/LocationSelector';
import BiLogo from '../assets/pictures/bi-logo.png';
import { useUser } from '../context/UserContext';
import { ALL_LOCATIONS, GROUP_LOCATION_MAP } from '../config/permissions';

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = searchParams.get('location');
  const { groups, isLoading } = useUser();

  // Derive the list of locations this user is permitted to see
  const allowedLocations = isLoading
    ? []
    : ALL_LOCATIONS.filter((loc) =>
        groups.some((g) => GROUP_LOCATION_MAP[g.Title] === loc),
      );

  // If the user has access to exactly one location, go there automatically
  useEffect(() => {
    if (!isLoading && allowedLocations.length === 1 && !location) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('location', allowedLocations[0]);
      setSearchParams(newParams, { replace: true });
    }
  }, [isLoading, allowedLocations.length]);

  // Guard: if a location is set in the URL but the user has no access to it, clear it
  useEffect(() => {
    if (!isLoading && location && !allowedLocations.includes(location)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('location');
      setSearchParams(newParams, { replace: true });
    }
  }, [isLoading, location, allowedLocations.join(',')]);

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
      <div className="home-page__header">
        <h1>מעקב גישה למתקן {location && ` - ${location}`}</h1>
        <h2>{dayjs(new Date()).format('DD/MM/YYYY')}</h2>
      </div>
      <div className="home-page__body">
        {location ? (
          <HomePageBody />
        ) : isLoading ? (
          <div className="home-page__loading">טוען...</div>
        ) : allowedLocations.length === 0 ? (
          <div className="home-page__no-access">אין לך הרשאה לאף מיקום</div>
        ) : (
          <div className="home-page__location-wrap">
            <LocationSelector titles={allowedLocations} />
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
