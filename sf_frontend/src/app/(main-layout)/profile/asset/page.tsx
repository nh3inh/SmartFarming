"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import { Plus, Map, Edit, Trash2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import Container from "@/app/layout/Container";
import L from 'leaflet';
import wellknown from 'wellknown';
import dynamic from 'next/dynamic';

interface Farmer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Cornfield {
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
}

interface FieldObservation {
    id: number;
    farmer: Farmer;
    cornfield: Cornfield;
    timestamp: string;
    disease_class: string;
    confidence: number;
    temp: number;
    hum: number;
    ph: number;
    soil: number;
    wind: number;
    wind_avg: number;
    lux: number;
    image_rel?: string;
    ms?: number;
    gps_fix?: boolean;
    gps_lat?: number;
    gps_lon?: number;
    gps_alt?: number;
    gps_time?: string;
    gps_source?: string;
    env_ok?: boolean;
    env_time?: string;
    env_port?: string;
    env_source?: string;
    status?: number;
    created_at?: string;
    updated_at?: string;
}

interface FarmerFieldData {
    id: number;
    farmer: number;
    cornfield: number;
    name: string;
    soil_type: string;
    crop_type: string;
    sowing_date: string;
    iot_device_id?: string;
}

interface TimeSeriesData {
    timestamp: string;
    confidence: number;
    temp: number;
    hum: number;
    ph: number;
    soil: number;
    wind: number;
    wind_avg: number;
    lux: number;
}

interface RecommendationPayload {
    water_payload?: {
        payload: {
            action: string;
            target_level: string;
            execution_time: string;
        };
    };
    treatment_payload?: {
        payload: {
            drug_name: string;
            active_ingredient: string;
            timing: string;
            total_volume: string;
            notes: string;
            execution_time: string;
            mixing_instruction: string;
        };
    };
    fertilizer_payload?: {
        payload: {
            summary: string;
            caution: string;
            execution_time: string;
            execution_stage?: {
                fertilizers_to_apply: {
                    type: string;
                    quantity_kg: number;
                    instructions: string;
                }[];
            };
        };
    };
}

