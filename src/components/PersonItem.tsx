import { Button, Select } from "antd";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast, ToastOptions } from "react-toastify";
import preformAction from "../functions/preformAction";
import { patchItemInList } from "../functions/postToSharepoint";
import { Person } from "../hooks/data/useGetPeople";
import { IoPersonAdd, IoPersonRemove } from "react-icons/io5";
import { useGateControlContext } from "../context/GateControlContext";

interface IPersonItemProps {
  person: Person;
  mode: "action" | "status";
  onActionComplete?: () => void;
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

function PersonItem({ person, mode, onActionComplete }: IPersonItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBranch, setEditBranch] = useState<number | undefined>(person.Branch?.id);
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams] = useSearchParams();
  //TODO fix location logic in multiple places, maybe move it to context or create a custom hook for it
  const tempLocation = searchParams.get("location") as 'פד"ם' | "מצודת האבות";
  const location = tempLocation === "מצודת האבות" ? "גני יעלים" : tempLocation;
  const { branches, setPeopleData } = useGateControlContext();

  const handleClick = async (actionType: "inbound" | "outbound") => {
    setIsLoading(true);

    if (!person.Branch?.Title) {
      toast.error("יש לבחור אגף", toastConfig);
      setIsLoading(false);
      return;
    }

    const response = await preformAction(
      location,
      actionType,
      person.ID,
      person.Branch.id,
    );

    if (response === "error") {
      toast.error("אירעה שגיאה בביצוע הפעולה", toastConfig);
    } else {
      const updatedPerson = { ...person };
      if (actionType === "inbound") {
        updatedPerson.Location = location;
      } else {
        updatedPerson.Location = "לא נמצא";
      }
      setPeopleData((prev) => [
        updatedPerson,
        ...prev.filter((p) => p.ID !== person.ID),
      ]);
      toast.success("פעולה בוצעה בהצלחה", toastConfig);
      onActionComplete?.();
    }

    setIsLoading(false);
  };

  const handleSaveBranch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editBranch === undefined) {
      toast.error("יש לבחור אגף", toastConfig);
      return;
    }
    setIsSaving(true);
    try {
      const response = await patchItemInList("People", { BranchId: editBranch }, person.ID, "*");
      if (response.status === 204) {
        const branchTitle = branches?.find((b) => b.ID === editBranch)?.Title ?? "";
        setPeopleData((prev) =>
          prev.map((p) =>
            p.ID === person.ID
              ? { ...p, Branch: { id: editBranch, Title: branchTitle } }
              : p,
          ),
        );
        toast.success("האגף עודכן בהצלחה", toastConfig);
        setIsEditing(false);
      } else {
        toast.error("אירעה שגיאה בעדכון האגף", toastConfig);
      }
    } catch {
      toast.error("אירעה שגיאה בעדכון האגף", toastConfig);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditBranch(person.Branch?.id);
    setIsEditing(false);
  };

  return (
    <div className="person-item">
      <div
        className={`person-item__right${isEditing ? " person-item__right--editing" : ""}`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        <div className="person-item__right__title">
          <span className="person-item__right__title__name">
            {person.Title} {person.LastName}
          </span>
          <span className="person-item__right__title__army-id">
            {person.ArmyId}
          </span>
        </div>

        {isEditing ? (
          <div className="person-item__edit-row" onClick={(e) => e.stopPropagation()}>
            <Select
              showSearch
              value={editBranch}
              placeholder="בחר אגף"
              onChange={(val: number) => setEditBranch(val)}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={branches?.map((b) => ({ value: b.ID, label: b.Title }))}
              className="person-item__edit-select"
            />
            <Button
              className="person-item__save-btn"
              onClick={handleSaveBranch}
              loading={isSaving}
              size="small"
            >
              שמור
            </Button>
            <Button
              className="person-item__cancel-btn"
              onClick={handleCancelEdit}
              size="small"
              disabled={isSaving}
            >
              ביטול
            </Button>
          </div>
        ) : (
          <div className="person-item__subtitle">
            <span className="person-item__subtitle__branch">
              אגף:{" "}
              {person.Branch?.Title ?? (
                <span className="person-item__subtitle__branch--empty">לא משויך</span>
              )}
            </span>
          </div>
        )}
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
