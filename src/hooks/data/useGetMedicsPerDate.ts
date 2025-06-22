import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";
import dayjs from "dayjs";

type MedicPerDate = {
  ID: number;
  medicId: number;
  Date: string;
};

const useGetMedicsPerDate = (date: dayjs.Dayjs) => {
  const startOfDay = date.startOf("day").toISOString();
  const nextDay = date.add(1, "day").startOf("day").toISOString();

  const filter = `$filter=Date ge datetime'${startOfDay}' and Date lt datetime'${nextDay}'`;
  const select = `$select=ID,medicId,Date`;

  const { data, refetch, isLoading } = useQueryFetchRequest<
    SharepointQueryResultArray<MedicPerDate>
  >(`/_api/web/lists/getbytitle('MedicPerDate')/items?${select}&${filter}`);

  const medicsPerDate = data?.d.results;

  return { medicsPerDate, refetch, isLoading };
};

export default useGetMedicsPerDate;
