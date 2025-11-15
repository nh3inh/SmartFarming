import { Thermometer, Droplets, Gauge, Wind, Sun, Activity, FlaskConical, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Metric {
    key: string;
    label: string;
    value: number | string;
    unit?: string;
    icon: React.ReactNode;
}

export default function FieldMetrics({ info }: { info: any }) {
    if (!info) return null;

    const metrics: Metric[] = [
        { key: "confidence", label: "Độ tin cậy chuẩn đoán", value: (info.confidence ?? 0) * 100, unit: "%", icon: <Activity className="w-5 h-5 text-green-500" /> },
        { key: "temp", label: "Nhiệt độ", value: info.temp, unit: "°C", icon: <Thermometer className="w-5 h-5 text-orange-400" /> },
        { key: "hum", label: "Độ ẩm không khí", value: info.hum, unit: "%", icon: <Droplets className="w-5 h-5 text-blue-400" /> },
        { key: "ph", label: "Độ pH", value: info.ph, icon: <FlaskConical className="w-5 h-5 text-purple-400" /> },
        { key: "soil", label: "Độ ẩm đất", value: info.soil, unit: "%", icon: <Droplets className="w-5 h-5 text-amber-400" /> },
        { key: "wind", label: "Gió hiện tại", value: info.wind, unit: " m/s", icon: <Wind className="w-5 h-5 text-sky-400" /> },
        { key: "wind_avg", label: "Gió trung bình", value: info.wind_avg, unit: " m/s", icon: <Wind className="w-5 h-5 text-sky-300" /> },
        { key: "lux", label: "Ánh sáng", value: info.lux, unit: " lux", icon: <Sun className="w-5 h-5 text-yellow-400" /> },
    ].filter(m => m.value !== undefined && m.value !== null);

    return (
        <div className="mt-2">
            <div className="border border-gray-200 rounded-xl">
                <div className="grid grid-cols-4 gap-2 p-1 px-2">
                    {metrics.map((m, index) => (
                        <div
                            key={m.key}
                            className="flex gap-1 items-center  rounded p-1"
                            style={{ animation: `fadeIn 0.3s ease ${index * 0.05}s both` }}
                        >
                            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                {m.icon}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <span className="text-gray-500 block truncate">{m.label}</span>
                                <span className="font-semibold text-gray-800 block truncate">
                                    {Number(m.value).toFixed(1)}{m.unit || ""}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <h2 className="text-sm font-bold text-green-700 mt-4 px-1">
                        Gợi ý lịch trình canh tác
                    </h2>

                    {!(info.water_payload?.payload || info.treatment_payload?.payload || info.fertilizer_payload?.payload) ? (
                        <Card className="border border-gray-200 rounded-xl w-full shadow-none">
                            <CardContent>
                                <p className="text-gray-500">Chưa có lịch trình canh tác thích hợp</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {info.water_payload?.payload && (
                                <Card className="border border-gray-200 rounded-xl w-full shadow-none">
                                    <CardContent>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Info className="w-5 h-5 text-blue-500" />
                                            <h3 className="text-sm font-semibold">Tưới nước</h3>
                                        </div>
                                        <p><strong>Hành động:</strong> {info.water_payload.payload.action}</p>
                                        <p><strong>Mức mục tiêu:</strong> {info.water_payload.payload.target_level}</p>
                                        <p><strong>Thực hiện:</strong> {new Date(info.water_payload.payload.execution_time).toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {info.treatment_payload?.payload && (
                                <Card className="border border-gray-200 rounded-xl w-full shadow-none">
                                    <CardContent>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Info className="w-5 h-5 text-purple-500" />
                                            <h3 className="text-sm font-semibold">Phun thuốc</h3>
                                        </div>
                                        <p><strong>Thuốc:</strong> {info.treatment_payload.payload.drug_name}</p>
                                        <p><strong>Hoạt chất:</strong> {info.treatment_payload.payload.active_ingredient}</p>
                                        <p><strong>Lịch phun:</strong> {info.treatment_payload.payload.timing}</p>
                                        <p><strong>Liều lượng:</strong> {info.treatment_payload.payload.total_volume}</p>
                                        <p><strong>Hướng dẫn:</strong> {info.treatment_payload.payload.notes}</p>
                                        <p><strong>Thực hiện:</strong> {new Date(info.treatment_payload.payload.execution_time).toLocaleString()}</p>
                                        <p><strong>Pha trộn:</strong> {info.treatment_payload.payload.mixing_instruction}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {info.fertilizer_payload?.payload && (
                                <Card className="border border-gray-200 rounded-xl w-full shadow-none">
                                    <CardContent>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Info className="w-5 h-5 text-green-500" />
                                            <h3 className="text-sm font-semibold">Bón phân</h3>
                                        </div>
                                        <p><strong>Tóm tắt:</strong> {info.fertilizer_payload.payload.summary}</p>
                                        <p><strong>Lưu ý:</strong> {info.fertilizer_payload.payload.caution}</p>
                                        <p><strong>Thời gian:</strong> {new Date(info.fertilizer_payload.payload.execution_time).toLocaleString()}</p>
                                        <div className="mt-2">
                                            {info.fertilizer_payload.payload.execution_stage?.fertilizers_to_apply?.map((f: any, idx: number) => (
                                                <div key={idx} className="border-t border-gray-100 pt-1 mt-1">
                                                    <p><strong>Loại:</strong> {f.type}</p>
                                                    <p><strong>Số lượng:</strong> {f.quantity_kg} kg</p>
                                                    <p><strong>Hướng dẫn:</strong> {f.instructions}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
