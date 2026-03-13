import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button, Input, InputRef, Select } from "antd";
import { useRef, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoDataPicture from "../assets/pictures/no-data.png";
import { useGateControlContext } from "../context/GateControlContext";
import useGetActions from "../hooks/data/useGetActions";
import { exportPeopleToExcel } from "../functions/exportToExcel";
import PersonItem from "./PersonItem";
import { AddPersonForm } from "./AddPersonForm";
import { IoDownloadOutline, IoClose } from "react-icons/io5";

const { Search } = Input;

interface IGateControlProps {
  mode: "action" | "status";
  searchValue: string | undefined;
  onSearchChange?: (val: string) => void;
}

function GateControl({ mode, searchValue, onSearchChange }: IGateControlProps) {
  const { peopleData, peopleIsLoading } = useGateControlContext();
  const [addingPerson, setAddingPerson] = useState<boolean>(false);
  const [wingFilter, setWingFilter] = useState<string | undefined>();
  const [initialArmyId, setInitialArmyId] = useState<string | undefined>();
  const searchRef = useRef<InputRef>(null);
  const [searchParams] = useSearchParams();
  //TODO fix location logic in multiple places, maybe move it to context or create a custom hook for it
  let location = searchParams.get("location");
  if (location === "מצודת האבות") {
    location = "גני יעלים";
  }
  const { branches } = useGateControlContext();
  const { data: actionsData } = useGetActions(true);

  const filteredData = useMemo(() => {
    let data =
      mode === "status" && location
        ? peopleData?.filter((person) => person.Location === location)
        : peopleData;

    if (searchValue && searchValue.length > 3) {
      data = data?.filter((person) => person.ArmyId.includes(searchValue));
    }

    if (mode === "status" && wingFilter) {
      data = data?.filter((person) => person.Branch?.Title === wingFilter);
    }

    return data;
  }, [mode, location, peopleData, searchValue, wingFilter]);

  const handleExport = () => {
    if (!filteredData || !location) return;
    exportPeopleToExcel(filteredData, location, actionsData ?? []);
  };

  const handleActionComplete = () => {
    onSearchChange?.("");
    searchRef.current?.focus();
  };

  return (
    <div className="gate-control">
      {mode === "action" && (
        <Search
          ref={searchRef}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="הכנס מספר אישי / ת.ז"
          maxLength={9}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      )}

      {mode === "status" && (
        <div className="gate-control__toolbar">
          <Select
            value={wingFilter}
            placeholder="סנן לפי אגף"
            onChange={(val: string | undefined) => setWingFilter(val)}
            options={branches?.map((b) => ({ value: b.Title, label: b.Title }))}
            className="gate-control__wing-filter"
          />
          {wingFilter && (
            <button
              className="gate-control__filter-clear-btn"
              onClick={() => setWingFilter(undefined)}
            >
              <IoClose />
              נקה
            </button>
          )}
          <Button
            className="gate-control__export-btn"
            onClick={handleExport}
            icon={<IoDownloadOutline />}
          >
            יצוא לאקסל
          </Button>
        </div>
      )}

      <div className="gate-control__list">
        {peopleIsLoading ? (
          <div className="gate-control__loading">
            <DotLottieReact
              src="/loading.lottie"
              loop
              autoplay
            />
          </div>
        ) : filteredData?.length ? (
          filteredData
            .slice(0, 20)
            .map((person) => (
              <PersonItem
                key={person.ID}
                person={person}
                mode={mode}
                onActionComplete={handleActionComplete}
                searchValue={searchValue}
              />
            ))
        ) : (
          <div className="gate-control__no-data">
            {!addingPerson ? (
              <>
                {mode === "action" && (
                  <div className="gate-control__no-data-action">
                    <button
                      className="gate-control__no-data-button"
                      onClick={() => {
                        setInitialArmyId(searchValue);
                        setAddingPerson(true);
                      }}
                    >
                      להוספה לחצ/י
                    </button>
                  </div>
                )}
                <img src={NoDataPicture} alt="No data" />
                <span>אין מידע</span>
              </>
            ) : (
              <AddPersonForm
                branches={branches || []}
                onCancel={() => setAddingPerson(false)}
                initialArmyId={initialArmyId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GateControl;
