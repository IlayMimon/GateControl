import Header from "../components/Header";
import HomeScreenBody from "../components/HomeScreenBody";
import SidebarNavigation from "../components/sidebarNavigation";
import React, { useState } from "react";
import { HomePageContext } from "../contexts/HomePage";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc)

const HomePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  return (
    <HomePageContext.Provider value={{ selectedDate, setSelectedDate }}>
      <div className="home-page">
        <div className="home-page__sidebar">
          <SidebarNavigation />
        </div>
        <div className="home-page__content">
          <header className="home-page__content__header">
            <Header />
          </header>
          <div className="home-page__content__body">
            <HomeScreenBody />
          </div>
        </div>
      </div>
    </HomePageContext.Provider>
  );
};

export default HomePage;
