'use client';

import { useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Bold, MapPin } from 'lucide-react';
import { getUserProfile } from '@/services/userService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import WKT from 'terraformer-wkt-parser';
import FieldMetrics from "./FieldMetrics";
import * as wellknown from 'wellknown';
import { toast } from 'react-hot-toast';
import { fetchAllFields } from '@/services/cornfieldService';
import { fetchAllUserFieldsInfo } from '@/services/cornfieldService';
import { fetchMyFields } from '@/services/cornfieldService';


interface SelectedField {
    feature: any;
    info: any;
}

function createButton(text: string, onClick: () => void) {
    const btn = L.DomUtil.create('button', '');
    btn.type = 'button';
    btn.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%">${text}</span>`;
    Object.assign(btn.style, {
        width: '120px',
        backgroundColor: 'white',
        padding: '8px 12px',
        border: '1px solid #888',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '6px',
    });
    L.DomEvent.on(btn, 'click', e => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        onClick();
    });
    return btn;
}

export default function MapClient() {
    const [user, setUser] = useState<any>(null);
    const userRef = useRef<any>(null);
    const mapRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const allFieldsLayerRef = useRef<L.FeatureGroup | null>(null);
    const [selectedField, setSelectedField] = useState<any>(null);
    const [cornfields, setCornfields] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Array<any>>([]);
    const [farmersList, setFarmersList] = useState<Array<any>>([]);
    const searchLayerRef = useRef<L.FeatureGroup | null>(new L.FeatureGroup());
    const bufferLayerRef = useRef<L.Layer | L.LayerGroup | null>(null);
    const allBuffersLayerRef = useRef<L.FeatureGroup | null>(null);

    const diseaseColorMap: Record<string, string> = {
        healthy: "#33CC00",
        healthy_blast_risk: "#66E000",
        healthy_brown_spot_risk: "#80E61A",
        healthy_bacterial_leaf_blight_risk: "#99EC33",
        healthy_high_blast_risk: "#B2F24D",
        healthy_high_brown_spot_risk: "#CBF866",
        healthy_high_bacterial_leaf_blight_risk: "#99FF99",

        blast: "#FFCC99",
        blast_critical: "#FF9900",

        brown_spot: "#FFB3FF",
        brown_spot_critical: "#FB00FF",

        bacterial_leaf_blight: "#FFB3D1",
        bacterial_leaf_blight_critical: "#CC3366"
    };

    const DISEASE_MAP: Record<string, string> = {
        healthy: "Khỏe mạnh",

        healthy_blast_risk: "Khỏe mạnh (có nguy cơ đạo ôn)",
        healthy_brown_spot_risk: "Khỏe mạnh (có nguy cơ đốm nâu)",
        healthy_bacterial_leaf_blight_risk: "Khỏe mạnh (có nguy cơ cháy bìa lá)",

        healthy_high_blast_risk: "Khỏe mạnh (nguy cơ cao đạo ôn)",
        healthy_high_brown_spot_risk: "Khỏe mạnh (nguy cơ cao đốm nâu)",
        healthy_high_bacterial_leaf_blight_risk: "Khỏe mạnh (nguy cơ cao cháy bìa lá)",

        blast: "Đạo ôn",
        blast_critical: "Đạo ôn (khẩn cấp)",

        brown_spot: "Đốm nâu",
        brown_spot_critical: "Đốm nâu (khẩn cấp)",

        bacterial_leaf_blight: "Cháy bìa lá",
        bacterial_leaf_blight_critical: "Cháy bìa lá (khẩn cấp)"
    };

    useEffect(() => {
        const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/sse/subscribe/`);
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("data from SSE:", data);

                // 1. Update popup nếu đang mở ruộng đó
                setSelectedField((prev: SelectedField | null) => {
                    if (!prev || prev.feature.properties.id === data.cornfield_id) {
                        return prev
                            ? { ...prev, info: { ...prev.info, ...data } }
                            : { feature: { properties: { id: data.cornfield_id } }, info: data };
                    }
                    return prev;
                });

                // 2. Merge payload vào state cornfields
                setCornfields(prev => {
                    const idx = prev.findIndex(f => f.cornfield?.id === data.cornfield_id);
                    if (idx !== -1) {
                        const newArr = [...prev];
                        newArr[idx] = { ...newArr[idx], ...data };
                        return newArr;
                    } else {
                        return [data, ...prev];
                    }
                });

                // 3. Update màu ruộng trên map
                const layer = allFieldsLayerRef.current?.getLayers().find(
                    (l: any) => Number(l._cornfieldId) === Number(data.cornfield_id)
                );
                if (layer) {
                    const color = diseaseColorMap[data.disease_class] || '#2611dd';
                    (layer as L.Path).setStyle({ color, fillOpacity: 0.45 });
                }

            } catch (err) {
                console.error("SSE parse error:", err);
            }
        };


        eventSource.onerror = (err) => {
            console.warn("SSE error", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            mapRef.current?.invalidateSize();
        }, 250);
        const info = selectedField?.info;
        const map = mapRef.current;

        if (map && info && info.gps_lat && info.gps_lon) {
            map.flyTo([info.gps_lat, info.gps_lon], 18, { animate: true, duration: 1.0 });
        }
        return () => clearTimeout(timer);
    }, [selectedField]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getUserProfile();
                if (mounted) setUser(data);
            } catch (err) {
                console.error('Lỗi tải user:', err);
            }
        })();
        const loadFarmersList = async () => {
            try {
                const allInfo = await fetchAllUserFieldsInfo();
                const allInfoData = Array.isArray(allInfo?.data)
                    ? allInfo.data
                    : Array.isArray(allInfo)
                        ? allInfo
                        : [];

                const normalized = Array.from(
                    new Map(
                        allInfoData
                            .map((f: any) => f.farmer)
                            .filter((f: any) => f && f.id != null)
                            .map((f: any) => [f.id, {
                                id: f.id,
                                first_name: f.first_name ?? '',
                                last_name: f.last_name ?? '',
                                email: f.email ?? '',
                                displayName: `${f.last_name ?? ''} ${f.first_name ?? ''}`.trim() || 'Không tên',
                            }])
                    ).values()
                );

                if (mounted) {
                    setFarmersList(normalized);
                }
            } catch (err) {
            }
        };

        loadFarmersList();
        return () => {
            mounted = false;
        };
    }, []);

    searchLayerRef.current?.clearLayers();
    async function handleSelectFarmerId(farmerId: number) {
        // 1) fetch public infos (or reuse a cached copy if you have it)
        let allInfoData: any[] = [];
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/info/public/`);
            if (!res.ok) throw new Error('Fail fetch public info');
            const payload = await res.json();
            allInfoData = payload?.data || payload || [];
        } catch (err) {
            console.error('Lỗi fetch public info for search:', err);
            return;
        }

        // 2) find records for farmerId
        const matches = (allInfoData || []).filter((r: any) => r.farmer?.id === farmerId);

        if (!matches.length) {
            toast(`Không tìm thấy ruộng cho nông dân này.`);
            return;
        }

        // 3) compute bounds of all cornfields of this farmer (use geometry or gps coords)
        const layersToHighlight: any[] = [];
        const ids = new Set<number>();
        matches.forEach(m => {
            const cid = m.cornfield?.id ?? m.cornfield?.properties?.id;
            if (cid != null) ids.add(Number(cid));
        });

        // find layers in allFieldsLayerRef (đã tồn tại) by _cornfieldId
        const layerGroup = allFieldsLayerRef.current;
        if (layerGroup) {
            layerGroup.eachLayer((layer: any) => {
                const layerId = Number(layer._cornfieldId ?? layer.id ?? layer.feature?.properties?.id);
                if (ids.has(layerId)) {
                    layersToHighlight.push(layer);
                }
            });
        }

        // if no layer found in existing layerGroup, attempt to render these features (fallback)
        if (!layersToHighlight.length) {
            // fallback: create geojson and render (reuse renderFieldsOnMap)
            // Build geojson from matches.cornfield.geometry if available (WKT strings)
            try {
                const features = (matches || []).map((m: any) => {
                    const geom = (m.cornfield?.geometry && typeof m.cornfield.geometry === 'string')
                        ? WKT.parse(m.cornfield.geometry.replace(/^SRID=\d+;/, ''))
                        : (m.cornfield?.geometry || {});
                    return {
                        type: 'Feature',
                        geometry: geom,
                        properties: { id: m.cornfield?.id, name: m.cornfield?.properties?.name }
                    };
                });
                const geojson = {
                    type: 'FeatureCollection' as const,
                    features,
                };
                // renderFieldsOnMap(geojson, new Set(features.map(f => f.properties.id)), matches, true);
                // instead of calling renderFieldsOnMap (which may override other UI),
                // add layers directly:
                const map = mapRef.current;
                L.geoJSON(geojson, {
                    style: { color: '#ff9900', weight: 3, fillOpacity: 0.35 }
                }).eachLayer((l: any) => {
                    l.on("click", () => {
                        const info = matches.find((m: any) =>
                            Number(m.cornfield?.id) === Number(l.feature?.properties?.id)
                        );

                        setSelectedField({
                            feature: l.feature,
                            info
                        });
                    });
                    l._isSearchLayer = true;
                    l.addTo(map!);
                    layersToHighlight.push(l);

                });
            } catch (err) {
                console.warn('Fallback render polygons failed', err);
            }
        }
        // 4) highlight: dùng đúng màu bệnh giống bộ lọc, không mở popup
        const map = mapRef.current;
        if (!map || !layersToHighlight.length) return;

        // reset style tất cả ruộng (không đổi màu bệnh)
        allFieldsLayerRef.current?.eachLayer((l: any) => {
            try {
                const originalColor = l._originalColor || "#2611dd";
                const originalFill = l._originalFill || 0.45;

                (l as L.Path).setStyle?.({
                    color: originalColor,
                    weight: 2,
                    fillOpacity: originalFill
                });
            } catch { }
        });

        // tạo nhóm để zoom
        const group = L.featureGroup();

        layersToHighlight.forEach((l: any) => {
            try {
                const info = matches.find((m: any) =>
                    Number(m.cornfield?.id) === Number(l.feature?.properties?.id)
                );

                const disease = info?.disease_class;
                const color = disease
                    ? diseaseColorMap[disease]
                    : "#2611dd";

                (l as any)._originalColor = color;
                (l as any)._originalFill = 0.45;

                (l as L.Path).setStyle?.({
                    color,
                    weight: 3,
                    fillOpacity: 0.6
                });

                group.addLayer(l);
            } catch (err) {
                console.warn(err);
            }
        });

        const searchWrapper = document.getElementById('search-box-wrapper') as HTMLElement | null;
        if (searchWrapper) {
            searchWrapper.style.display = 'none';
            const searchInputDom = document.getElementById('farmer-search-input') as HTMLInputElement | null;
            if (searchInputDom) searchInputDom.value = '';
            const sugDiv = document.getElementById('farmer-suggestions'); if (sugDiv) sugDiv.innerHTML = '';
        }
    }

    function normalizeText(str: string) {
        return (str || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    useEffect(() => {
        const handler = (e: any) => {
            const val = (e?.detail?.value ?? '').trim().toLowerCase();
            setSearchTerm(val);

            if (!val) {
                setSuggestions([]);
                const sugDiv = document.getElementById('farmer-suggestions');
                if (sugDiv) sugDiv.innerHTML = '';
                return;
            }

            if (!farmersList || farmersList.length === 0) return;

            const valNorm = normalizeText(val);
            const matches = farmersList.filter(f => {
                const n1 = normalizeText(`${f.last_name ?? ''} ${f.first_name ?? ''}`);
                const n2 = normalizeText(`${f.first_name ?? ''} ${f.last_name ?? ''}`);
                const email = normalizeText(f.email ?? "");
                return n1.includes(valNorm) || n2.includes(valNorm) || email.includes(valNorm);
            }).slice(0, 8);

            setSuggestions(matches);

            const sugDiv = document.getElementById('farmer-suggestions');
            if (sugDiv) {
                sugDiv.innerHTML = matches.map(m => `
        <div class="farmer-suggestion-item" data-id="${m.id}" style="padding:6px;border-radius:6px;cursor:pointer;border:1px solid #eee;margin-top:4px;background:white;">
          ${m.displayName}
        </div>
      `).join('');

                Array.from(sugDiv.querySelectorAll('.farmer-suggestion-item')).forEach((el: any) => {
                    el.onclick = () => handleSelectFarmerId(Number(el.getAttribute('data-id')));
                });
            }
        };

        window.addEventListener('farmer-search-input', handler);
        return () => window.removeEventListener('farmer-search-input', handler);
    }, [farmersList]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.warn('Không tìm thấy phần tử #map');
            return;
        }

        const svgString = renderToString(
            <MapPin
                size={34}
                fill="#FACC15"
                stroke="#b45309"
                strokeWidth={1}
                className="animate-bounce-smooth"
            />
        );

        const mapPinIcon = L.divIcon({
            html: svgString,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -30],
        });

        const map = L.map(mapElement, {
            center: [10.8738, 106.5899],
            zoom: 12,
            preferCanvas: true,
        });
        mapRef.current = map;

        // fetch('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer?f=pjson')
        //     .then(res => res.json())
        //     .then(data => {
        //         console.log('Thông tin lớp Esri World Imagery:', data);

        //         if (data?.documentInfo?.Modified) {
        //             const modifiedDate = new Date(data.documentInfo.Modified);
        //             console.log('Ngày cập nhật gần nhất của dịch vụ Esri:', modifiedDate.toLocaleString('vi-VN'));
        //         }
        //     })
        //     .catch(err => console.error('Không thể tải metadata Esri:', err));
        // https://livingatlas.arcgis.com/wayback/#mapCenter=116.40978%2C39.51004%2C14&mode=explore&active=20512

        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        });

        const satelliteLayer = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { maxZoom: 19, attribution: 'Tiles © Esri' }
        );

        satelliteLayer.addTo(map);
        L.control
            .layers(
                { 'Bản đồ đường phố': osmLayer, 'Ảnh vệ tinh': satelliteLayer },
                {},
                { collapsed: true }
            )
            .addTo(map);

        fetch('/hocmon.geojson')
            .then(res => res.json())
            .then(data => {
                if (!data?.features || !mapRef.current) return;

                mapRef.current.whenReady(() => {
                    const hocmonLayer = L.geoJSON(data, {
                        style: { color: '#dd1111ff', weight: 2, fillOpacity: 0 },
                    }).addTo(mapRef.current!);

                    hocmonLayer.bindPopup('Xã Hóc Môn');
                    mapRef.current!.fitBounds(hocmonLayer.getBounds());
                });
            })
            .catch(err => console.error('Lỗi tải ranh giới Hóc Môn:', err));

        const allFieldsLayer = new L.FeatureGroup();
        allFieldsLayer.addTo(map);
        allFieldsLayerRef.current = allFieldsLayer;

        const allBuffersLayer = new L.FeatureGroup();
        allBuffersLayer.addTo(map);
        allBuffersLayerRef.current = allBuffersLayer;

        const searchLayer = new L.FeatureGroup();
        searchLayer.addTo(map);
        searchLayerRef.current = searchLayer;

        function renderFieldsOnMap(
            allData: any,
            myFieldIds: Set<number>,
            myFields: any[],
            showOthers = true
        ) {
            if (allBuffersLayerRef.current) {
                allBuffersLayerRef.current.clearLayers();
            }

            const features = allData.features.map((f: any) => {
                const geom = WKT.parse((f.geometry || "").replace(/^SRID=\d+;/, ""));
                return {
                    type: "Feature",
                    geometry: geom,
                    properties: {
                        id: f.id,
                        cornfieldId: f.id,
                        name: f.name,
                        area_m2: f.area_m2,
                    },
                };
            });

            features.forEach((feature: any) => {
                const fieldId = feature.properties.id;
                const shouldShow = myFieldIds.has(fieldId);

                if (!shouldShow && !showOthers) return;

                const info = myFields.find((f: any) => f.cornfield?.id === fieldId);

                const disease = info?.disease_class;
                const status = info?.status;

                const color = disease ? diseaseColorMap[disease] : "#2611dd";
                const fillOpacity = disease ? 0.45 : status ? 0.45 : 0.25;

                const layer = L.geoJSON(feature, { style: { color, weight: 2, fillOpacity } });

                const popupContent = createFieldPopupContent(feature, info);

                layer.eachLayer((l: any) => {
                    l._cornfieldId = feature.properties.id;
                    l.id = feature.properties.id;
                    (l as any)._originalColor = color;
                    (l as any)._originalFill = fillOpacity;

                    l.on('click', () => {
                        setSelectedField({ feature, info });
                    });

                    allFieldsLayerRef.current?.addLayer(l);
                });

                if (info && typeof info.gps_lat === 'number' && typeof info.gps_lon === 'number') {
                    if (info.gps_lat !== 0 || info.gps_lon !== 0) {
                        const center: L.LatLngExpression = [info.gps_lat, info.gps_lon];
                        const bufferRadius = 20;

                        const bufferCircle = L.circle(center, {
                            color: '#fff',
                            weight: 1,
                            fill: false,
                            radius: bufferRadius,
                            dashArray: '5, 5',
                            interactive: false
                        });

                        const centerPoint = L.circleMarker(center, {
                            radius: 3,
                            color: '#fff',
                            weight: 1,
                            fillColor: color,
                            fillOpacity: 1,
                            interactive: false
                        });

                        if (allBuffersLayerRef.current) {
                            allBuffersLayerRef.current.addLayer(bufferCircle);
                            allBuffersLayerRef.current.addLayer(centerPoint);
                        }
                    }
                }
            });

            if (allBuffersLayerRef.current) {
                (allBuffersLayerRef.current as any).bringToFront();
            }
        }

        function createFieldPopupContent(field: any, info: any) {
            const status = info?.status;
            const disease = info?.disease_class;
            const color = diseaseColorMap[disease] || "#2611dd";
            const fillOpacity = disease ? 0.45 : 0.25;
            const ownerName = info?.farmer
                ? `${info.farmer.last_name ?? ''} ${info.farmer.first_name ?? ''}`.trim() || 'Không tên'
                : field.properties?.name || 'Không tên';

            const area = info?.cornfield?.properties?.area_m2
                ? Math.round(info.cornfield.properties.area_m2)
                : Math.round(field.properties?.area_m2 || 0);

            return `
        <div style="min-width:220px;font-size:13px;">
        <h3 style="margin:0 0 6px 0;">Ruộng của nông dân: ${ownerName}</h3>
        <p>Diện tích khoảng: ${area} m²</p>
        ${disease ? `<p style="color:${color};font-weight:600">
        Trạng thái bệnh: ${DISEASE_MAP[disease] ?? disease}</p>` : ''}
        ${info?.image_rel ? `<img src="${info.image_rel}" style="width:100%;margin:4px 0;border-radius:4px;" />` : ''}
        ${info ? `
        <ul style="padding-left:16px;margin:4px 0;">
          ${info.temp ? `<li>Nhiệt độ: ${info.temp}°C</li>` : ''}
          ${info.hum ? `<li>Độ ẩm: ${info.hum}%</li>` : ''}
          ${info.ph ? `<li>pH: ${info.ph}</li>` : ''}
          ${info.soil ? `<li>Độ ẩm đất: ${info.soil}</li>` : ''}
          ${info.wind ? `<li>Gió: ${info.wind} m/s</li>` : ''}
          ${info.lux ? `<li>Sáng: ${info.lux} lux</li>` : ''}
        </ul>
      ` : ''}
    </div>
  `;
        }

        // const legend = new L.Control({ position: 'bottomleft' });
        // legend.onAdd = () => {
        //     const div = L.DomUtil.create('div', 'info legend');
        //     div.innerHTML = `
        //         <h2 style="font-size:16px; font-weight:bold; line-height:1.5">Trạng thái ruộng</h2>
        //         <div style="font-size:13px; line-height:1.5; display:flex; flex-direction:column; gap:3px;">

        //         <!-- Khỏe mạnh -->
        //         <div style="display:flex;">
        //         <i style="background:#E6FFE6;width:14px;height:14px;"></i>
        //         <i style="background:#CCFFCC;width:14px;height:14px;"></i>
        //         <i style="background:#B3FFB3;width:14px;height:14px;"></i>

        //         </div>

        //         <!-- Đạo ôn -->
        //         <div style="display:flex;">
        //         <i style="background:#FFE6CC;width:14px;height:14px;"></i>
        //         <i style="background:#FFD9B3;width:14px;height:14px;"></i>
        //         <i style="background:#FFCC99;width:14px;height:14px;"></i>
        //         <i style="background:#FFBF80;width:14px;height:14px;"></i>
        //         <i style="background:#FFB266;width:14px;height:14px;"></i>
        //         <i style="background:#FFA54D;width:14px;height:14px;"></i>
        //         <i style="background:#FF9933;width:14px;height:14px;"></i>
        //         <i style="background:#FF8C1A;width:14px;height:14px;"></i>
        //         <i style="background:#FF8000;width:14px;height:14px;"></i>
        //         <i style="background:#FF9900;width:14px;height:14px;"></i>
        //         <span style="margin-left:5px;">Đạo ôn</span>
        //         </div>

        //         <!-- Đốm nâu -->
        //         <div style="display:flex;">
        //         <i style="background:#FFE6FF;width:14px;height:14px;"></i>
        //         <i style="background:#FFCCFF;width:14px;height:14px;"></i>
        //         <i style="background:#FFB3FF;width:14px;height:14px;"></i>
        //         <i style="background:#FF99FF;width:14px;height:14px;"></i>
        //         <i style="background:#FF80FF;width:14px;height:14px;"></i>
        //         <i style="background:#FF66FF;width:14px;height:14px;"></i>
        //         <i style="background:#FF33FF;width:14px;height:14px;"></i>
        //         <i style="background:#FF00FF;width:14px;height:14px;"></i>
        //         <i style="background:#FB00FF;width:14px;height:14px;"></i>
        //         <i style="background:#FB00FF;width:14px;height:14px;"></i>
        //         <span style="margin-left:5px;">Đốm nâu</span>
        //         </div>

        //         <!-- Cháy bìa lá -->
        //         <div style="display:flex;">
        //         <i style="background:#FFE6F0;width:14px;height:14px;"></i>
        //         <i style="background:#FFCCE0;width:14px;height:14px;"></i>
        //         <i style="background:#FFB3D1;width:14px;height:14px;"></i>
        //         <i style="background:#FF99C1;width:14px;height:14px;"></i>
        //         <i style="background:#FF80B2;width:14px;height:14px;"></i>
        //         <i style="background:#FF66A3;width:14px;height:14px;"></i>
        //         <i style="background:#FF4D94;width:14px;height:14px;"></i>
        //         <i style="background:#FF3366;width:14px;height:14px;"></i>
        //         <i style="background:#CC3366;width:14px;height:14px;"></i>
        //         <i style="background:#CC3366;width:14px;height:14px;"></i>
        //         <span style="margin-left:5px;">Cháy bìa lá</span>
        //         </div>
        //         </div>
        //         `;

        //     div.style.background = '#ffffff';
        //     div.style.padding = '8px 10px';
        //     div.style.borderRadius = '8px';
        //     div.style.color = '#000000';
        //     return div;
        // };
        // legend.addTo(map);

        // Bộ lọc ruộng
        const filterControl = new L.Control({ position: 'topright' });

        filterControl.onAdd = () => {
            const container = L.DomUtil.create('div', 'field-filter');
            container.style.background = 'rgba(255,255,255,0.9)';
            container.style.padding = '8px 12px';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            container.style.fontSize = '13px';
            container.style.lineHeight = '1.5';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '6px';
            container.style.minWidth = '160px';
            container.style.position = 'absolute';
            container.style.top = '80px';
            container.style.right = '1px';
            container.style.zIndex = '1000';

            container.innerHTML = `
        <strong>🌾Lọc ruộng</strong>
        <select id="field-filter-select" style="
            width:100%;
            padding:4px;
            border:1px solid #aaa;
            border-radius:4px;
            font-size:13px;
        ">
            <option value="none">Không hiển thị ruộng</option>
            <option value="all">Hiển thị tất cả ruộng</option>
            <option value="mine">Ruộng của tôi</option>
            <option value="healthy">Khỏe mạnh</option>
            <option value="blast">Đạo ôn</option>
            <option value="brown_spot">Đốm nâu</option>
            <option value="bacterial_leaf_blight">Cháy bìa lá</option>
        </select>
    `;

            container.innerHTML = `
    <button id="info-btn" title="Thông tin trạng thái" style="
    display:flex;align-items:center;justify-content:center;
    width:full;height:30px;border-radius:4px;border:1px solid #aaa;cursor:pointer;
    ">Ý nghĩa các màu của ruộng</button>
  <div style="display:flex;gap:6px;align-items:center;">
  
    <button id="toggle-search-btn" title="Tìm nông dân theo tên" style="
        display:flex;align-items:center;justify-content:center;
        width:36px;height:30px;border-radius:4px;border:1px solid #aaa;cursor:pointer;">
        Tên
    </button>
    <select id="field-filter-select" style="flex:1; padding:4px;border:1px solid #aaa;border-radius:4px;font-size:13px;">
      <option value="none">Không hiển thị ruộng</option>
      <option value="all">Hiển thị tất cả ruộng</option>
      <option value="mine">Ruộng của tôi</option>
      <option value="healthy">Khỏe mạnh</option>
      <option value="blast">Đạo ôn</option>
      <option value="brown_spot">Đốm nâu</option>
      <option value="bacterial_leaf_blight">Cháy bìa lá</option>
    </select>
  </div>

  <div id="search-box-wrapper" style="margin-top:8px;display:none;position:relative;">
    <input id="farmer-search-input" placeholder="Tìm theo họ/tên..." style="width:100%;padding:6px;border:1px solid #aaa;border-radius:6px;font-size:13px;" />
    <div id="farmer-suggestions" style="position:relative;"></div>
  </div>
  <div id="date-filter-wrapper" style="margin-top:8px;">
  <label style="font-size:12px;">Lọc theo ngày:</label>
  <input type="date" id="date-filter-start" style="width:100%;padding:6px;border:1px solid #aaa;border-radius:6px;font-size:13px;margin-top:4px;" />

  <label style="font-size:12px;margin-top:6px;">Đến ngày:</label>
  <input type="date" id="date-filter-end" style="width:100%;padding:6px;border:1px solid #aaa;border-radius:6px;font-size:13px;margin-top:4px;" />

  <button id="apply-date-filter" style="
      margin-top:8px;width:100%;padding:6px;
      border:1px solid #4caf50;border-radius:6px;
      background:#4caf50;color:white;cursor:pointer;
  ">
    Áp dụng lọc ngày
  </button>
  <div id="info-popup" style="
    display:none;
    position:absolute;
    top:42px;
    right:0;
    background:white;
    border:1px solid #ccc;
    border-radius:8px;
    padding:12px;
    width:320px;
    box-shadow:0 2px 8px rgba(0,0,0,0.25);
    font-size:13px;
    z-index:9999;
">
        <button id="info-close-btn" style="
            background:none;
            border:none;
            font-size:16px;
            cursor:pointer;
            color:#555;
            float: right;
        ">X</button>

    <div style="font-size:13px; line-height:1.5; display:flex; flex-direction:column; gap:10px;">

    <div style="display:flex; align-items:center; gap:8px;">
        <div style="
            width:18px;
            height:18px;
            background:#33CC00;
            flex-shrink:0;
        "></div>
        <span>Khỏe mạnh</span>
    </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#66E000;
                flex-shrink:0;
            "></div>
            <span>Khỏe mạnh (có nguy cơ đạo ôn)</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#80E61A;
                flex-shrink:0;
            "></div>
            <span>Khỏe mạnh (có nguy cơ đốm nâu)</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#99EC33;
                flex-shrink:0;
            "></div>
            <span>Khỏe mạnh (có nguy cơ cháy bìa lá)</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#B2F24D;
                flex-shrink:0;
            "></div>
            <span>Khỏe mạnh (nguy cơ cao đạo ôn)</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#CBF866;
                flex-shrink:0;
            "></div>
            <span>Khỏe mạnh (nguy cơ cao đốm nâu)</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#99FF99;
                flex-shrink:0;
            "></div>
            <span>Khỏe mạnh (nguy cơ cao cháy bìa lá)</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#FFCC99;
                flex-shrink:0;
            "></div>
            <span>Đạo ôn</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#FF9900;
                flex-shrink:0;
            "></div>
            <span>Đạo ôn (khẩn cấp)</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#FFB3FF;
                flex-shrink:0;
            "></div>
            <span>Đốm nâu</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#FB00FF;
                flex-shrink:0;
            "></div>
            <span>Đốm nâu (khẩn cấp)</span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#FFB3D1;
                flex-shrink:0;
            "></div>
            <span>Cháy bìa lá</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
            <div style="
                width:18px;
                height:18px;
                background:#CC3366;
                flex-shrink:0;
            "></div>
            <span>Cháy bìa lá (khẩn cấp)</span>
        </div>

    </div>
</div>
</div>
</div>

    `;
            const dateStart = container.querySelector('#date-filter-start') as HTMLInputElement | null;
            const dateEnd = container.querySelector('#date-filter-end') as HTMLInputElement | null;

            const dateBtn = container.querySelector('#apply-date-filter') as HTMLButtonElement | null;

            if (dateBtn && dateStart && dateEnd) {
                dateBtn.addEventListener('click', () => {
                    const start = dateStart.value ? new Date(dateStart.value) : null;
                    const end = dateEnd.value ? new Date(dateEnd.value) : null;

                    if (!start && !end) {
                        toast.error("Vui lòng chọn ít nhất 1 ngày!");
                        return;
                    }

                    applyDateFilter(start, end);
                });
            }

            L.DomEvent.on(container, 'click', e => L.DomEvent.stopPropagation(e));
            const toggleBtn = container.querySelector('#toggle-search-btn');
            const searchWrapper = container.querySelector('#search-box-wrapper') as HTMLElement;
            const searchInput = container.querySelector('#farmer-search-input') as HTMLInputElement;
            const suggestionsDiv = container.querySelector('#farmer-suggestions') as HTMLElement;

            if (toggleBtn && searchWrapper && searchInput && suggestionsDiv) {
                toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const open = searchWrapper.style.display !== 'none';
                    searchWrapper.style.display = open ? 'none' : 'block';
                    if (!open) {
                        searchInput.focus();
                    } else {
                        searchInput.value = '';
                        suggestionsDiv.innerHTML = '';
                    }
                });

                let debounceTimer: any = null;
                searchInput.addEventListener('input', (ev: any) => {
                    const val = ev.target.value;
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        const event = new CustomEvent('farmer-search-input', { detail: { value: val } });
                        window.dispatchEvent(event);
                    }, 200);
                });
                const dateStart = container.querySelector('#date-filter-start') as HTMLInputElement | null;
                const dateEnd = container.querySelector('#date-filter-end') as HTMLInputElement | null;
                const dateBtn = container.querySelector('#apply-date-filter') as HTMLButtonElement | null;

                if (dateBtn) {
                    dateBtn.addEventListener('click', () => {

                        if (!dateStart || !dateEnd) {
                            console.error("Date inputs not found");
                            return;
                        }

                        const start = dateStart.value ? new Date(dateStart.value) : null;
                        const end = dateEnd.value ? new Date(dateEnd.value) : null;

                        if (!start && !end) {
                            toast.error("Vui lòng chọn ít nhất 1 ngày!");
                            return;
                        }

                        applyDateFilter(start, end);
                    });
                }


            }
            const infoBtn = container.querySelector('#info-btn') as HTMLElement | null;
            const infoPopup = container.querySelector('#info-popup') as HTMLElement | null;
            const infoCloseBtn = container.querySelector('#info-close-btn') as HTMLElement | null;

            if (infoBtn && infoPopup) {
                infoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const isOpen = infoPopup.style.display !== 'none';
                    infoPopup.style.display = isOpen ? 'none' : 'block';
                });

                if (infoCloseBtn) {
                    infoCloseBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        infoPopup.style.display = 'none';
                    });
                }

                document.addEventListener('click', () => {
                    infoPopup.style.display = 'none';
                });

                infoPopup.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            return container;
        };
        filterControl.addTo(map);

        // Lắng nghe thay đổi bộ lọc
        map.whenReady(() => {
            const select = document.getElementById('field-filter-select') as HTMLSelectElement | null;
            if (!select) return;

            const mineOption = select.querySelector('option[value="mine"]') as HTMLOptionElement | null;
            if (mineOption) mineOption.style.display = user ? 'block' : 'none';
            select.addEventListener('change', async (e: Event) => {
                const value = (e.target as HTMLSelectElement).value;
                searchLayerRef.current?.clearLayers();
                if (mapRef.current) {
                    mapRef.current?.eachLayer((layer: any) => {
                        if (layer._isSearchLayer) {
                            mapRef.current?.removeLayer(layer);
                        }
                    });
                }
                allFieldsLayer.clearLayers();
                allBuffersLayerRef.current?.clearLayers();
                if (value === 'none') return;

                try {
                    const [allData, allInfo] = await Promise.all([
                        fetchAllFields(),
                        fetchAllUserFieldsInfo(),
                    ]);

                    let myData: any = { data: [] };
                    try {
                        myData = await fetchMyFields();
                    } catch (err) {
                    }

                    const myFieldIds = new Set<number>(
                        (myData?.data || []).map((f: any) => f.cornfield?.id).filter(Boolean)
                    );

                    const allInfoData = Array.isArray(allInfo?.data) ? allInfo.data : (Array.isArray(allInfo) ? allInfo : (allInfo?.data ?? []));
                    const latestAllInfoData = allInfoData || [];
                    const statusMap = new Map<number, number>();
                    (allInfoData || []).forEach((f: any) => {
                        if (f.cornfield?.id != null && f.status != null) {
                            statusMap.set(f.cornfield.id, f.status);
                        }
                    });

                    if (value === 'all') {
                        try {
                            const allInfo = await fetchAllUserFieldsInfo();
                            const list = latestAllInfoData;

                            const normalized = list
                                .map((f: any) => {
                                    const geomData = f.cornfield?.geometry;

                                    if (typeof geomData === "object") return null;

                                    if (typeof geomData === "string") {
                                        return {
                                            ...f,
                                            geometry: geomData,
                                        };
                                    }

                                    return null;
                                })
                                .filter(Boolean);

                            const geojson = {
                                type: "FeatureCollection",
                                features: normalized.map((f: any) => ({
                                    id: f.cornfield?.id,
                                    type: "Feature",
                                    geometry: f.geometry,
                                    properties: {
                                        id: f.cornfield?.id,
                                        name: f.cornfield?.properties?.name,
                                        area_m2: f.cornfield?.properties?.area_m2,
                                        farmer: f.farmer,
                                        status: f.status,
                                        ...f,
                                    },
                                })),
                            };

                            const allFieldIds = new Set<number>(
                                geojson.features
                                    .map((f: any) => Number(f.properties.id))
                            );


                            renderFieldsOnMap(geojson, allFieldIds, list, true);
                        } catch (error) {
                            console.error("Lỗi tải tất cả ruộng:", error);
                        }
                    }

                    else if (value === 'mine') {
                        renderFieldsOnMap(allData, myFieldIds, myData?.data || [], false);
                    } else if (['healthy', 'blast', 'brown_spot', 'bacterial_leaf_blight'].includes(value)) {
                        const filteredFields = (latestAllInfoData || []).filter(
                            (f: any) => f.disease_class === value && f.cornfield?.id !== undefined
                        );

                        const filteredIds = new Set<number>(
                            filteredFields.map((f: any) => f.cornfield!.id).filter(Boolean)
                        );

                        const filteredFeatures = (allData.features || []).filter((f: any) => {
                            const id = f.id ?? f.properties?.id;
                            return filteredIds.has(id);
                        });

                        const filteredGeoJSON = { ...allData, features: filteredFeatures };
                        renderFieldsOnMap(filteredGeoJSON, filteredIds, filteredFields, false);
                    }

                } catch (err) {
                    console.error('Lỗi khi lọc ruộng:', err);
                }
            });

        });

        // helper kiểm tra map
        function isMapReady() {
            return !!(mapRef.current && mapRef.current.getContainer()?.isConnected);
        }
        async function applyDateFilter(start: Date | null, end: Date | null) {
            const map = mapRef.current;
            const allFieldsLayer = allFieldsLayerRef.current;
            if (!map || !allFieldsLayer) return;

            allFieldsLayer.clearLayers();

            const [allData, allInfo] = await Promise.all([
                fetchAllFields(),
                fetchAllUserFieldsInfo(),
            ]);

            const infoList = Array.isArray(allInfo?.data) ? allInfo.data : allInfo;

            const matched = infoList.filter((f: any) => {
                const dt = new Date(f.updated_at || f.created_at);
                if (isNaN(dt.getTime())) return false;

                if (start && dt < start) return false;
                if (end && dt > end) return false;

                return true;
            });

            if (!matched.length) {
                toast("Không có ruộng nào trong khoảng ngày này.");
                return;
            }

            const ids = new Set<number>(
                matched
                    .map((m: any) => Number(m.cornfield?.id))
                    .filter((id: number) => !isNaN(id))
            );
            const filteredFeatures = (allData.features || []).filter((f: any) => {
                const id = Number(f.id ?? f.properties?.id);
                return ids.has(id);
            });

            const filteredGeoJSON = {
                ...allData,
                features: filteredFeatures,
            };

            renderFieldsOnMap(filteredGeoJSON, ids, matched, false);
        }

        async function checkGeolocationPermission(): Promise<'granted' | 'prompt' | 'denied' | 'unknown'> {
            if (!('permissions' in navigator)) return 'unknown';
            try {
                const status = await (navigator as any).permissions.query({ name: 'geolocation' });
                return status.state;
            } catch {
                return 'unknown';
            }
        }

        function addOrUpdateUserMarker(lat: number, lng: number) {
            if (!mapRef.current) return;
            const map = mapRef.current;
            if (!userMarkerRef.current) {
                userMarkerRef.current = L.marker([lat, lng], {
                    icon: mapPinIcon,
                    title: 'Vị trí của bạn',
                }).addTo(map);

                userMarkerRef.current.bindPopup('Bạn đang ở đây', {
                    className: 'my-popup',
                    offset: L.point(0, 5),
                });
            } else {
                userMarkerRef.current.setLatLng([lat, lng]);
            }
        }

        function locateUser(promptIfNeeded = false) {
            if (!('geolocation' in navigator)) {
                toast.error('Trình duyệt không hỗ trợ định vị.');
                return;
            }
            if (!isMapReady()) return;

            navigator.geolocation.getCurrentPosition(
                pos => {
                    if (!isMapReady()) return;
                    const { latitude, longitude } = pos.coords;
                    addOrUpdateUserMarker(latitude, longitude);

                    const map = mapRef.current!;
                    const onMoveEnd = () => {
                        try {
                            userMarkerRef.current?.openPopup();
                        } catch { }
                        map.off('moveend', onMoveEnd);
                    };
                    map.on('moveend', onMoveEnd);
                    map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.2 });
                },
                err => {
                    console.warn('Geolocation error:', err);
                    if (err.code === 1 && promptIfNeeded) toast.error('Vui lòng bật quyền định vị cho trang này.');

                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        }

        // thêm nút định vị
        const locateBtn = new L.Control({ position: 'bottomright' } as L.ControlOptions);
        locateBtn.onAdd = () => {
            return createButton('Vị trí của tôi', () => locateUser(true));
        };
        locateBtn.addTo(map);

        map.whenReady(async () => {
            try {
                const perm = await checkGeolocationPermission();
                if (perm === 'granted') locateUser(false);
                else console.info('Quyền định vị chưa cấp hoặc bị chặn.');
            } catch (err) {
                console.warn('Permission check failed:', err);
            }
        });

        // cleanup
        return () => {
            try {
                map.off();
                map.remove();
            } catch { }
            mapRef.current = null;
            userMarkerRef.current = null;
            allFieldsLayerRef.current = null;
            allBuffersLayerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const select = document.getElementById('field-filter-select') as HTMLSelectElement | null;
        if (!select) return;

        const mineOption = select.querySelector('option[value="mine"]') as HTMLOptionElement | null;
        if (!mineOption) return;

        if (user) {
            mineOption.style.display = 'block';
        } else {
            mineOption.style.display = 'none';
            if (select.value === 'mine') select.value = 'none'; // tránh select "mine" khi chưa đăng nhập
        }
    }, [user]);

    function getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }

    // effect xử lý quyền admin
    useEffect(() => {
        if (!user) return;
        if (user.role !== 'admin') return;

        const map = mapRef.current;
        const allFieldsLayer = allFieldsLayerRef.current;
        if (!map || !allFieldsLayer) return;

        const drawControl = new (L.Control as any).Draw({
            edit: { featureGroup: allFieldsLayer, remove: true },
            draw: { polygon: true, polyline: false, rectangle: false, circle: false, marker: false, circlemarker: false },
        });
        map.addControl(drawControl);
        let showApiPolygons = false;

        const loadApiPolygons = async (): Promise<L.FeatureGroup | null> => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/`, {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error(`Fetch lỗi: ${res.statusText}`);

                const data = await res.json();
                const features = data.features || [];

                const layerGroup = L.featureGroup();

                features.forEach((f: any) => {
                    if (!f.geometry) return;
                    const geom = (wellknown as any).parse(f.geometry.replace(/^SRID=\d+;/, ''));
                    if (!geom) return;

                    const layer = L.geoJSON(geom, {
                        style: {
                            color: '#4339b6ff',
                            weight: 2,
                            fillOpacity: 0.3,
                        },
                    }).getLayers()[0];
                    (layer as any)._cornfieldId = f.id;
                    allFieldsLayer.addLayer(layer);
                });

                return layerGroup;
            } catch (err) {
                return null;
            }
        };

        const toggleApiPolygons = async () => {
            if (!map || !allFieldsLayerRef.current) return;

            if (!showApiPolygons) {
                const features = await loadApiPolygons();
                if (features) {
                    features.eachLayer((layer: any) => allFieldsLayerRef.current?.addLayer(layer));
                }
                showApiPolygons = true;
            } else {
                allFieldsLayerRef.current.clearLayers();
                showApiPolygons = false;
            }
        };

        const showPolygonsBtn = new L.Control({ position: 'topleft' });
        showPolygonsBtn.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const btn = L.DomUtil.create('a', '', div);
            btn.innerHTML = '👁️';
            btn.title = 'Hiển thị polygon API';
            btn.style.cursor = 'pointer';
            btn.onclick = (e) => {
                e.preventDefault();
                toggleApiPolygons();
            };
            return div;
        };

        showPolygonsBtn.addTo(map);


        const handleCreated = async (e: any) => {
            try {
                const layer = e.layer;
                allFieldsLayer.addLayer(layer);

                const user = userRef.current;
                const payload = {
                    name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || 'unknown_user',
                    owner: user?.id ?? 1,
                    geom: layer.toGeoJSON().geometry,
                };

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    const saved = await res.json();
                    (layer as any).id = saved.id;
                    layer._cornfieldId = saved.id;
                    console.log('Success:', saved);
                } else console.error('Lưu ruộng thất bại', res.statusText);
            } catch (err) {
                console.error('Error handling draw created:', err);
            }
        };

        const handleDeleted = async (e: any) => {
            e.layers.eachLayer(async (layer: any) => {
                const id = layer.id ?? layer._cornfieldId ?? layer.feature?.properties?.id;
                if (!id) return console.warn('Không tìm thấy ID để xóa');
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/${id}/`, { method: 'DELETE' });
                    if (res.ok) console.log(`Delete sucessfully with id = ${id}`);
                    else console.error('Fail', res.status, res.statusText);
                } catch (err) {
                    console.error('Error:', err);
                }
            });
        };

        const handleEdited = async (e: any) => {
            e.layers.eachLayer(async (layer: any) => {
                const id = layer.id ?? layer._cornfieldId ?? layer.feature?.properties?.id;
                if (!id) {
                    console.warn('Layer chưa có ID, không thể cập nhật');
                    return;
                }

                const payload = { geom: layer.toGeoJSON().geometry };

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/${id}/`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                    if (res.ok) console.log(`Cập nhật thành công id=${id}`);
                    else console.error('Fail', res.status, res.statusText);
                } catch (err) {
                    console.error('Error khi edit polygon:', err);
                }
            });
        };


        map.on((L as any).Draw.Event.CREATED, handleCreated);
        map.on((L as any).Draw.Event.EDITED, handleEdited);
        map.on('draw:deleted', handleDeleted);

        return () => {
            map.off((L as any).Draw.Event.CREATED, handleCreated);
            map.off('draw:deleted', handleDeleted);
            map.removeControl(drawControl);
        };
    }, [user]);

    return (
        <div className="relative flex flex-col lg:flex-row h-[89vh] w-full overflow-hidden">

            {/* 1. INFO PANEL 
                - Desktop: Nằm bên TRÁI (do đặt trước trong HTML + flex-row), có border-r
                - Mobile: Fixed dưới đáy (Bottom Sheet)
            */}
            <div
                className={`
                    bg-white overflow-y-auto transition-all duration-300 ease-in-out z-[1001]
                    
                    /* --- MOBILE STYLES (Mặc định) --- */
                    fixed bottom-0 left-0 w-full
                    rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)]
                    ${selectedField ? 'h-[60vh] translate-y-0' : 'h-0 translate-y-full'}

                    /* --- DESKTOP STYLES (Màn hình lớn lg trở lên) --- */
                    lg:static lg:h-full lg:shadow-none lg:rounded-none lg:translate-y-0
                    lg:border-r lg:border-gray-200 /* Đổi viền sang bên phải */
                    ${selectedField ? 'lg:w-[40%]' : 'lg:w-0'}
                    
                    p-0
                `}
            >
                {selectedField ? (
                    <div className="relative h-full flex flex-col">
                        {/* Header & Nút đóng */}
                        <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-2 border-b border-gray-100 flex justify-between items-start">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-yellow-500">
                                <img src="/rice.png" alt="Rice" className="w-8 h-8" />
                                Thông tin ruộng
                            </h2>

                            <button
                                onClick={() => setSelectedField(null)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                                title="Đóng"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Nội dung scroll */}
                        <div className="p-4 space-y-5 animate-fadeIn flex-1 overflow-y-auto">
                            <div className="flex flex-col sm:flex-row gap-4 bg-white border rounded-xl p-4 items-start shadow-sm">
                                {selectedField.info?.image_rel ? (
                                    <div className="flex-shrink-0 w-full sm:w-[120px] h-[160px] sm:h-[120px] overflow-hidden rounded-lg shadow-sm">
                                        <img
                                            src={selectedField.info.image_rel}
                                            alt="Ảnh ruộng"
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full sm:w-[120px] h-[120px] bg-gray-50 flex items-center justify-center text-gray-400 italic rounded-lg border border-dashed">
                                        Không có ảnh
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-y-2 text-gray-800 text-[14px] w-full">
                                    <div className="flex justify-between border-b border-gray-50 pb-1">
                                        <span className="font-semibold text-gray-600">Nông dân:</span>
                                        <span className="font-medium truncate pl-2">
                                            {selectedField.info?.farmer
                                                ? `${selectedField.info.farmer.last_name ?? ''} ${selectedField.info.farmer.first_name ?? ''}`
                                                : selectedField.field?.properties?.name ?? 'Chưa có thông tin'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-b border-gray-50 pb-1">
                                        <span className="font-semibold text-gray-600">Diện tích:</span>
                                        <span className="">
                                            {Math.round(
                                                selectedField.info?.cornfield?.properties?.area_m2 ||
                                                selectedField.feature?.properties?.area_m2 ||
                                                0
                                            ).toLocaleString()} m²
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-b border-gray-50 pb-1">
                                        <span className="font-semibold text-gray-600">Trạng thái:</span>
                                        <span className="font-semibold">
                                            {selectedField.info?.disease_class ? (
                                                <span
                                                    style={{
                                                        color: diseaseColorMap[selectedField.info.disease_class] || '#333',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {DISEASE_MAP[selectedField.info.disease_class] || selectedField.info.disease_class}
                                                </span>
                                            ) : (
                                                'Không có dữ liệu'
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between pt-1">
                                        <span className="font-semibold text-gray-600">Cập nhật:</span>
                                        <span className="italic text-gray-500 text-xs flex items-center">
                                            {(() => {
                                                const dateStr =
                                                    selectedField.info?.updated_at ||
                                                    selectedField.info?.created_at ||
                                                    selectedField.feature?.properties?.created_at;
                                                const date = new Date(dateStr);
                                                return isNaN(date.getTime())
                                                    ? 'Chưa có thông tin'
                                                    : date.toLocaleString('vi-VN');
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <FieldMetrics info={selectedField.info} />

                            {/* Đệm dưới cùng cho mobile */}
                            <div className="h-8 lg:h-0"></div>
                        </div>
                    </div>
                ) : (
                    // Placeholder khi chưa chọn ruộng (chỉ hiện trên Desktop)
                    <div className="hidden lg:flex flex-col items-center justify-center h-full text-gray-400 italic">
                        <img src="/rice.png" alt="Rice" className="w-16 h-16 opacity-20 mb-2" />
                        <span>Ấn vào 1 ruộng để xem chi tiết 🌱</span>
                    </div>
                )}
            </div>

            {/* 2. MAP CONTAINER 
                - Desktop: Nằm bên PHẢI (flex-1 chiếm phần còn lại)
                - Mobile: Full background bên dưới
            */}
            <div id="map" className="w-full h-full lg:flex-1 z-0" />

        </div>
    );

}
