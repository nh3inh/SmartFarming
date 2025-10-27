"use client"

import React, { useEffect, useState } from "react";
import { getUserProfile, UserData } from "@/services/userService";
import Footer from "@/app/layout/Footer";
import Navbar from "@/app/layout/Navbar";

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserProfile();
            if (userData) setUser(userData);
        };
        fetchUser();
    }, []);

    if (!user) return <div>Loading...</div>;


    const avatar = user
        ? user.last_name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
        : "";

    const roleMap: Record<string, string> = {
        user: "Nông dân",
        admin: "Quản trị viên",
    };
    const roleName = roleMap[user.role] || user.role;

    return (
        <div className="">
            <Navbar />
            <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center", fontFamily: "Arial" }}>
                <div
                    style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        backgroundColor: "#4caf50",
                        color: "white",
                        fontSize: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px auto",
                    }}
                >
                    {avatar}
                </div>
                <h2>{user.first_name} {user.last_name}</h2>
                <p style={{ fontSize: "18px", color: "#555" }}>{roleName}</p>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
