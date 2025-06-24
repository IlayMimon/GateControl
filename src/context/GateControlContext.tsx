import React, { createContext, useContext, useEffect, useState } from "react";
import useGetPeople, { Person } from "../hooks/data/useGetPeople";
import useGetBranch, { Branch } from "../hooks/data/useGetBranch";

interface PeopleContextType {
  peopleData: Person[];
  peopleIsLoading: boolean;
  peopleRefetch: () => void;
  setPeopleData: React.Dispatch<React.SetStateAction<Person[]>>;
  branches?: Branch[];
}

const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export const GateControProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: people, isLoading, refetch } = useGetPeople();
  const { data: branches } = useGetBranch();
  const [peopleData, setPeopleData] = useState<Person[]>([]);

  // Sync initial data from the hook
  useEffect(() => {
    if (people) {
      setPeopleData(people);
    }
  }, [people]);

  return (
    <PeopleContext.Provider
      value={{
        peopleData,
        peopleIsLoading: isLoading,
        peopleRefetch: refetch,
        setPeopleData,
        branches,
      }}
    >
      {children}
    </PeopleContext.Provider>
  );
};

export const useGateControlContext = () => {
  const context = useContext(PeopleContext);
  if (!context) {
    throw new Error(
      "useGateControlContext must be used within a GateControProvider"
    );
  }
  return context;
};