export default function AssetPage() {
    const [fields, setFields] = useState<FarmerFieldData[]>([]);
    const [observations, setObservations] = useState<FieldObservation[]>([]);
    const [observation, setObservation] = useState<FieldObservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [observationImages, setObservationImages] = useState<any[]>([]);
    const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const fieldKey = (farmerId: number, cornfieldId: number) => `${farmerId}-${cornfieldId}`;
    const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<FarmerFieldData>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const allFieldsLayerRef = useRef<L.LayerGroup | null>(null);
    const [selectedField, setSelectedField] = useState<{ feature: any; info?: FarmerFieldData } | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationPayload | null>(null);
    const [recommendationsByField, setRecommendationsByField] = useState<Record<string, RecommendationPayload>>({});
    const [activeRecModal, setActiveRecModal] = useState<"water" | "treatment" | "fertilizer" | null>(null);
    const [modalRecData, setModalRecData] = useState<RecommendationPayload | null>(null);

    const handleAdd = () => {
        setFormData({});
        setShowForm(true);
    };

    const handleEdit = (field: FarmerFieldData) => {
        setFormData(field);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`${API_BASE}observation/farmer-fields/${deleteId}/`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Xóa thất bại");
            toast.success("Xóa ruộng thành công!");
            setFields(fields.filter(f => f.id !== deleteId));
        } catch (err: any) {
            toast.error(err.message || "Lỗi khi xóa ruộng");
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = formData.id ? "PUT" : "POST";
            const url = formData.id
                ? `${API_BASE}observation/farmer-fields/${formData.id}/`
                : `${API_BASE}observation/farmer-fields/`;
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Lưu thất bại");
            const saved = await res.json();
            toast.success(formData.id ? "Cập nhật ruộng thành công" : "Thêm ruộng thành công");

            setFields(prev => {
                if (formData.id) {
                    return prev.map(f => f.id === saved.id ? saved : f);
                } else {
                    return [...prev, saved];
                }
            });
        } catch (err: any) {
            toast.error(err.message || "Lỗi khi lưu ruộng");
        } finally {
            setShowForm(false);
            setFormData({});
        }
    };

    const scrollToField = (key: string) => {
        const el = fieldRefs.current[key];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.add("ring-4", "ring-green-400");
            setTimeout(() => el.classList.remove("ring-4", "ring-green-400"), 1000);
        }
    };

    useEffect(() => {
        const key = localStorage.getItem("highlightFieldKey");
        if (key && fields.length > 0) {
            const tryHighlight = (retries = 10) => {
                requestAnimationFrame(() => {
                    const el = fieldRefs.current[key];
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                        el.classList.add("ring-4", "ring-green-400", "transition-all");
                        setTimeout(() => el.classList.remove("ring-4", "ring-green-400"), 1500);
                    } else if (retries > 0) {
                        setTimeout(() => tryHighlight(retries - 1), 100);
                    } else {
                        console.warn("Cannot find element to highlight:", key);
                    }
                });
            };
            tryHighlight();

            localStorage.removeItem("highlightFieldKey");
        }
    }, [fields]);

    const fetchFields = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}observation/farmer-fields/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Không thể lấy danh sách ruộng.");
            const data: FarmerFieldData[] = await res.json();
            setFields(data || []);
        } catch (err: any) {
            setError(err.message || "Lỗi khi tải dữ liệu ruộng.");
            setFields([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchObservations = async () => {
        try {
            const res = await fetch(`${API_BASE}cornfields/info/my-fields/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Không thể lấy dữ liệu phân tích.");
            const data = await res.json();
            setObservations(data.data || []);
        } catch (err: any) {
            toast.error(err.message || "Lỗi khi tải dữ liệu phân tích.");
            setObservations([]);
        }
    };

    const fetchObservation = async () => {
        try {
            const res = await fetch(`${API_BASE}cornfields/info/my-field/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Không thể lấy dữ liệu.");
            const data = await res.json();
            setObservationImages(data.data || []);
            setObservation(data.data || []);
            const recMap: Record<string, RecommendationPayload> = {};
            (data.data || []).forEach((obs: any) => {
                const key = `${obs.farmer.id}-${obs.cornfield.id}`;
                recMap[key] = {
                    water_payload: obs.water_payload,
                    treatment_payload: obs.treatment_payload,
                    fertilizer_payload: obs.fertilizer_payload
                };
            });
            setRecommendationsByField(recMap);
        } catch (err: any) {
            toast.error(err.message || "Lỗi khi tải dữ liệu.");
            setObservationImages([]);
            setObservation([]);
            setRecommendationsByField({});
        }
    };

    useEffect(() => {
        fetchFields();
        fetchObservation();
        fetchObservations();

    }, []);

    const truncate = (text?: string, max = 20) =>
        text && text.length > max ? text.slice(0, max) + "..." : text || "";

    const groupedByField: Record<string, TimeSeriesData[]> = {};
    observations
        .filter(obs => obs.timestamp.startsWith(selectedDate))
        .forEach(obs => {
            const key = `${obs.farmer.id}-${obs.cornfield.id}`;
            if (!groupedByField[key]) groupedByField[key] = [];
            groupedByField[key].push({
                timestamp: obs.timestamp,
                confidence: obs.confidence,
                temp: obs.temp,
                hum: obs.hum,
                ph: obs.ph,
                soil: obs.soil,
                wind: obs.wind,
                wind_avg: obs.wind_avg,
                lux: obs.lux,
            });
        });

    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Navbar />
            <Toaster position="bottom-center" reverseOrder={false} toastOptions={{
                duration: 3000,
                style: { fontSize: '16px', padding: '16px 24px', minWidth: '300px', borderRadius: '12px' },
            }} />
            <main className="">
                <Container className="space-y-8">
                    <h1 className="text-3xl md:text-5xl font-bold text-[#5b8c51]  mb-8">
                        Quản lý ruộng lúa của nông dân
                    </h1>

                    <div className="flex justify-between mb-6 items-center">
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full shadow hover:bg-green-700 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm ruộng mới
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <motion.div
                                className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                        </div>
                    ) : error ? (
                        <p className="text-red-600 text-center">{error}</p>
                    ) : fields.length === 0 ? (
                        <p className="text-center text-gray-700 py-16">Bạn chưa có ruộng nào.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <AnimatePresence>
                                {fields.map((field) => {
                                    const key = fieldKey(field.farmer, field.cornfield);
                                    return (
                                        <motion.div
                                            key={field.id}
                                            onClick={() => scrollToField(fieldKey(field.farmer, field.cornfield))}
                                            ref={el => { fieldRefs.current[key] = el; }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-white rounded-2xl p-6 shadow hover:shadow-2xl transition-all relative"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Map className="w-6 h-6 text-green-700" />
                                                    <h2 className="text-xl font-bold text-[#5b8c51] ">{truncate(field.name)}</h2>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(field); }}
                                                        className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(field.id); }}
                                                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div
                                                className="mb-4 h-48 w-full rounded-xl overflow-hidden shadow z-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MapComponent
                                                    observations={observation.filter(
                                                        obs =>
                                                            obs.farmer.id === field.farmer &&
                                                            obs.cornfield.id === field.cornfield
                                                    )}
                                                />
                                            </div>

                                            <p className="text-gray-700 mb-1"><span className="font-bold">Loại đất:</span> {field.soil_type}</p>
                                            <p className="text-gray-700 mb-1"><span className="font-bold">Giống lúa:</span> {field.crop_type}</p>
                                            <p className="text-gray-700 mb-1"><span className="font-bold">Ngày gieo:</span> {field.sowing_date}</p>
                                            {field.iot_device_id && (
                                                <p className="text-gray-700"><span className="font-bold">Mã thiết bị:</span> {field.iot_device_id}</p>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <motion.div className="bg-white p-8 rounded-3xl w-full max-w-3xl shadow-2xl"
                                    initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
                                >
                                    <h2 className="text-2xl font-bold mb-6 text-[#5b8c51]  text-center">{formData.id ? "Sửa thông tin ruộng" : "Thêm ruộng mới"}</h2>
                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col">
                                            <label className="mb-1 font-medium text-gray-700">Tên ruộng</label>
                                            <input type="text" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="mb-1 font-medium text-gray-700">Loại đất</label>
                                            <input type="text" value={formData.soil_type || ""} onChange={e => setFormData({ ...formData, soil_type: e.target.value })} className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="mb-1 font-medium text-gray-700">Giống lúa</label>
                                            <input type="text" value={formData.crop_type || ""} onChange={e => setFormData({ ...formData, crop_type: e.target.value })} className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="mb-1 font-medium text-gray-700">Ngày gieo</label>
                                            <input type="date" value={formData.sowing_date || ""} onChange={e => setFormData({ ...formData, sowing_date: e.target.value })} className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                        <div className="flex flex-col md:col-span-2">
                                            <label className="mb-1 font-medium text-gray-700">Mã thiết bị (nếu có)</label>
                                            <input type="text" value={formData.iot_device_id || ""} onChange={e => setFormData({ ...formData, iot_device_id: e.target.value })} className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                        </div>
                                        <div className="flex justify-end gap-4 mt-8 md:col-span-2">
                                            <button type="button" onClick={() => { setShowForm(false); setFormData({}); }} className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium">Hủy</button>
                                            <button type="submit" className="px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 font-medium">{formData.id ? "Cập nhật" : "Thêm"}</button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}

                        {showDeleteModal && (
                            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
                                    <p className="mb-4 font-medium">Bạn có chắc muốn xóa ruộng này?</p>
                                    <div className="flex justify-around">
                                        <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setShowDeleteModal(false)}>Hủy</button>
                                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleDeleteConfirmed}>Xác nhận</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                    <h2 className="text-2xl font-bold text-[#5b8c51]  mb-6">Biểu đồ dữ liệu theo ngày: {selectedDate}</h2>
                    <div className="flex items-center gap-2 mb-2">
                        <label className="font-semibold text-[#5b8c51] ">Chọn ngày:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>

                    {Object.entries(groupedByField).length === 0 ? (
                        <p className="text-center text-gray-700 py-8">Không có dữ liệu cho ngày này.</p>
                    ) : (
                        <div className="flex flex-col gap-8 mb-8">
                            {Object.entries(groupedByField).map(([key, data]) => {
                                const [farmerId, cornfieldId] = key.split('-').map(Number);
                                const fieldInfo = fields.find(f => f.farmer === farmerId && f.cornfield === cornfieldId);

                                const hourlyData = data.map(item => ({
                                    ...item,
                                    hour: new Date(item.timestamp).getUTCHours() + 'h',
                                }));

                                const filteredImages = observationImages.filter(
                                    obs => obs.farmer.id === farmerId && obs.cornfield.id === cornfieldId && obs.image_rel
                                );

                                return (
                                    <motion.div
                                        key={key}
                                        ref={el => { fieldRefs.current[key] = el; }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                                    >
                                        <div className="px-6 pt-6 flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-[#5b8c51] flex items-center gap-2">
                                                <Map className="w-6 h-6 text-green-700" />
                                                {fieldInfo ? fieldInfo.name : `Ruộng ${key}`}
                                            </h3>
                                        </div>

                                        <div className="p-2">
                                            <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-6 p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                                                    <div className="flex flex-col">
                                                        <h2 className="text-lg font-medium text-[#5b8c51] mb-4 text-center">
                                                            Số liệu đo trong ngày
                                                        </h2>
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <LineChart data={hourlyData}>
                                                                <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                                                                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                                                <YAxis
                                                                    yAxisId="left"
                                                                    label={{ value: "Giá trị", angle: -90, position: "insideLeft", fontSize: 12 }}
                                                                />
                                                                <Tooltip labelFormatter={label => `Giờ: ${label}`} />
                                                                <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#facc15" name="Nhiệt độ (°C)" dot={false} />
                                                                <Line yAxisId="left" type="monotone" dataKey="hum" stroke="#3b82f6" name="Độ ẩm (%)" dot={false} />
                                                                <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#f472b6" name="pH" dot={false} />
                                                                <Line yAxisId="left" type="monotone" dataKey="soil" stroke="#a3e635" name="Độ ẩm đất" dot={false} />
                                                                <Line yAxisId="left" type="monotone" dataKey="wind" stroke="#60a5fa" name="Gió hiện tại" dot={false} />
                                                                <Line yAxisId="left" type="monotone" dataKey="wind_avg" stroke="#f87171" name="Gió trung bình" dot={false} />
                                                                <Line yAxisId="left" type="monotone" dataKey="lux" stroke="#8b5cf6" name="Ánh sáng" dot={false} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <div className="flex flex-wrap gap-3 pt-3">
                                                            {filteredImages.length > 0 ? (
                                                                filteredImages.slice(0, 3).map(obs => (
                                                                    <div key={obs.id} className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shadow hover:shadow-md transition-all">
                                                                        <img
                                                                            src={obs.image_rel}
                                                                            alt={obs.cornfield.properties.name}
                                                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                                        />
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-center text-gray-500 w-full">Chưa có hình ảnh</p>
                                                            )}
                                                        </div>

                                                        <div className="mt-2 text-sm text-gray-600 space-y-2">
                                                            <h3 className="text-[#5b8c51] font-semibold mb-2">Chú thích biểu đồ</h3>
                                                            <ul className="space-y-1 text-xs">
                                                                <li><span className="inline-block w-3 h-3 bg-[#facc15] rounded-sm mr-2"></span> Nhiệt độ (°C)</li>
                                                                <li><span className="inline-block w-3 h-3 bg-[#3b82f6] rounded-sm mr-2"></span> Độ ẩm (%)</li>
                                                                <li><span className="inline-block w-3 h-3 bg-[#f472b6] rounded-sm mr-2"></span> pH</li>
                                                                <li><span className="inline-block w-3 h-3 bg-[#a3e635] rounded-sm mr-2"></span> Độ ẩm đất (%)</li>
                                                                <li><span className="inline-block w-3 h-3 bg-[#60a5fa] rounded-sm mr-2"></span> Gió hiện tại (m/s)</li>
                                                                <li><span className="inline-block w-3 h-3 bg-[#f87171] rounded-sm mr-2"></span> Gió trung bình (m/s)</li>
                                                                <li><span className="inline-block w-3 h-3 bg-[#8b5cf6] rounded-sm mr-2"></span> Ánh sáng (lux)</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
<div className="flex flex-col gap-2">
  <h4 className="text-sm font-semibold text-gray-700">Gợi ý lịch trình canh tác</h4>
  
  {(
    recommendationsByField[key]?.water_payload?.payload ||
    recommendationsByField[key]?.treatment_payload?.payload ||
    recommendationsByField[key]?.fertilizer_payload?.payload
  ) ? (
    <div className="flex gap-2">
      {recommendationsByField[key]?.water_payload?.payload && (
        <button
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          onClick={() => { setActiveRecModal("water"); setModalRecData(recommendationsByField[key]); }}
        >
          <Info className="w-3 h-3" />
          Cấp nước
        </button>
      )}

      {recommendationsByField[key]?.treatment_payload?.payload && (
        <button
          className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          onClick={() => { setActiveRecModal("treatment"); setModalRecData(recommendationsByField[key]); }}
        >
          <Info className="w-3 h-3" />
          Phun thuốc
        </button>
      )}

      {recommendationsByField[key]?.fertilizer_payload?.payload && (
        <button
          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          onClick={() => { setActiveRecModal("fertilizer"); setModalRecData(recommendationsByField[key]); }}
        >
          <Info className="w-3 h-3" />
          Bón phân
        </button>
      )}
    </div>
  ) : (
    <p className="text-sm text-gray-500">Chưa có lịch trình canh tác thích hợp</p>
  )}
</div>
                                                <AnimatePresence>
                                                    {activeRecModal && modalRecData && (
                                                        <motion.div
                                                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            onClick={() => setActiveRecModal(null)}
                                                        >
                                                            <motion.div
                                                                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]"
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.8, opacity: 0 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <button
                                                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                                                                    onClick={() => setActiveRecModal(null)}
                                                                >
                                                                    ✕
                                                                </button>

                                                                <h2 className="text-2xl font-bold text-[#5b8c51] mb-6 text-center">
                                                                    {activeRecModal === "water" && "Chi tiết: Cấp nước"}
                                                                    {activeRecModal === "treatment" && "Chi tiết: Phun thuốc"}
                                                                    {activeRecModal === "fertilizer" && "Chi tiết: Bón phân"}
                                                                </h2>

                                                                <div className="space-y-4 text-gray-700">
                                                                    {activeRecModal === "water" && modalRecData.water_payload?.payload && (
                                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                                            <p><strong>Hành động:</strong> {modalRecData.water_payload.payload.action}</p>
                                                                            <p><strong>Mức mục tiêu:</strong> {modalRecData.water_payload.payload.target_level}</p>
                                                                            <p><strong>Thực hiện:</strong> {new Date(modalRecData.water_payload.payload.execution_time).toLocaleString()}</p>
                                                                        </div>
                                                                    )}

                                                                    {activeRecModal === "treatment" && modalRecData.treatment_payload?.payload && (
                                                                        <div className="bg-purple-50 p-4 rounded-lg">
                                                                            <p><strong>Thuốc:</strong> {modalRecData.treatment_payload.payload.drug_name}</p>
                                                                            <p><strong>Hoạt chất:</strong> {modalRecData.treatment_payload.payload.active_ingredient}</p>
                                                                            <p><strong>Lịch phun:</strong> {modalRecData.treatment_payload.payload.timing}</p>
                                                                            <p><strong>Liều lượng:</strong> {modalRecData.treatment_payload.payload.total_volume}</p>
                                                                            <p><strong>Hướng dẫn:</strong> {modalRecData.treatment_payload.payload.notes}</p>
                                                                            <p><strong>Thực hiện:</strong> {new Date(modalRecData.treatment_payload.payload.execution_time).toLocaleString()}</p>
                                                                            <p><strong>Pha trộn:</strong> {modalRecData.treatment_payload.payload.mixing_instruction}</p>
                                                                        </div>
                                                                    )}

                                                                    {activeRecModal === "fertilizer" && modalRecData.fertilizer_payload?.payload && (
                                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                                            <p><strong>Tóm tắt:</strong> {modalRecData.fertilizer_payload.payload.summary}</p>
                                                                            <p><strong>Lưu ý:</strong> {modalRecData.fertilizer_payload.payload.caution}</p>
                                                                            <p><strong>Thời gian:</strong> {new Date(modalRecData.fertilizer_payload.payload.execution_time).toLocaleString()}</p>
                                                                            <div className="mt-2 space-y-2">
                                                                                {modalRecData.fertilizer_payload.payload.execution_stage?.fertilizers_to_apply?.map((f, idx) => (
                                                                                    <div key={idx} className="border-t border-gray-200 pt-2">
                                                                                        <p><strong>Loại:</strong> {f.type}</p>
                                                                                        <p><strong>Số lượng:</strong> {f.quantity_kg} kg</p>
                                                                                        <p><strong>Hướng dẫn:</strong> {f.instructions}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </Container>
            </main>
            <Footer />
        </div>
    );
}
