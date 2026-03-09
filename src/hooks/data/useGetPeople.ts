import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";

export type Person = {
  ID: number;
  ArmyId: string;
  Title: string;
  LastName: string;
  Branch?: { id: number; Title: string };
  Location: string;
  BaseLocation?: { Title: string };
};

const useGetPeople = () => {
  const { data, isLoading, refetch } = useQueryFetchRequest<
    SharepointQueryResultArray<Person>
  >(
    "/_api/web/lists/getbytitle('People')/items?$top=5000&$select=ID,ArmyId,Title,LastName,Branch/Id,Branch/Title,Location,BaseLocation/Title&$expand=Branch,BaseLocation"
  );

  return { data: data?.d.results, isLoading, refetch };
};

export default useGetPeople;
