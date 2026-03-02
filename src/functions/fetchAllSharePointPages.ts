import axios, { AxiosResponse } from "axios";

type SPPageResponse<T> = {
  d: {
    results: T[];
    __next?: string;
  };
};

/**
 * Fetches all pages from a SharePoint OData endpoint by following the `d.__next`
 * cursor links until there are no more pages.
 * Use this instead of a single $top=4999 request to avoid SPQueryThrottledException.
 */
const fetchAllSharePointPages = async <T>(firstPageUrl: string): Promise<T[]> => {
  const accumulated: T[] = [];
  let nextUrl: string | undefined = firstPageUrl;

  while (nextUrl) {
    const response: AxiosResponse<SPPageResponse<T>> = await axios.get<SPPageResponse<T>>(nextUrl, {
      headers: { Accept: "application/json;odata=verbose" },
    });
    const { results, __next } = response.data.d;
    accumulated.push(...results);
    nextUrl = __next;
  }

  return accumulated;
};

export default fetchAllSharePointPages;
