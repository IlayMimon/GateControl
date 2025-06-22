import { Dayjs } from "dayjs";
import { createContext, useContext } from "react";

type HomePageContextType = {
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
};

export const HomePageContext = createContext<HomePageContextType | undefined>(undefined);

export const useHomePageContext = () => {
  const context = useContext(HomePageContext);
  if (!context)
    throw new Error(
      "useHomePageContextTypeContext must be used within HomePageContextTypeProvider"
    );
  return context;
};
