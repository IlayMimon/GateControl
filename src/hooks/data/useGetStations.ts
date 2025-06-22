import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";

type Station = {
  ID: number;
  Title: string;
  Area: string;
  StationOrder: number;
};

const useGetStations = () => {
  const { data } = useQueryFetchRequest<SharepointQueryResultArray<Station>>(
    "/_api/web/lists/getbytitle('Stations')/items?$select=ID,Title,Area,StationOrder",
  );

  const Stations = data?.d.results;

  return Stations;
};

export default useGetStations;