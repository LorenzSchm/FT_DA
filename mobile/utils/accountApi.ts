import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export type UserResponse = {
    id: string;
    display_name?: string | null;
    email: string;
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
    refresh_token: string;
    access_token?: string;
};

export async function updateAccount({
    email,
    display_name,
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
            refresh_token,
        },
        { headers },
    );

    return response;
}
