import axios, { AxiosRequestConfig, Method, RawAxiosRequestHeaders } from 'axios';
// should only be used directly for non-GET request methods.
const httpRequest = async <T, B = unknown>(
  url: string,
  method: Method = 'GET',
  data?: B | undefined,
  headers?: RawAxiosRequestHeaders
) => {
  const config: AxiosRequestConfig = { url, method, data, headers };

  return await axios<T>(config).then((response) => {
    return response.data;
  });
};

export default httpRequest;
