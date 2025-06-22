import { useQueryFetchRequest } from "../hooks/useQueryFetch";
import { SharepointQueryResultArray } from "../types/spFetchTypes";

interface IExample {
  something: string;
}

const Example = () => {
  const { data } = useQueryFetchRequest<SharepointQueryResultArray<IExample>>(
    "/_api/web/lists/getbytitle('example')/items"
  );

  return (
    <div>
      <h1>Example Component</h1>
      {data?.d.results.map(({ something }) => <div>{something}</div>)}
    </div>
  );
};

export default Example;
