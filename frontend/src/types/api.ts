/** Shared API envelope and pagination types used across features. */

/** Standard paginated list response returned by list endpoints. */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Sort direction shared by list endpoints. */
export type SortDirection = 'asc' | 'desc';

/** Generic option shape used to populate select / radio inputs. */
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}
