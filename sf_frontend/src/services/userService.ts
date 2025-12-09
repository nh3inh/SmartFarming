import axios, { AxiosResponse } from "axios";

export interface UserData {
    id: number;
    success: boolean;
    first_name: string;
    last_name: string;
    role: string;
}

export const getUserProfile = async (): Promise<UserData | null> => {
    try {
        const res: AxiosResponse<UserData> = await axios.get("https://tlrice.space/api/profile/", {
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

export const logoutUser = async (): Promise<boolean> => {
    try {
        const res: AxiosResponse = await axios.post("https://tlrice.space/api/auth/logout/",
            {},
            { withCredentials: true }
        );

        if (res.status === 200 && res.data.success) {
            return true;
        }
        console.warn("Logout failed:", res.data);
        return false;
    } catch (err) {
        console.error("Error during logout:", err);
        return false;
    }
};
