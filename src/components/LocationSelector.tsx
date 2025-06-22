import LocationItem from "./LocationItem";

interface ILocationSelectorProps {
  titles: string[];
}

function LocationSelector({ titles }: ILocationSelectorProps) {
  return (
    <div className="location-selector">
      {titles.map((title) => (
        <LocationItem key={title} title={title} />
      ))}
    </div>
  );
}

export default LocationSelector;
