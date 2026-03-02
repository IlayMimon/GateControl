import { Button, Select } from "antd";
import { useEffect, useRef, useState } from "react";
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

  const [editingField, setEditingField] = useState<"name" | "armyId" | null>(null);
  const [editName, setEditName] = useState("");
  const [editArmyId, setEditArmyId] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const armyIdInputRef = useRef<HTMLInputElement>(null);

  const [searchParams] = useSearchParams();
  //TODO fix location logic in multiple places, maybe move it to context or create a custom hook for it
  const tempLocation = searchParams.get("location") as 'פד"ם' | "מצודת האבות";
  const location = tempLocation === "מצודת האבות" ? "גני יעלים" : tempLocation;
  const { branches, setPeopleData } = useGateControlContext();

  useEffect(() => {
    if (editingField === "name" && nameInputRef.current) {
      const input = nameInputRef.current;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (editingField === "armyId" && armyIdInputRef.current) {
      const input = armyIdInputRef.current;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [editingField]);

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
        setEditingField(null);
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
    setEditingField(null);
    setIsEditing(false);
  };

  // ── Inline name edit ──────────────────────────────────────────────────────

  const handleNameClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    setEditName(`${person.Title} ${person.LastName}`.trim());
    setEditingField("name");
  };

  const performNameSave = async () => {
    const trimmed = editName.trim();
    const original = `${person.Title} ${person.LastName}`.trim();
    if (!trimmed || trimmed === original) return;
    const spaceIdx = trimmed.indexOf(" ");
    const newTitle = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const newLastName = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1);
    try {
      const response = await patchItemInList(
        "People",
        { Title: newTitle, LastName: newLastName },
        person.ID,
        "*",
      );
      if (response.status === 204) {
        setPeopleData((prev) =>
          prev.map((p) =>
            p.ID === person.ID ? { ...p, Title: newTitle, LastName: newLastName } : p,
          ),
        );
        toast.success("השם עודכן בהצלחה", toastConfig);
      } else {
        toast.error("אירעה שגיאה בעדכון השם", toastConfig);
      }
    } catch {
      toast.error("אירעה שגיאה בעדכון השם", toastConfig);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performNameSave();
      setEditingField(null);
    } else if (e.key === "Escape") {
      setEditName(`${person.Title} ${person.LastName}`.trim());
      setEditingField(null);
    }
  };

  // ── Inline army ID edit ───────────────────────────────────────────────────

  const handleArmyIdClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    setEditArmyId(person.ArmyId);
    setEditingField("armyId");
  };

  const performArmyIdSave = async () => {
    const trimmed = editArmyId.trim();
    if (!trimmed || trimmed === person.ArmyId) return;
    try {
      const response = await patchItemInList(
        "People",
        { ArmyId: trimmed },
        person.ID,
        "*",
      );
      if (response.status === 204) {
        setPeopleData((prev) =>
          prev.map((p) => (p.ID === person.ID ? { ...p, ArmyId: trimmed } : p)),
        );
        toast.success("מספר אישי עודכן בהצלחה", toastConfig);
      } else {
        toast.error("אירעה שגיאה בעדכון מספר אישי", toastConfig);
      }
    } catch {
      toast.error("אירעה שגיאה בעדכון מספר אישי", toastConfig);
    }
  };

  const handleArmyIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performArmyIdSave();
      setEditingField(null);
    } else if (e.key === "Escape") {
      setEditArmyId(person.ArmyId);
      setEditingField(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="person-item">
      <div
        className={`person-item__right${isEditing ? " person-item__right--editing" : ""}`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        <div className="person-item__right__title">
          {editingField === "name" ? (
            <input
              ref={nameInputRef}
              className="person-item__inline-input person-item__inline-input--name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={() => { performNameSave(); setEditingField(null); }}
            />
          ) : (
            <span
              className="person-item__right__title__name"
              onClick={handleNameClick}
            >
              {person.Title} {person.LastName}
            </span>
          )}

          {editingField === "armyId" ? (
            <input
              ref={armyIdInputRef}
              className="person-item__inline-input person-item__inline-input--army-id"
              type="tel"
              inputMode="numeric"
              value={editArmyId}
              onChange={(e) => setEditArmyId(e.target.value)}
              onKeyDown={handleArmyIdKeyDown}
              onBlur={() => { performArmyIdSave(); setEditingField(null); }}
            />
          ) : (
            <span
              className="person-item__right__title__army-id"
              onClick={handleArmyIdClick}
            >
              {person.ArmyId}
            </span>
          )}
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
