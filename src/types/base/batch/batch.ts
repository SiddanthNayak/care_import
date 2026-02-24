export interface BatchRequestBody {
  requests: Array<{
    url: string;
    method: string;
    reference_id?: string;
    body?: unknown;
  }>;
}

export interface BatchRequestResponse<T> {
  results: Array<{
    status: number;
    data?: T;
  }>;
}
