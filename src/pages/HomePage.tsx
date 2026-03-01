import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import HomePageBody from "../components/HomePageBody";
import { ToastContainer } from "react-toastify";
import LocationSelector from "../components/LocationSelector";
import BiLogo from "../assets/pictures/bi-logo.png";

function HomePage() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

  return (
    <div className="home-page">
      <div className="home-page__credit">
        <img src={BiLogo} alt="BI Logo" className="home-page__credit-logo" />
        <span>פותח ע״י פלוגת BI DATA גדוד 373</span>
      </div>
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
          <LocationSelector titles={['פד"ם', "מצודת האבות", "באזל"]} />
        )}
      </div>
    </div>
  );
}

export default HomePage;
