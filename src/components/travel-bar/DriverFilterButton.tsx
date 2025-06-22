import { Dropdown } from "antd";
import classNames from "classnames";
import { ChevronDown } from "lucide-react";
import { DriverFilterButtonProps } from "../../types/travelBar";

const DriverFilterButton: React.FC<DriverFilterButtonProps> = ({
  color,
  isDriverAssigned,
  isActive,
  isUpdatingDriver,
  selectedDriver,
  placeholder,
  kilometers,
  toggleFilter,
  assignDriver,
  isDriverAssignedFunc,
  drivers,
}) => {
  const items = drivers.map((driver) => ({
    key: driver.ID,
    disabled: isDriverAssignedFunc(driver.ID, color),
    label: (
      <div
        style={{ height: "100%", width: "100%" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isDriverAssignedFunc(driver.ID, color)) {
            assignDriver(color, driver.ID);
          }
        }}
      >
        {driver.Title}
      </div>
    ),
  }));

  return (
    <div
      className={classNames("driver-filter-button", { ["driver-filter-button--active"]: isActive })}
      onClick={() => toggleFilter(color)}
    >
      {isUpdatingDriver ? (
        <div className="driver-filter-button__button">
          <span className="driver-filter-button__button__text">מעדכן...</span>
        </div>
      ) : (
        <Dropdown className="driver-filter-button__dropdown" menu={{ items }} trigger={["click"]}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={classNames(
              "driver-filter-button__button",
              `driver-filter-button__button--${color}`,
              {
                [`driver-filter-button__button--active`]: isDriverAssigned,
                [`driver-filter-button__button--active--${color}`]: isDriverAssigned,
              }
            )}
          >
            <span className="driver-filter-button__button__text">
              {selectedDriver?.Title || placeholder}
            </span>
            <ChevronDown className="driver-filter-button__button__dropdown-icon" />
          </button>
        </Dropdown>
      )}

      <div className="driver-filter-button__kilometers">{`${kilometers} ק"מ`}</div>
    </div>
  );
};

export default DriverFilterButton;
