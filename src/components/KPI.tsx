interface IKPIProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}
function KPI({ title, value, icon }: IKPIProps) {
  return (
    <div className="kpi">
      <span className="kpi__title">
        {title} - {value}
      </span>
      <span  className="kpi__icon">{icon}</span>
    </div>
  );
}

export default KPI;
