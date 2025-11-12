import { Thermometer, Droplets, Gauge, Wind, Sun, Activity, FlaskConical } from "lucide-react";
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
        { key: "confidence", label: "Độ tin cậy", value: (info.confidence ?? 0) * 100, unit: "%", icon: <Activity className="w-5 h-5 text-green-500" /> },
        { key: "temp", label: "Nhiệt độ", value: info.temp, unit: "°C", icon: <Thermometer className="w-5 h-5 text-orange-400" /> },
        { key: "hum", label: "Độ ẩm không khí", value: info.hum, unit: "%", icon: <Droplets className="w-5 h-5 text-blue-400" /> },
        { key: "ph", label: "Độ pH", value: info.ph, icon: <FlaskConical className="w-5 h-5 text-purple-400" /> },
        { key: "soil", label: "Độ ẩm đất", value: info.soil, unit: "%", icon: <Droplets className="w-5 h-5 text-amber-400" /> },
        { key: "wind", label: "Gió hiện tại", value: info.wind, unit: " m/s", icon: <Wind className="w-5 h-5 text-sky-400" /> },
        { key: "wind_avg", label: "Gió trung bình", value: info.wind_avg, unit: " m/s", icon: <Wind className="w-5 h-5 text-sky-300" /> },
        { key: "lux", label: "Ánh sáng", value: info.lux, unit: " lux", icon: <Sun className="w-5 h-5 text-yellow-400" /> },
    ].filter(m => m.value !== undefined && m.value !== null);

    return (
        <div className="mt-4">
            <div className="grid grid-cols-4 gap-2">
                {metrics.map((m, index) => (
                    <Card
                        key={m.key}
                        className="hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-xl"
                        style={{ animation: `fadeIn 0.3s ease ${index * 0.05}s both`, minHeight: '50px' }}
                    >
                        <CardContent className="flex gap-2 py-1 px-2 items-start">
                            <div className="w-6 h-6 flex-shrink-0 p-1 bg-gray-50 rounded flex items-center justify-center">
                                {m.icon}
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <span className="text-xs text-gray-500 leading-tight block truncate">{m.label}</span>
                                <span className="text-sm font-semibold text-gray-800 leading-tight block truncate">
                                    {Number(m.value).toFixed(1)}{m.unit || ""}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
