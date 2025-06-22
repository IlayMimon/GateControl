import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";

type Person = {
  ID: number;
  ArmyId: string;
  Title: string;
  LastName: string;
  Branch: number;
  Location: string;
};

const useGetPeople = () => {
  const { data, isLoading, refetch } = useQueryFetchRequest<SharepointQueryResultArray<Person>>(
    "/_api/web/lists/getbytitle('People')/items?$select=ID,ArmyId,Title,LastName,Branch,Location"
  );

  return { data: data?.d.results , isLoading, refetch };
};

export default useGetPeople;
