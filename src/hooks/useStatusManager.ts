import { useCallback, useEffect, useRef, useState } from "react";
import { assignShuttlesToDrivers } from "../functions/assignDriversFunc/assignDrivers";
import { useGetTomorrowShuttles } from "../functions/useGetTomorrowShuttles";
import { initDrivers } from "../functions/initDrivers";
import GetStatus from "./data/useGetStatus";

export const useStatusManager = (
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [shouldPoll, setShouldPoll] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<{
    isOver: boolean;
    step: number;
    isAssigned: boolean;
  } | null>(null);

  const { refetch } = GetStatus();

  const { refetch: refetchShuttles } = useGetTomorrowShuttles();

  const handleStatus = useCallback(async () => {
    const { data } = await refetch();
    const { data: shuttleData } = await refetchShuttles();
    if (!data || !shuttleData) return;

    const { isOver, step,isAssigned } = data.d.results[0] || {};
    setStatus({ isOver, step, isAssigned });

    const shuttles = shuttleData?.d.results.map((shuttle) => {
      return {
        Id: shuttle.Id,
        StartTime: shuttle.StartTime,
        ArrivalTime: shuttle.ArrivalTime,
        totalDistance: shuttle.totalDistance,
      };
    });

    if (isOver && isAssigned) {
      setModalOpen(false);
      setShouldPoll(false);
    } else if (isOver && !isAssigned) {
      setModalOpen(true);
      await assignShuttlesToDrivers(shuttles || [], initDrivers(3)); // FIX number of drivers and shuttles
    } else if (!isOver) {
      setModalOpen(true);
      setShouldPoll(true);
    }
  }, [refetch, refetchShuttles, setModalOpen]);

  useEffect(() => {
    if (shouldPoll) {
      intervalRef.current = setInterval(() => {
        handleStatus();
      }, 2000);
    } else {
      // Clear the interval if polling is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [handleStatus, shouldPoll]);

  // Manually triggerable from outside
  const onAssignClick = () => {
    setShouldPoll(true);
  };

  return {
    onAssignClick,
    status,
  };
};
