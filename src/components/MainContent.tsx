import BoxPreview from "./BoxPreview";
import GateControl from "./GateControl";

function MainContent() {
  return (
    <div className="main-content">
      <BoxPreview title="כניסה \ יציאה">
        <GateControl mode="action" />
      </BoxPreview>
      <BoxPreview title="נמצאים כעת במתקן">
        <GateControl mode="status" />
      </BoxPreview>
    </div>
  );
}

export default MainContent;
