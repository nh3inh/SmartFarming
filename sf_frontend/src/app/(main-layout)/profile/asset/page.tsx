"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import { Plus, Map, Edit, Trash2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
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

export default function AssetPage() {
    const [fields, setFields] = useState<FarmerFieldData[]>([]);
    const [observations, setObservations] = useState<FieldObservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [observationImages, setObservationImages] = useState<any[]>([]);
    const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const fieldKey = (farmerId: number, cornfieldId: number) => `${farmerId}-${cornfieldId}`;

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<FarmerFieldData>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

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
            if (!res.ok) throw new Error("Không thể lấy dữ liệu quan sát.");
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
            if (!res.ok) throw new Error("Không thể lấy dữ liệu quan sát.");
            const data = await res.json();
            setObservationImages(data.data || []);
        } catch (err: any) {
            toast.error(err.message || "Lỗi khi tải dữ liệu ảnh.");
            setObservationImages([]);
        }
    };

    useEffect(() => {
        fetchFields();
        fetchObservation();
        fetchObservations();

    }, []);

    const truncate = (text?: string, max = 20) =>
        text && text.length > max ? text.slice(0, max) + "..." : text || "";

    // Gom nhóm theo farmer+cornfield và lọc theo ngày
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
            <main className="flex-1 px-6 py-12 max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold text-green-800 mb-8">
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
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.5 }}
  className="bg-white rounded-2xl p-6 shadow hover:shadow-2xl transition-all relative"
>
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Map className="w-6 h-6 text-green-700" />
      <h2 className="text-xl font-semibold text-green-800">{truncate(field.name)}</h2>
    </div>
    {/* Nút Edit/Delete */}
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
                                <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">{formData.id ? "Sửa thông tin ruộng" : "Thêm ruộng mới"}</h2>
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

                <h2 className="text-2xl font-bold text-green-800 mb-6">Biểu đồ dữ liệu theo ngày: {selectedDate}</h2>
                <div className="flex items-center gap-2 mb-2">
                    <label className="font-semibold text-green-800">Chọn ngày:</label>
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
                    Object.entries(groupedByField).map(([key, data]) => {
                        const [farmerId, cornfieldId] = key.split('-').map(Number);

                        const fieldInfo = fields.find(
                            (f) => f.farmer === farmerId && f.cornfield === cornfieldId
                        );

                        const hourlyData = data.map(item => ({
                            ...item,
                            hour: new Date(item.timestamp).getUTCHours() + 'h',
                        }));

                        const filteredImages = observationImages.filter(
                            obs => obs.farmer.id === farmerId && obs.cornfield.id === cornfieldId && obs.image_rel
                        );

                        return (
                            <div key={key} ref={el => { fieldRefs.current[key] = el; }} className="bg-white p-6 rounded-2xl shadow mb-8 w-full">
                                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                                    <Map className="w-6 h-6 text-green-700" />
                                    {fieldInfo ? fieldInfo.name : key}
                                </h3>

                                <div key={key}>
                                    {filteredImages.length > 0 && (
                                        <div className="mt-4">
                                            <h2 className="text-lg font-bold text-green-800 mb-4 text-center">Hình ảnh ruộng</h2>
                                            <div className="flex flex-wrap justify-center gap-6 mb-8">
                                                {filteredImages.map(obs => (
                                                    <div key={obs.id} className="bg-white p-2 w-64 h-64 overflow-hidden">
                                                        <img
                                                            src={obs.image_rel}
                                                            alt={obs.cornfield.properties.name}
                                                            className="w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={hourlyData}>
                                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                        <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="left" label={{ value: 'Giá trị', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                                        <Tooltip labelFormatter={(label) => `Giờ: ${label}`} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#facc15" name="Nhiệt độ (°C)" dot={{ r: 1 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="hum" stroke="#3b82f6" name="Độ ẩm (%)" dot={{ r: 1 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#f472b6" name="pH" dot={{ r: 1 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="soil" stroke="#a3e635" name="Đất" dot={{ r: 1 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="wind" stroke="#60a5fa" name="Gió" dot={{ r: 1 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="wind_avg" stroke="#f87171" name="Gió trung bình" dot={{ r: 1 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="lux" stroke="#8b5cf6" name="Ánh sáng" dot={{ r: 1 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })
                )}

            </main>
            <Footer />
        </div>
    );
}
