import classNames from "classnames";
import dayjs from "dayjs";
import { ChevronDown, ChevronLeft, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { TbChevronsLeft } from "react-icons/tb";
import driverOrganizationDataMapping from "../../functions/driverOrganizationDataMapping";
import useGetDrivers from "../../hooks/data/useGetDrivers";
import useGetDriversData, { IDriverData } from "../../hooks/data/useGetDriversData";
import useGetShuttles from "../../hooks/data/useGetShuttles";
import { ColorType, Driver, TravelItem } from "../../types/travelBar";
import DriverOrganization from "../DriverOrganization/DriverOrganization";
import DriverFilterButton from "./DriverFilterButton";
import { parseStations } from "../../functions/parseStations";
import { patchItemInList } from "../../functions/postToSharepoint";

const TravelBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUpdatingDriver, setIsUpdatingDriver] = useState<boolean>(false);
  const [colorFilter, setColorFilter] = useState<ColorType>();
  const [travelItems, setTravelItems] = useState<TravelItem[]>([]);

  const drivers = useGetDrivers();
  const driversData = useGetDriversData();
  const { shuttles, refetch: refetchShuttles } = useGetShuttles();

  const updatedDrivers = useMemo(() => {
    const driverDistanceMap = new Map<number, number>();

    shuttles?.forEach((shuttle) => {
      if (shuttle.driverData?.ID) {
        const current = driverDistanceMap.get(shuttle.driverData.ID) || 0;
        driverDistanceMap.set(shuttle.driverData.ID, current + shuttle.totalDistance);
      }
    });

    return driversData.map((driver) => ({
      ...driver,
      Distance: driverDistanceMap.get(driver.ID) || 0,
    }));
  }, [driversData, shuttles]);

  // Filter travel items based on color filter
  const filteredTravelItems = useMemo(() => {
    return colorFilter ? travelItems.filter((item) => item.colorType === colorFilter) : travelItems;
  }, [travelItems, colorFilter]);

  const [expandedTrips, setExpandedTrips] = useState<number[]>([]);
  const [driverAssignments, setDriverAssignments] = useState<Record<ColorType, number | null>>({
    purple: null,
    cyan: null,
    orange: null,
  });
  const [isShowDailyOrganization, setIsShowDailyOrganization] = useState<boolean>(false);

  const toggleFilter = (color: ColorType): void => {
    setColorFilter((prevColor) => (prevColor === color ? undefined : color));
  };

  const toggleTripExpansion = (tripId: number): void => {
    setExpandedTrips((prev) =>
      prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]
    );
  };

  // Assign driver to a color route
  const assignDriver = async (color: ColorType, driverId: number): Promise<void> => {
    try {
      if (isUpdatingDriver) return; // Prevent multiple updates at the same time
      setIsUpdatingDriver(true);
      const relevantShuttles = shuttles?.filter(
        (s) => s.driverData.ID === getDriverIndexByColor(color)?.ID
      );

      if (!relevantShuttles || relevantShuttles.length === 0) {
        return;
      }

      await Promise.all(
        relevantShuttles.map((s) =>
          patchItemInList(
            "Shuttles",
            { DriverId: s.DriverId !== driverId ? driverId : null },
            s.ID,
            "*"
          )
        )
      );

      // Only update state after successful patching
      setDriverAssignments((prev) =>
        prev[color] !== driverId
          ? {
              ...prev,
              [color]: driverId,
            }
          : {
              ...prev,
              [color]: null,
            }
      );

      await refetchShuttles();
    } catch (error) {
      console.error("Error assigning driver:", error);
    } finally {
      setIsUpdatingDriver(false);
    }
  };

  // Get assigned driver name for a color
  const getAssignedDriver = (color: ColorType): Driver | undefined => {
    const driverId = driverAssignments[color];
    const driverFound = drivers?.find((driver) => driver?.ID === driverId);
    return driverFound;
  };

  // Check if driver is already assigned to another color
  const isDriverAssigned = (driverId: number, currentColor: ColorType): boolean => {
    // Allow selection of a driver that's already assigned to the current color
    if (driverAssignments[currentColor] === driverId) return false;

    // Prevent selection if driver is assigned to any other color
    return Object.values(driverAssignments).includes(driverId);
  };

  // Check if a color has a driver assigned
  const hasDriverAssigned = (color: ColorType): boolean => {
    return driverAssignments[color] !== null;
  };

  const getDriverIndexByColor = (color: ColorType): IDriverData => {
    return updatedDrivers.find((d) => d.ID === colors.indexOf(color) + 1) as IDriverData;
  };

  // Array of colors to render filter buttons
  const colors: ColorType[] = useMemo(() => ["purple", "cyan", "orange"], []);

  useEffect(() => {
    const findInitialDriver = (color: ColorType): number | null => {
      const shuttle = shuttles?.find((s) => s.driverData.ID === colors.indexOf(color) + 1);
      return shuttle ? shuttle.DriverId : null;
    };

    const initialAssignments: Record<ColorType, number | null> = {
      purple: findInitialDriver("purple"),
      cyan: findInitialDriver("cyan"),
      orange: findInitialDriver("orange"),
    };
    setDriverAssignments(initialAssignments);
  }, [colors, shuttles]);

  useEffect(() => {
    if (shuttles) {
      const formattedShuttles = shuttles
        .sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime())
        .map((shuttle) => {
          return {
            ...shuttle,
            code: "",
            colorType: colors[shuttle.driverData.ID - 1],
            stations: parseStations(shuttle.Details, shuttle.ArrivalTime),
          };
        }) as TravelItem[];

      setTravelItems(formattedShuttles);
    }
  }, [colors, driverAssignments, shuttles]);

  return (
    <>
      {isOpen ? (
        <div className="travel-bar">
          <div className="travel-bar__header">
            <div className="travel-bar__header__back-button" onClick={() => setIsOpen(false)}>
              <TbChevronsLeft className="travel-bar__header__back-icon" size={16} />
              <span className="travel-bar__header__back-text">נסיעות</span>
            </div>
            <div
              onClick={() => setIsShowDailyOrganization(true)}
              className="travel-bar__header__title"
            >
              הצג סידור יומי
            </div>
          </div>

          <div className="travel-bar__filters">
            {colors.map((color) => (
              <DriverFilterButton
                key={color}
                color={color}
                isActive={color === colorFilter}
                isUpdatingDriver={isUpdatingDriver}
                isDriverAssigned={hasDriverAssigned(color)}
                selectedDriver={getAssignedDriver(color)}
                placeholder={getDriverIndexByColor(color)?.Title}
                kilometers={getDriverIndexByColor(color)?.Distance}
                toggleFilter={toggleFilter}
                assignDriver={assignDriver}
                isDriverAssignedFunc={isDriverAssigned}
                drivers={drivers}
              />
            ))}
          </div>

          <div className="travel-bar__list-container">
            <ul className="travel-bar__list">
              {filteredTravelItems.map((item) => {
                const driverName = drivers?.find((driver) => driver.ID === item.DriverId)?.Title;

                return (
                  <li className="travel-bar__list__item" key={item.ID}>
                    <div
                      className="travel-bar__list__item__header"
                      onClick={() => toggleTripExpansion(item.ID)}
                    >
                      <div className="travel-bar__list__item__expand-icon">
                        {expandedTrips.includes(item.ID) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronLeft size={16} />
                        )}
                      </div>
                      <div className="travel-bar__list__item__trip-id">{item.ID}#</div>

                      <div className="travel-bar__list__item__left">
                        <div className="travel-bar__list__item__time">
                          <span>{dayjs(item.StartTime).format("HH:mm")}</span>
                          <span className="travel-bar__list__item__time__separator">
                            <FaLongArrowAltLeft />
                          </span>
                          <span>{dayjs(item.ArrivalTime).format("HH:mm")}</span>
                        </div>
                      </div>

                      <div className="travel-bar__list__item__right">
                        <div className="travel-bar__list__item__type">אזור</div>
                        <div className="travel-bar__list__item__location">{item.code}</div>
                      </div>

                      <div className="travel-bar__list__item__driver">
                        {driverName || getDriverIndexByColor(item.colorType)?.Title}
                      </div>
                      <div
                        className={classNames(
                          "travel-bar__list__item__color-indicator",
                          `travel-bar__list__item__color-indicator--${item.colorType}`
                        )}
                      />
                    </div>

                    {expandedTrips.includes(item.ID) && item.stations.length > 0 && (
                      <div className="travel-bar__list__item__expanded">
                        <ul
                          className={classNames(
                            "travel-bar__list__item__stations",
                            `travel-bar__list__item__stations--${item.colorType}`
                          )}
                        >
                          {item.stations.map((station, index) => (
                            <li
                              key={index}
                              className={classNames(
                                "travel-bar__list__item__station",
                                `travel-bar__list__item__station--${item.colorType}`
                              )}
                            >
                              <div className="travel-bar__list__item__station__name">
                                {station.name}
                              </div>
                              {station.passengers && (
                                <div className="travel-bar__list__item__station__passengers">
                                  <Users
                                    size={14}
                                    className="travel-bar__list__item__station__passengers__icon"
                                  />
                                  <span className="travel-bar__list__item__station__passengers__count">
                                    {station.passengers.length}
                                  </span>
                                </div>
                              )}
                              <div className="travel-bar__list__item__station__time">
                                {station.arrivalTime}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <div onClick={() => setIsOpen(true)} className="side-bar">
          <div className="side-bar__button-container">
            <TbChevronsLeft className="side-bar__button-container__icon" size={16} />
            <span className="side-bar__button-container__text">נסיעות</span>
          </div>
        </div>
      )}
      <DriverOrganization
        data={
          travelItems
            ? driverOrganizationDataMapping(travelItems, drivers || [], driverAssignments)
            : []
        }
        isModalOpen={isShowDailyOrganization}
        setIsModalOpen={setIsShowDailyOrganization}
      />
    </>
  );
};

export default TravelBar;
