import axios, { AxiosRequestConfig } from 'axios';
import { objectToQueryString } from '@/utils/common';
import Cookies from 'js-cookie';

export class ApiFetcher {
  static defaultHeaders = {
    'Content-Type': 'application/json'
  };

  public readonly apiUrl: string;

  constructor(host: string) {
    this.apiUrl = host;
  }

  static getToken() {
    return typeof window !== 'undefined' ? Cookies.get('access_token') : null;
  }

  static async request(url: string, options: AxiosRequestConfig) {
    const token = ApiFetcher.getToken();
    const headersWithToken = {
      ...ApiFetcher.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` })
    };

    return axios({
      url,
      ...options,
      headers: { ...headersWithToken, ...options.headers }
    })
      .then((response) => response.data)
      .catch((error) => {
        throw error.response || error;
      });
  }

  async get(
    url: string,
    {
      query = {},
      ...options
    }: AxiosRequestConfig & { query?: Record<string, any> } = {}
  ) {
    const fullUrl = url.startsWith('http')
      ? url
      : `${this.apiUrl}/${url}${objectToQueryString(query)}`;

    return ApiFetcher.request(fullUrl, {
      method: 'GET',
      ...options
    });
  }

  async post(
    url: string,
    data: Record<string, any> = {},
    options: AxiosRequestConfig = {}
  ) {
    const fullUrl = url.startsWith('http') ? url : `${this.apiUrl}/${url}`;
    return ApiFetcher.request(fullUrl, {
      method: 'POST',
      data,
      ...options
    });
  }

  async put(
    url: string,
    data: Record<string, any> = {},
    options: AxiosRequestConfig = {}
  ) {
    const fullUrl = url.startsWith('http') ? url : `${this.apiUrl}/${url}`;
    return ApiFetcher.request(fullUrl, {
      method: 'PUT',
      data,
      ...options
    });
  }

  async patch(
    url: string,
    data: Record<string, any> = {},
    options: AxiosRequestConfig = {}
  ) {
    const fullUrl = url.startsWith('http') ? url : `${this.apiUrl}/${url}`;
    return ApiFetcher.request(fullUrl, {
      method: 'PATCH',
      data,
      ...options
    });
  }

  async delete(url: string, options: AxiosRequestConfig = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.apiUrl}/${url}`;
    return ApiFetcher.request(fullUrl, {
      method: 'DELETE',
      ...options
    });
  }
}
