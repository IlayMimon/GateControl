import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import HomePageBody from "../components/HomePageBody";
import LocationSelector from "../components/LocationSelector";
import Button from "antd/es/button";

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = searchParams.get("location");

  const handleClearLocation = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="home-page">
      <div className="home-page__header">
        <h1>מעקב גישה למתקן {location && ` - ${location}`}</h1>
        <h2>{dayjs(new Date()).format("DD/MM/YYYY")}</h2>
      </div>
      <div className="home-page__body">
        {location ? <HomePageBody /> : <LocationSelector titles={['פד"ם', "גני יעלים"]} />}
      </div>
      {location && (
        <div className="home-page__footer">
          <Button onClick={handleClearLocation}>חזור</Button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
