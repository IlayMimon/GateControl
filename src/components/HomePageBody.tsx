import { useSearchParams } from 'react-router-dom';
import KPIES from './KPIES';
import MainContent from './MainContent';
import Button from 'antd/es/button';

function HomePageBody() {
  const [, setSearchParams] = useSearchParams();

  const handleClearLocation = () => {
    setSearchParams(new URLSearchParams());
  };
  return (
    <div className="home-page-body">
      <KPIES />
      <MainContent />

      <Button
        className="home-page-body__back-btn"
        onClick={handleClearLocation}
      >
        חזור
      </Button>
    </div>
  );
}

export default HomePageBody;
