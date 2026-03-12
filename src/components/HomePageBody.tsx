import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import KPIES from './KPIES';
import MainContent from './MainContent';
import BarcodeScanner from './BarcodeScanner';
import Button from 'antd/es/button';
import { IoArrowBack } from 'react-icons/io5';

function HomePageBody() {
  const [, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string | undefined>();

  const handleClearLocation = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="home-page-body">
      <KPIES />
      {<BarcodeScanner onScan={setSearchValue} />}
      <MainContent searchValue={searchValue} onSearchChange={setSearchValue} />

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
