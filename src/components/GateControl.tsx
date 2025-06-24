import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Input } from "antd";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoDataPicture from "../assets/pictures/no-data.png";
import { useGateControlContext } from "../context/GateControlContext";
import PersonItem from "./PersonItem";

const { Search } = Input;

interface IGateControlProps {
  mode: "action" | "status";
}

function GateControl({ mode }: IGateControlProps) {
  const { peopleData, peopleIsLoading } = useGateControlContext();
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

  const filteredData = useMemo(() => {
    let data =
      mode === "status" && location
        ? peopleData?.filter((person) => person.Location === location)
        : peopleData;

    if (searchValue && searchValue.length > 3) {
      data = data?.filter((person) => person.ArmyId.includes(searchValue));
    }

    return data;
  }, [mode, location, peopleData, searchValue]);

  return (
    <div className="gate-control">
      <Search
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="הכנס מספר אישי"
      />
      <div className="gate-control__list">
        {peopleIsLoading ? (
          <div className="gate-control__loading">
            <DotLottieReact
              src="https://lottie.host/8026cb7a-061a-44af-948e-22d13b9e55a7/TXtEMrjcEY.lottie"
              loop
              autoplay
            />
          </div>
        ) : filteredData?.length ? (
          filteredData
            .slice(0, 20)
            .map((person) => (
              <PersonItem key={person.ID} person={person} mode={mode} />
            ))
        ) : (
          <div className="gate-control__no-data">
            <img src={NoDataPicture} alt="No data" />
            <span>אין מידע</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GateControl;
