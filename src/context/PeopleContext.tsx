import React, { createContext, useContext, useEffect, useState } from "react";
import useGetPeople, { Person } from "../hooks/data/useGetPeople";

interface PeopleContextType {
  peopleData: Person[];
  peopleIsLoading: boolean;
  peopleRefetch: () => void;
  setPeopleData: React.Dispatch<React.SetStateAction<Person[]>>;
}

const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export const PeopleProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, refetch } = useGetPeople();
  const [peopleData, setPeopleData] = useState<Person[]>([]);

  // Sync initial data from the hook
  useEffect(() => {
    if (data) {
      setPeopleData(data);
    }
  }, [data]);

  return (
    <PeopleContext.Provider value={{ peopleData, peopleIsLoading: isLoading, peopleRefetch: refetch, setPeopleData }}>
      {children}
    </PeopleContext.Provider>
  );
};

export const usePeopleContext = () => {
  const context = useContext(PeopleContext);
  if (!context) {
    throw new Error("usePeopleContext must be used within a PeopleProvider");
  }
  return context;
};
