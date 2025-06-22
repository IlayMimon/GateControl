import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";

type Service = {
  ID: number;
  Title: string;
  Time: number
};

const useGetServices = () => {
  const { data } = useQueryFetchRequest<SharepointQueryResultArray<Service>>(
    "/_api/web/lists/getbytitle('Services')/items?$select=ID,Title,Time"
  );

  const Services = data?.d.results;

  return Services;
};

export default useGetServices;
