import { useSearchParams } from 'react-router-dom';
import KPIES from './KPIES';
import MainContent from './MainContent';
import Button from 'antd/es/button';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';

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
        icon={<IoArrowBack />}
        iconPosition="end"
      >
        חזור
      </Button>
    </div>
  );
}

export default HomePageBody;
