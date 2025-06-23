import { useSearchParams } from 'react-router-dom';

interface ILocationItemProps {
  title: string;
}

function LocationItem({ title }: ILocationItemProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = () => {
    // Create a new set of params based on the existing ones
    const newParams = new URLSearchParams(searchParams);
    newParams.set('location', title);
    setSearchParams(newParams);
  };

  return (
    <div
      className="location-item"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {title}
    </div>
  );
}

export default LocationItem;
