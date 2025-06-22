import { ShuttleDetailsPerRequest } from "../types/shuttleDetailsPerRequst";
import { ShuttlesPerDay } from "./useGetTomorrowShuttles";
import { removeItemFromLsit } from "./postToSharepoint";

const resetShuttles = async (
  tempShuttles: ShuttlesPerDay[] | undefined,
  tempShuttlesDetailsPerRequest: ShuttleDetailsPerRequest[] | undefined
) => {
  const shuttles = tempShuttles || [];
  const shuttlesDetailsPerRequest = tempShuttlesDetailsPerRequest || [];

  for (const shuttle of shuttles) {
    await removeItemFromLsit("Shuttles", shuttle.Id, "*");
  }

  for (const DetailsPerRequest of shuttlesDetailsPerRequest) {
    removeItemFromLsit("ShuttleDetailsPerRequest", DetailsPerRequest.ID, "*");
  }
};

export default resetShuttles;
