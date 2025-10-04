import axios, { AxiosResponse } from "axios";

export interface UserData {
    success: boolean;
    first_name: string;
    last_name: string;
    role: string;
}

export const getUserProfile = async (): Promise<UserData | null> => {
    try {
        const res: AxiosResponse<UserData> = await axios.get("http://localhost:8000/api/profile/", {
            withCredentials: true
        });

        if (res.data.success) {
            return res.data;
        }
        return null;
    } catch (err) {
        console.error("Error fetching profile:", err);
        return null;
    }
};
