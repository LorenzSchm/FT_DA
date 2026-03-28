import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export type UserResponse = {
  id: string;
  display_name?: string | null;
  email: string;
  currency?: string | null;
};

export async function getAccount(access_token?: string) {
  const headers: Record<string, string> = {};
  if (access_token) {
    headers["Authorization"] = `Bearer ${access_token}`;
  }

  const response = await axios.get<UserResponse>(`${API_BASE_URL}/account/`, {
    headers,
  });

  return response;
}

type UpdateAccountParams = {
  email: string;
  display_name: string;
  currency?: string;
  refresh_token: string;
  access_token?: string;
};

export async function updateAccount({
  email,
  display_name,
  currency,
  refresh_token,
  access_token,
}: UpdateAccountParams) {
  const headers: Record<string, string> = {};
  if (access_token) {
    headers["Authorization"] = `Bearer ${access_token}`;
  }

  const response = await axios.patch(
    `${API_BASE_URL}/account/`,
    {
      email,
      display_name,
      currency,
      refresh_token,
    },
    { headers },
  );

  return response;
}

type ChangePasswordParams = {
  access_token: string;
  refresh_token: string;
};

export async function changePassword({
  access_token,
  refresh_token,
}: ChangePasswordParams) {
  const response = await axios.post(
    `${API_BASE_URL}/auth/reset-password`,
    {},
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "x-refresh-token": refresh_token,
      },
    },
  );

  return response;
}

type ConfirmResetPasswordParams = {
  email: string;
  otp: string;
  new_password: string;
};

export async function confirmResetPassword({
  email,
  otp,
  new_password,
}: ConfirmResetPasswordParams) {
  const response = await axios.post(
    `${API_BASE_URL}/auth/confirm-reset-password`,
    { email, otp, new_password },
  );

  return response;
}

export type AiFlagResponse = {
  ai_flag: boolean;
};

export async function getAiFlag(access_token?: string): Promise<boolean> {
  const headers: Record<string, string> = {};
  if (access_token) {
    headers["Authorization"] = `Bearer ${access_token}`;
  }

  const response = await axios.get<AiFlagResponse>(
    `${API_BASE_URL}/account/ai-flag`,
    { headers },
  );

  return response.data.ai_flag;
}

export async function updateAiFlag(
  enabled: boolean,
  access_token?: string,
  refresh_token?: string,
): Promise<boolean> {
  const headers: Record<string, string> = {};
  if (access_token) {
    headers["Authorization"] = `Bearer ${access_token}`;
  }
  if (refresh_token) {
    headers["x-refresh-token"] = refresh_token;
  }

  const response = await axios.patch<AiFlagResponse>(
    `${API_BASE_URL}/account/ai-flag`,
    { ai_flag: enabled },
    { headers },
  );

  return response.data.ai_flag;
}
