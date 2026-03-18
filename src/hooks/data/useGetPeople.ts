import { useQuery } from "@tanstack/react-query";
import fetchAllSharePointPages from "../../functions/fetchAllSharePointPages";

export type Person = {
  ID: number;
  ArmyId: string;
  Title: string;
  LastName: string;
  Branch?: { id: number; Title: string };
  Location: string;
};

const PEOPLE_URL =
  "/_api/web/lists/getbytitle('People')/items" +
  "?$select=ID,ArmyId,Title,LastName,Branch/Id,Branch/Title,Location" +
  "&$expand=Branch&$top=500";

const useGetPeople = () => {
  const { data, isLoading, refetch } = useQuery<Person[]>({
    queryKey: [PEOPLE_URL],
    queryFn: () => fetchAllSharePointPages<Person>(PEOPLE_URL),
  });

  return { data, isLoading, refetch };
};

export default useGetPeople;
