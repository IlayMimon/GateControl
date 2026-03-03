import axios, { AxiosResponse } from "axios";

type SPPageResponse<T> = {
  d: {
    results: T[];
    __next?: string;
  };
};

/**
 * SharePoint returns absolute URLs in `d.__next`, but our requests must go
 * through the Vite proxy (dev) or the SharePoint-relative path (prod).
 * Extracting the `/_api/...` portion keeps auth working in both environments.
 */
function toRelativeApiUrl(url: string): string {
  const idx = url.indexOf("/_api");
  return idx >= 0 ? url.slice(idx) : url;
}

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
    nextUrl = __next ? toRelativeApiUrl(__next) : undefined;
  }

  return accumulated;
};

export default fetchAllSharePointPages;
