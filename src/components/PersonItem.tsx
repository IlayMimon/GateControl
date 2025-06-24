import { Button } from "antd";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast, ToastOptions } from "react-toastify";
import preformAction from "../functions/preformAction";
import { Person } from "../hooks/data/useGetPeople";
import { IoPersonAdd, IoPersonRemove } from "react-icons/io5";
import { Select } from "antd";
import { useGateControlContext } from "../context/GateControlContext";

interface IPersonItemProps {
  person: Person;
  mode: "action" | "status";
}

export const toastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: "light",
  className: "toast-notification",
};

function PersonItem({ person, mode }: IPersonItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [branch, setBranch] = useState<number | undefined>(person.Branch?.id);
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") as 'פד"ם' | "גני יעלים";
  const { branches, setPeopleData } = useGateControlContext();

  const handleClick = async (actionType: "inbound" | "outbound") => {
    setIsLoading(true);

    if (!person.Branch?.Title && !branch) {
      toast.error("יש לבחור אגף", toastConfig);
      setIsLoading(false);
      return;
    } else {
      const response = await preformAction(
        location,
        actionType,
        person.ID,
        branch
      );
      if (response === "error") {
        toast.error("אירעה שגיאה בביצוע הפעולה", toastConfig);
      } else {
        const updatedPerson = person;
        if (branch && !person.Branch?.Title) {
          updatedPerson.Branch = {
            id: branch,
            Title: branches?.find((b) => b.ID === branch)?.Title as string,
          };
        }
        if (actionType === "inbound") {
          updatedPerson.Location = location;
        } else if (actionType === "outbound") {
          updatedPerson.Location = "לא נמצא";
        }

        setPeopleData((prevValue) => {
          return [
            updatedPerson,
            ...prevValue.filter((p) => p.ID !== person.ID),
          ];
        });
        toast.success("פעולה בוצעה בהצלחה", toastConfig);
      }

      setIsLoading(false);
    }
  };

  const handleBranchChange = (value: number) => {
    setBranch(value);
  };

  return (
    <div className="person-item">
      <div className="person-item__right">
        <div className="person-item__right__title">
          <span className="person-item__right__title__name">
            {person.Title} {person.LastName}
          </span>
          <span className="person-item__right__title__army-id">
            {person.ArmyId}
          </span>
        </div>
        <div className="person-item__subtitle">
          <span className="person-item__subtitle__branch">
            אגף:
            {!person.Branch?.Title ? (
              <Select
                showSearch
                placeholder="בחר אגף"
                onChange={handleBranchChange}
                filterOption={(input, option) => {
                  var _a;
                  return (
                    (_a =
                      option === null || option === void 0
                        ? void 0
                        : option.label) !== null && _a !== void 0
                      ? _a
                      : ""
                  )
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
                options={branches?.map((branch) => ({
                  value: branch.ID,
                  label: branch.Title,
                }))}
              />
            ) : (
              ` ${person.Branch.Title} `
            )}
          </span>
        </div>
      </div>
      {mode === "status" && (
        <div className="person-item__status">
          <span className="person-item__status__text">נמצא במתקן</span>
        </div>
      )}
      {mode === "action" && (
        <div className="person-item__left">
          <Button
            className="person-item__left__enter-button"
            onClick={() => handleClick("inbound")}
            disabled={isLoading}
          >
            <IoPersonAdd style={{ marginLeft: "2px" }} />
            כניסה
          </Button>
          <Button
            className="person-item__left__exit-button"
            onClick={() => handleClick("outbound")}
            disabled={isLoading}
          >
            <IoPersonRemove style={{ marginLeft: "2px" }} />
            יציאה
          </Button>
        </div>
      )}
    </div>
  );
}

export default PersonItem;
