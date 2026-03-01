import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import HomePageBody from "../components/HomePageBody";
import { ToastContainer } from "react-toastify";
import LocationSelector from "../components/LocationSelector";

function HomePage() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

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
        <h2>{dayjs(new Date()).format("DD/MM/YYYY")}</h2>
      </div>
      <div className="home-page__body">
        {/* TODO fix location logic in multiple places, maybe move it to context or create a custom hook for it */}
        {location ? (
          <HomePageBody />
        ) : (
          <LocationSelector titles={['פד"ם', "מצודת האבות", "בזל"]} />
        )}
      </div>
    </div>
  );
}

export default HomePage;
