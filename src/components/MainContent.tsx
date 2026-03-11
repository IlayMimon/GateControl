import BoxPreview from "./BoxPreview";
import GateControl from "./GateControl";

interface MainContentProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

function MainContent({ searchValue, onSearchChange }: MainContentProps) {
  return (
    <div className="main-content">
      <BoxPreview title="כניסה \ יציאה">
        <GateControl
          mode="action"
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />
      </BoxPreview>
      <BoxPreview title="נמצאים כעת במתקן">
        <GateControl mode="status" searchValue={searchValue} />
      </BoxPreview>
    </div>
  );
}

export default MainContent;
