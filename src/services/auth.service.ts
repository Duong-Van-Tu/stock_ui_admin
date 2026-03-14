import { apiService } from './api.service';

export const authService = {
  login(payload: LoginPayload) {
    return apiService.post<ApiResponse<LoginUser>>('users/login', payload);
  },
};
