import { Status } from "../../components/types/Status";
import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";



const GetStatus = () => {
  const { data, refetch } = useQueryFetchRequest<SharepointQueryResultArray<Status>>(
    "/_api/web/lists/getbytitle('Status')/items?$select=isOver,status,step,isAssigned",
  );

  return { data, refetch };
}

export default GetStatus;