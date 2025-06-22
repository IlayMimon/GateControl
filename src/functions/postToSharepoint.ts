import axios from 'axios';
import { SharepointQueryResult } from '../types/spFetchTypes';

type GetContextWebInformation = {
  __metadata: {
    type: 'SP.ContextWebInformation';
  };
  FormDigestTimeoutSeconds: number;
  FormDigestValue: string;
  LibraryVersion: string;
  SiteFullUrl: string;
  SupportedSchemaVersions: {
    __metadata: {
      type: 'Collection(Edm.String)';
    };
    results: string[];
  };
  WebFullUrl: string;
};

type FormDigest = {
  sitePrefix: string;
  value: string;
  expiresIn: Date;
};

let requestDigest: FormDigest | null = null;

export const postToSharepoint = async <T = unknown>(path: string, body: unknown, method?: string, etag?: string) => {
  const apiSitePrefix: string = /^(\/sites\/[^/]+)\/_api/g.exec(path)?.[1] || '';
  // if the digest was never initialized, the prefix is not the same, or there is 5 minutes or less to the digest to expire, create a new one
  if (
    !requestDigest ||
    apiSitePrefix !== requestDigest.sitePrefix ||
    requestDigest.expiresIn <= new Date(Date.now() - 5 * 60 * 1000)
  ) {
    await getRequestDigest(apiSitePrefix);
  }

  const response = axios.post<T>(path, body, {
    headers: {
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': requestDigest!.value,
      'X-HTTP-Method': method || 'POST',
      'IF-MATCH': etag || '',
    },
  });
  return response;
};

export const addItemToList = async <T = unknown>(listTitle: string, body: object) => {
  const listPath = `/_api/web/lists/getbytitle('${listTitle}')`;

  return postToSharepoint<T>(`${listPath}/items`, body);
};

export const removeItemFromLsit = async <T = unknown>(listTitle: string, id: number, etag: string) => {
  const listPath = `/_api/web/lists/getbytitle('${listTitle}')`;

  return postToSharepoint<T>(`${listPath}/items(${id})`, null, 'DELETE', etag);
};

export const patchItemInList = async <T = unknown>(listTitle: string, body: object, id: number, etag: string) => {
  const listPath = `/_api/web/lists/getbytitle('${listTitle}')`;

  return postToSharepoint<T>(`${listPath}/items(${id})`, body, 'MERGE', etag);
};

const getRequestDigest = async (sitePrefix: string) => {
  const contextInfoRequestUrl = sitePrefix + '/_api/contextInfo';
  const { data } =
    await axios.post<SharepointQueryResult<{ GetContextWebInformation: GetContextWebInformation }>>(
      contextInfoRequestUrl
    );

  const ContextWebInformation = data.d.GetContextWebInformation;

  requestDigest = {
    sitePrefix,
    value: ContextWebInformation.FormDigestValue,
    expiresIn: new Date(Date.now() + ContextWebInformation.FormDigestTimeoutSeconds * 1000),
  };
};