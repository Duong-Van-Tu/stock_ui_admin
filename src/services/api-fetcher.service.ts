import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { API_CONTENT_TYPES, API_HEADERS } from '../constants/api.constants';
import { getAccessToken } from '../utils/auth.util';
import { objectToQueryString } from '../utils/query-string.util';

type RequestOptions = AxiosRequestConfig & {
  query?: QueryParams;
};

export class ApiFetcher {
  static defaultHeaders = {
    [API_HEADERS.contentType]: API_CONTENT_TYPES.json,
  };

  public readonly apiUrl: string;

  constructor(host: string) {
    this.apiUrl = host;
  }

  static getToken() {
    return getAccessToken();
  }

  static async request<TResponse = unknown>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<TResponse> {
    const token = ApiFetcher.getToken();
    const headersWithToken = {
      ...ApiFetcher.defaultHeaders,
      ...(token && { [API_HEADERS.authorization]: `Bearer ${token}` }),
    };

    return axios({
      url,
      ...options,
      headers: { ...headersWithToken, ...options.headers },
    })
      .then((response) => response.data as TResponse)
      .catch((error) => {
        throw error.response || error;
      });
  }

  async get<TResponse = unknown>(
    url: string,
    { query = {}, ...options }: RequestOptions = {}
  ): Promise<TResponse> {
    const fullUrl = url.startsWith('http')
      ? url
      : `${this.apiUrl}/${url}${objectToQueryString(query)}`;

    return ApiFetcher.request<TResponse>(fullUrl, {
      method: 'GET',
      ...options,
    });
  }

  async post<TResponse = unknown>(
    url: string,
    data: Record<string, unknown> = {},
    options: AxiosRequestConfig = {}
  ): Promise<TResponse> {
    const fullUrl = url.startsWith('http') ? url : `${this.apiUrl}/${url}`;

    return ApiFetcher.request<TResponse>(fullUrl, {
      method: 'POST',
      data,
      ...options,
    });
  }

  async put<TResponse = unknown>(
    url: string,
    data: Record<string, unknown> = {},
    options: AxiosRequestConfig = {}
  ): Promise<TResponse> {
    const fullUrl = url.startsWith('http') ? url : `${this.apiUrl}/${url}`;

    return ApiFetcher.request<TResponse>(fullUrl, {
      method: 'PUT',
      data,
      ...options,
    });
  }

  async patch<TResponse = unknown>(
    url: string,
    data: Record<string, unknown> = {},
    options: AxiosRequestConfig = {}
  ): Promise<TResponse> {
    const fullUrl = url.startsWith('http') ? url : `${this.apiUrl}/${url}`;

    return ApiFetcher.request<TResponse>(fullUrl, {
      method: 'PATCH',
      data,
      ...options,
    });
  }

  async delete<TResponse = unknown>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<TResponse> {
    const fullUrl = url.startsWith('http') ? url : `${this.apiUrl}/${url}`;

    return ApiFetcher.request<TResponse>(fullUrl, {
      method: 'DELETE',
      ...options,
    });
  }
}
