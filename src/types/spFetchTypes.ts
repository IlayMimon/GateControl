export type SharepointQueryResult<T = unknown> = {
  d: T;
};

export type SharepointQueryResultArray<T = unknown> = SharepointQueryResult<{ results: T[] }>;
