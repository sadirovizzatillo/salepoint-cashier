import { createFetcher, BASE_URL } from './client';

const fetch = createFetcher(BASE_URL);

export interface ApiCategory {
  id: string;
  name: string;
}

export const getCategories = () =>
  fetch<ApiCategory[] | { data: ApiCategory[] }>('/categories').then((res) =>
    Array.isArray(res) ? res : res.data
  );
