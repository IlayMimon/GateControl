type ITimeDeviationProps = {
  value: number;
};

const getBackgroundColor = (value: number): string => {
  const abs = Math.abs(value);

  switch (true) {
    case abs < 10:
      return "green";
    case abs <= 20:
      return "yellow";
    default:
      return "red";
  }
};

const TimeDeviation = ({ value }: ITimeDeviationProps) => {
  const backgroundColor = getBackgroundColor(value);

  return <div className={`time-deviation time-deviation--${backgroundColor}`}>{value}</div>;
};

export default TimeDeviation;
