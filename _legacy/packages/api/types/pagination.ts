export enum sortEnum {
  asc = "asc",
  desc = "desc"
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  s?: string;
  sort?: sortEnum;
}

export interface Paginated<T> {
  page: number;
  totalPages: number;
  items: T[];
  sort?: sortEnum;
  total?: number;
  limit?: number;
}
