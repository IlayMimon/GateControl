import { Input } from "antd";
import useGetPeople from "../hooks/data/useGetPeople";
import { useState } from "react";
import PersonItem from "./PersonItem";
import { useSearchParams } from "react-router-dom";

const { Search } = Input;

interface IGateControlProps {
  mode: "action" | "status";
}

function GateControl({ mode }: IGateControlProps) {
  const { data } = useGetPeople();
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

  let filteredData =
    mode === "status" && location
      ? data?.filter((person) => person.Location.includes(location))
      : data;

  filteredData = searchValue
    ? filteredData?.filter((person) => person.ArmyId.includes(searchValue))
    : filteredData;

  return (
    <div className="gate-control">
      <Search
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="הכנס מספר אישי"
      />
      {filteredData?.length ? (
        filteredData.map((person) => <PersonItem person={person} mode={mode} />)
      ) : (
        <div className="gate-control__no-data">אין נתונים</div>
      )}
    </div>
  );
}

export default GateControl;
