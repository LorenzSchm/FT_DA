import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "@/utils/authStore";

// Use the same API base URL strategy as authStore
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export type FinanceAccount = {
  id: string;
  user_id: string;
  name: string;
  institution?: string | null;
  currency: string;
  kind: string;
  ext_conn_id?: string | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GetAccountsResponse = {
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  };
  rows: FinanceAccount[];
};

class FinanceService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({ baseURL: API_URL });
  }

  // Fetch all accounts for the currently logged-in user
  async getAccounts(): Promise<FinanceAccount[]> {
    const { session } = useAuthStore.getState();
    if (!session?.access_token) {
      throw new Error("Not authenticated: missing access token");
    }

    try {
      const res = await this.client.get<GetAccountsResponse>(`/finance`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      return res.data.rows ?? [];
    } catch (error: any) {
      const message = error?.response?.data?.detail || "Failed to load accounts";
      throw new Error(message);
    }
  }
}

export const financeService = new FinanceService();
export default FinanceService;
