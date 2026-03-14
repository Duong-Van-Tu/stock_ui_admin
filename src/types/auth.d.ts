type LoginPayload = {
  username: string;
  password: string;
};

type LoginUser = {
  id: number;
  username: string;
  fullname: string;
  role_type: string;
  accesstoken: string;
  refreshtoken: string;
  expires_in: number;
  refresh_expires_in: number;
};

type ApiResponse<TData> = {
  message: string;
  data: TData;
  statusCode: number;
};
