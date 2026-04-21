export interface ApiCallOptions {
  showToaster: boolean;
  showLoader: boolean;
}
export interface ResponseBody {
  count: number;
  next?: any;
  previous?: any;
  results?: any;
}

export interface HTTPPostResponse {
  message: string;
  status: string;
  statusCode: number;
}
