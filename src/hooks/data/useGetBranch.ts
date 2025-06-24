import { SharepointQueryResultArray } from '../../types/spFetchTypes';
import { useQueryFetchRequest } from '../useQueryFetch';

export type Branch = {
  ID: number;
  Title: string;
};

const useGetBranch = () => {
  const { data, isLoading, refetch } = useQueryFetchRequest<
    SharepointQueryResultArray<Branch>
  >("/_api/web/lists/getbytitle('branches')/items?$select=ID,Title");

  return { data: data?.d.results, isLoading, refetch };
};

export default useGetBranch;
