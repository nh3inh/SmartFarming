"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import { Map, Cpu, Bot, Thermometer, Droplet, SunMedium } from "lucide-react";
import { getUserProfile, UserData } from "@/services/userService";
import { useRouter } from "next/navigation";

interface CornfieldData {
    id: number;
    farmer: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    cornfield: {
        id: number;
        type: string;
        geometry: string;
        properties: {
            name: string;
            owner: number;
            area_m2: number;
            created_at: string;
            updated_at: string;
        };
    };
    timestamp: string;
    disease_class: string;
    confidence: number;
    ms: number;
    image_rel?: string;
    gps_fix: boolean;
    gps_lat: number;
    gps_lon: number;
    gps_alt: number;
    gps_time: string;
    gps_source: string;
    env_ok: boolean;
    env_time: string;
    env_port: string;
    env_source: string;
    temp: number;
    hum: number;
    ph: number;
    soil: number;
    wind: number;
    wind_avg: number;
    lux: number;
    status: number;
    created_at: string;
    updated_at: string;
}

const diseaseColorMap: Record<string, string> = {
    healthy: "#33CC00",
    blast: "#FF9900",
    brown_spot: "#fb00ffff",
    bacterial_leaf_blight: "#CC3366",
};

const DISEASE_MAP: Record<string, string> = {
    bacterial_leaf_blight: "Cháy bìa lá",
    blast: "Đạo ôn",
    brown_spot: "Đốm nâu",
    healthy: "Khỏe mạnh"
};

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [fields, setFields] = useState<CornfieldData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getUserProfile();
            if (userData) setUser(userData);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/info/my-field/`,
                { credentials: "include" }
            );
            const json = await res.json();
            setFields(json.data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;

    const avatar = user
        ? user.last_name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
        : "";

    const roleMap: Record<string, string> = { user: "Nông dân", admin: "Quản trị viên" };
    const roleName = roleMap[user?.role || ""] || "";
    const router = useRouter();
    const totalArea = fields.reduce((sum, f) => sum + f.cornfield.properties.area_m2, 0);

    const goToAssetAndHighlight = (farmerId: number, cornfieldId: number) => {
        const key = `${farmerId}-${cornfieldId}`;
        localStorage.setItem("highlightFieldKey", key);
        router.push("/profile/asset");
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
            <Navbar />

            <main className="flex-1 px-6 py-12 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-32 h-32 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center text-5xl font-bold mb-4 shadow-lg">
                        {avatar}
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: '#fcd34d' }}>
                        {user?.first_name} {user?.last_name}
                    </h1>
                    <p className="text-[#5b8c51] text-lg">{roleName}</p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-2xl transition">
                        <Map className="w-10 h-10 text-[#5b8c51] mx-auto mb-2" />
                        <p className="text-xl font-bold">{fields.length}</p>
                        <p className="text-gray-600">Số ruộng</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-2xl transition">
                        <Cpu className="w-10 h-10 text-[#5b8c51] mx-auto mb-2" />
                        <p className="text-xl font-bold">{fields.length}</p>
                        <p className="text-gray-600">Hệ thống IoT</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-2xl transition">
                        <Bot className="w-10 h-10 text-[#5b8c51] mx-auto mb-2" />
                        <p className="text-xl font-bold">{totalArea.toFixed(0)} m²</p>
                        <p className="text-gray-600">Tổng diện tích</p>
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {fields.map((field) => (
                        <motion.div
                            key={field.id}
                            className="bg-white rounded-2xl shadow hover:shadow-2xl transition p-6 flex flex-col md:flex-row gap-4"
                        >
                            {field.image_rel && (
                                <img
                                    src={field.image_rel}
                                    alt={field.cornfield.properties.name}
                                    className="w-full md:w-40 h-40 object-cover rounded-xl"
                                />
                            )}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-[#5b8c51]  font-bold text-xl mb-2">
                                        {field.cornfield.properties.name}
                                    </h3>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-semibold">Diện tích:</span>{" "}
                                        {field.cornfield.properties.area_m2.toFixed(0)} m²
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-semibold">Ngày gieo:</span>{" "}
                                        {new Date(field.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-semibold">Bệnh:</span> {DISEASE_MAP[field.disease_class] || field.disease_class}
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-semibold">Độ tin cậy chuẩn đoán bệnh:</span> {(field.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => goToAssetAndHighlight(field.farmer.id, field.cornfield.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                                Xem chi tiết
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;
