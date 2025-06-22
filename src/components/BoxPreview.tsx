interface IBoxPreviewProps {
  title: string;
  children: React.ReactNode;
}
function BoxPreview({ title, children }: IBoxPreviewProps) {
  return (
    <div className="box-preview">
      <h2 className="box-preview__title">{title}</h2>
      <div className="box-preview__content">{children}</div>
    </div>
  );
}

export default BoxPreview;
