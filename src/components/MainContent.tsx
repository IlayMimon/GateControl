import { useState } from "react";
import BoxPreview from "./BoxPreview";
import GateControl from "./GateControl";

function MainContent() {
  const [searchValue, setSearchValue] = useState<string | undefined>();

  return (
    <div className="main-content">
      <BoxPreview title="כניסה \ יציאה">
        <GateControl
          mode="action"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
      </BoxPreview>
      <BoxPreview title="נמצאים כעת במתקן">
        <GateControl mode="status" searchValue={searchValue} />
      </BoxPreview>
    </div>
  );
}

export default MainContent;
