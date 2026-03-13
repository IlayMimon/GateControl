import { Button, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastOptions } from 'react-toastify';
import preformAction from '../functions/preformAction';
import { patchItemInList } from '../functions/postToSharepoint';
import { Person } from '../hooks/data/useGetPeople';
import { IoPersonAdd, IoPersonRemove } from 'react-icons/io5';
import { useGateControlContext } from '../context/GateControlContext';

interface IPersonItemProps {
  person: Person;
  mode: 'action' | 'status';
  onActionComplete?: () => void;
  searchValue?: string;
}

export const toastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: 'light',
  className: 'toast-notification',
};

function PersonItem({ person, mode, onActionComplete, searchValue }: IPersonItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBranch, setEditBranch] = useState<string | undefined>(
    person.Branch?.Title,
  );
  const [isSaving, setIsSaving] = useState(false);

  // Staged values — only committed to SP when שמור is pressed
  const [editName, setEditName] = useState('');
  const [editArmyId, setEditArmyId] = useState('');
  const [editingField, setEditingField] = useState<'name' | 'armyId' | null>(
    null,
  );

  const nameInputRef = useRef<HTMLInputElement>(null);
  const armyIdInputRef = useRef<HTMLInputElement>(null);

  const [searchParams] = useSearchParams();
  //TODO fix location logic in multiple places, maybe move it to context or create a custom hook for it
  const tempLocation = searchParams.get('location') as 'פד"ם' | 'מצודת האבות';
  const location = tempLocation === 'מצודת האבות' ? 'גני יעלים' : tempLocation;
  const { branches, setPeopleData } = useGateControlContext();

  useEffect(() => {
    if (editingField === 'name' && nameInputRef.current) {
      const input = nameInputRef.current;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (editingField === 'armyId' && armyIdInputRef.current) {
      const input = armyIdInputRef.current;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [editingField]);

  const handleClick = async (actionType: 'inbound' | 'outbound') => {
    setIsLoading(true);

    if (!person.Branch?.Title) {
      toast.error('יש לבחור אגף', toastConfig);
      setIsLoading(false);
      return;
    }

    const response = await preformAction(
      location,
      actionType,
      person.ID,
      person.Branch.id,
    );

    if (response === 'error') {
      toast.error('אירעה שגיאה בביצוע הפעולה', toastConfig);
    } else {
      const updatedPerson = { ...person };
      updatedPerson.Location = actionType === 'inbound' ? location : 'לא נמצא';
      setPeopleData((prev) => [
        updatedPerson,
        ...prev.filter((p) => p.ID !== person.ID),
      ]);
      toast.success('פעולה בוצעה בהצלחה', toastConfig);
      onActionComplete?.();
    }

    setIsLoading(false);
  };

  const enterEditMode = () => {
    setIsEditing(true);
    setEditName(`${person?.Title} ${person?.LastName || ''}`.trim());
    setEditArmyId(person.ArmyId);
    setEditBranch(person.Branch?.Title);
  };

  // Saves branch + any staged name/armyId changes in one PATCH
  const handleSaveAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const selectedBranch = branches?.find((b) => b.Title === editBranch);
    if (!selectedBranch) {
      toast.error('יש לבחור אגף', toastConfig);
      return;
    }

    setIsSaving(true);
    try {
      const originalName = `${person.Title} ${person.LastName}`.trim();
      const nameChanged = editName.trim() !== originalName;
      const armyIdChanged = editArmyId.trim() !== person.ArmyId;

      const body: Record<string, unknown> = { BranchId: selectedBranch.ID };

      if (nameChanged) {
        const spaceIdx = editName.trim().indexOf(' ');
        body.Title =
          spaceIdx === -1
            ? editName.trim()
            : editName.trim().slice(0, spaceIdx);
        body.LastName =
          spaceIdx === -1 ? '' : editName.trim().slice(spaceIdx + 1);
      }
      if (armyIdChanged) {
        body.ArmyId = editArmyId.trim();
      }

      const response = await patchItemInList('People', body, person.ID, '*');

      if (response.status === 204) {
        setPeopleData((prev) =>
          prev.map((p) => {
            if (p.ID !== person.ID) return p;
            return {
              ...p,
              Branch: { id: selectedBranch.ID, Title: selectedBranch.Title },
              ...(nameChanged && {
                Title: body.Title as string,
                LastName: body.LastName as string,
              }),
              ...(armyIdChanged && { ArmyId: body.ArmyId as string }),
            };
          }),
        );
        toast.success('השינויים נשמרו בהצלחה', toastConfig);
        setEditingField(null);
        setIsEditing(false);
      } else {
        toast.error('אירעה שגיאה בשמירה', toastConfig);
      }
    } catch {
      toast.error('אירעה שגיאה בשמירה', toastConfig);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditBranch(person.Branch?.Title);
    setEditingField(null);
    setIsEditing(false);
  };

  // ── Inline field handlers — close only, no save ───────────────────────────

  const handleNameClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    setEditingField('name');
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditingField(null);
    } else if (e.key === 'Escape') {
      setEditName(`${person.Title} ${person.LastName}`.trim());
      setEditingField(null);
    }
  };

  const handleArmyIdClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    setEditingField('armyId');
  };

  const handleArmyIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditingField(null);
    } else if (e.key === 'Escape') {
      setEditArmyId(person.ArmyId);
      setEditingField(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="person-item">
      <div
        className={`person-item__right${isEditing ? ' person-item__right--editing' : ''}`}
        onClick={() => !isEditing && enterEditMode()}
      >
        {mode === 'action' && person.Location !== 'לא נמצא' && person.Location !== location && (searchValue?.length ?? 0) >= 4 && (
          <span className="person-item__location-tag">
            לא דווח יציאה מ{person.Location === 'גני יעלים' ? 'מצודת האבות' : person.Location}
          </span>
        )}
        <div className="person-item__right__title">
          {editingField === 'name' ? (
            <input
              ref={nameInputRef}
              className="person-item__inline-input person-item__inline-input--name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={() => setEditingField(null)}
            />
          ) : (
            <span
              className="person-item__right__title__name"
              onClick={handleNameClick}
            >
              {isEditing
                ? editName
                : `${person?.Title} ${person?.LastName || ''}`}
            </span>
          )}

          {editingField === 'armyId' ? (
            <input
              ref={armyIdInputRef}
              className="person-item__inline-input person-item__inline-input--army-id"
              type="tel"
              inputMode="numeric"
              value={editArmyId}
              onChange={(e) => setEditArmyId(e.target.value)}
              onKeyDown={handleArmyIdKeyDown}
              onBlur={() => setEditingField(null)}
            />
          ) : (
            <span
              className="person-item__right__title__army-id"
              onClick={handleArmyIdClick}
            >
              {isEditing ? editArmyId : person.ArmyId}
            </span>
          )}

          {/* {!isEditing && mode === 'action' && person.Location && person.Location !== 'לא נמצא' && (
            <span className="person-item__location-tag">
              <span className="person-item__location-tag__name">{person.Location}</span>
              <IoLocationSharp className="person-item__location-tag__icon" />
            </span>
          )} */}
        </div>

        {isEditing ? (
          <div
            className="person-item__edit-row"
            onClick={(e) => e.stopPropagation()}
          >
            <Select
              showSearch
              value={editBranch}
              placeholder={person.Branch?.Title ?? 'בחר אגף'}
              onChange={(val: string) => setEditBranch(val)}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={branches?.map((b) => ({
                value: b.Title,
                label: b.Title,
              }))}
              className="person-item__edit-select"
            />
            <Button
              className="person-item__save-btn"
              onClick={handleSaveAll}
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
              אגף:{' '}
              {person.Branch?.Title ?? (
                <span className="person-item__subtitle__branch--empty">
                  לא משויך
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {mode === 'status' && (
        <div className="person-item__status">
          <span className="person-item__status__text">נמצא במתקן</span>
        </div>
      )}
      {mode === 'action' && (
        <div className="person-item__left">
          <Button
            className="person-item__left__enter-button"
            onClick={() => handleClick('inbound')}
            disabled={isLoading || person?.Location === location}
          >
            <IoPersonAdd style={{ marginLeft: '2px' }} />
            כניסה
          </Button>
          <Button
            className="person-item__left__exit-button"
            onClick={() => handleClick('outbound')}
            disabled={isLoading || person?.Location !== location}
          >
            <IoPersonRemove style={{ marginLeft: '2px' }} />
            יציאה
          </Button>
        </div>
      )}
    </div>
  );
}

export default PersonItem;
