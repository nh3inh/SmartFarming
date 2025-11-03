"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";
import { Plus, Map, Edit, Trash2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

interface FarmerFieldData {
    id: number;
    name: string;
    soil_type: string;
    crop_type: string;
    sowing_date: string;
    iot_device_id: string;
}

export default function AssetPage() {
    const [fields, setFields] = useState<FarmerFieldData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<FarmerFieldData>>({});
    const [submitting, setSubmitting] = useState(false);
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const truncate = (text: string, max = 20) =>
        text.length > max ? text.slice(0, max) + "..." : text;

    const fetchFields = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}observation/farmer-fields/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Không thể lấy dữ liệu tài sản.");
            const data: FarmerFieldData[] = await res.json();
            setFields(data);
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi.");
            setFields([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name?.trim() ||
            !formData.soil_type?.trim() ||
            !formData.crop_type?.trim() ||
            !formData.sowing_date?.trim() ||
            !formData.iot_device_id?.trim()
        ) {
            toast.error("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        const payload = {
            name: formData.name?.trim() || "",
            soil_type: formData.soil_type?.trim() || "",
            crop_type: formData.crop_type?.trim() || "",
            sowing_date: formData.sowing_date || "",
            iot_device_id: formData.iot_device_id?.trim() || null,
        };

        setSubmitting(true);
        try {
            const method = formData.id ? "PUT" : "POST";
            const url = formData.id
                ? `${API_BASE}observation/farmer-fields/${formData.id}/`
                : `${API_BASE}observation/farmer-fields/`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData?.detail || "Đã xảy ra lỗi khi lưu dữ liệu.");
            }

            toast.success(formData.id ? "Cập nhật thành công!" : "Thêm ruộng thành công!");
            setShowForm(false);
            setFormData({});
            fetchFields();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirmed = async () => {
        if (deleteId === null) return;
        try {
            const res = await fetch(`${API_BASE}observation/farmer-fields/${deleteId}/`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Không thể xóa.");
            setFields(fields.filter((f) => f.id !== deleteId));
            toast.success("Xóa thành công!");
        } catch (err: any) {
            toast.error(err.message || "Đã xảy ra lỗi khi xóa.");
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <Navbar />
            <Toaster
                position="bottom-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontSize: '16px',
                        padding: '16px 24px',
                        minWidth: '300px',
                        borderRadius: '12px',
                    },
                }}
            />
            <main className="flex-1 px-6 py-12 max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold text-green-800 mb-8">
                    Ruộng lúa của nông dân
                </h1>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => {
                            setFormData({});
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full shadow hover:bg-green-700 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm ruộng lúa mới
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
                    <p className="text-center text-gray-700 py-16">Bạn chưa có tài sản nào.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {fields.map((field) => (
                                <motion.div
                                    key={field.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white rounded-2xl p-6 shadow hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Map className="w-6 h-6 text-green-700" />
                                            <h2 className="text-xl font-semibold text-green-800">{truncate(field.name, 20)}</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setFormData(field);
                                                    setShowForm(true);
                                                }}
                                                className="p-1 rounded hover:bg-yellow-100"
                                            >
                                                <Edit className="w-5 h-5 text-yellow-500" />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(field.id)}
                                                className="p-1 rounded hover:bg-red-100"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-bold">Loại đất:</span> {field.soil_type}
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-bold">Giống lúa:</span> {field.crop_type}
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-bold">Ngày gieo lúa:</span> {field.sowing_date}
                                    </p>
                                    {field.iot_device_id && (
                                        <p className="text-gray-700">
                                            <span className="font-bold">Mã thiết bị:</span> {field.iot_device_id}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <AnimatePresence>
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
                                <p className="mb-4 font-medium">Bạn có chắc muốn xóa tài sản này?</p>
                                <div className="flex justify-around">
                                    <button
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        onClick={handleDeleteConfirmed}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showForm && (
                        <motion.div
                            className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white p-8 rounded-3xl w-full max-w-3xl shadow-2xl"
                                initial={{ scale: 0.85 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.85 }}
                            >
                                <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">
                                    {formData.id ? "Sửa thông tin ruộng lúa" : "Thêm ruộng lúa mới"}
                                </h2>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">Tên ruộng lúa</label>
                                        <input
                                            type="text"
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">Loại đất</label>
                                        <input
                                            type="text"
                                            value={formData.soil_type || ""}
                                            onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                                            className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">Giống lúa</label>
                                        <input
                                            type="text"
                                            value={formData.crop_type || ""}
                                            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                                            className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="mb-1 font-medium text-gray-700">Ngày gieo lúa</label>
                                        <input
                                            type="date"
                                            value={formData.sowing_date || ""}
                                            onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                                            className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col md:col-span-2">
                                        <label className="mb-1 font-medium text-gray-700">Mã thiết bị</label>
                                        <input
                                            type="text"
                                            value={formData.iot_device_id || ""}
                                            onChange={(e) => setFormData({ ...formData, iot_device_id: e.target.value })}
                                            className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-4 mt-8 md:col-span-2">
                                        <button
                                            type="button"
                                            onClick={() => { setShowForm(false); setFormData({}); }}
                                            className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`px-6 py-3 rounded-lg text-white font-medium ${submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
                                        >
                                            {submitting ? "Đang lưu..." : formData.id ? "Cập nhật" : "Thêm"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
}
