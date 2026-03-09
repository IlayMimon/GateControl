import { SharepointQueryResultArray } from '../../types/spFetchTypes';
import { useQueryFetchRequest } from '../useQueryFetch';

export type Location = {
  ID: number;
  Title: string;
};

const useGetLocations = () => {
  const { data, isLoading } = useQueryFetchRequest<
    SharepointQueryResultArray<Location>
  >("/_api/web/lists/getbytitle('Locations')/items?$select=ID,Title&$orderby=Title");

  return { data: data?.d.results ?? [], isLoading };
};

export default useGetLocations;
