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
import { log } from 'console';
interface SelectedField {
    feature: any;
    info: any;
}

export default function MapClient() {
    const [user, setUser] = useState<any>(null);
    const userRef = useRef<any>(null);
    const mapRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const allFieldsLayerRef = useRef<L.FeatureGroup | null>(null);
    const [selectedField, setSelectedField] = useState<any>(null);
    const [cornfields, setCornfields] = useState<any[]>([]);

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
        console.log('useEffect chạy rồi 2');
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            mapRef.current?.invalidateSize();
        }, 250);
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
        return () => {
            mounted = false;
        };
    }, []);

    // khởi tạo map & tải dữ liệu
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.warn('Không tìm thấy phần tử #map');
            return;
        }

        // biểu tượng marker
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

        // khởi tạo bản đồ
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

        // lớp nền
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

        // tải geojson xã Hóc Môn
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

        // Lớp chứa các ruộng
        const allFieldsLayer = new L.FeatureGroup();
        allFieldsLayer.addTo(map);
        allFieldsLayerRef.current = allFieldsLayer;

        // Tải tất cả ruộng đã được vẽ
        async function fetchAllFields() {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/`);
            if (!res.ok) throw new Error(`Lỗi tải tất cả ruộng: ${res.statusText}`);
            return await res.json();
        }

        // Tải thông tin tất cả ruộng
        async function fetchAllUserFieldsInfo() {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/info/`);
            if (!res.ok) throw new Error(`Lỗi tải ruộng tất cả nông dân: ${res.statusText}`);
            return await res.json();
        }

        // Tải ruộng của user hiện tại
        async function fetchMyFields() {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/info/my-fields/`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error(`Lỗi tải ruộng người dùng: ${res.statusText}`);
            return await res.json();
        }

        function getLatestFieldsPerPair(fields: any[]) {
            const map = new Map<string, any>();

            fields.forEach(f => {
                const cornfieldId = f.cornfield?.id;
                const farmerId = f.farmer?.id;
                if (!cornfieldId || !farmerId) return;

                const key = `${cornfieldId}-${farmerId}`;

                const createdAt =
                    f.created_at ||
                    f.updated_at ||
                    f.cornfield?.created_at ||
                    f.cornfield?.updated_at ||
                    f.cornfield?.properties?.created_at ||
                    f.cornfield?.properties?.updated_at ||
                    null;

                if (!createdAt) return;

                const newTime = new Date(createdAt).getTime();
                if (isNaN(newTime)) return;

                const existing = map.get(key);
                const existingTime = existing?._timestamp || 0;

                if (!existing || newTime > existingTime) {
                    map.set(key, { ...f, _timestamp: newTime });
                }
            });

            return Array.from(map.values());
        }

        // Hàm hiển thị ruộng lên bản đồ
        function renderFieldsOnMap(
            allData: any,
            myFieldIds: Set<number>,
            myFields: any[],
            showOthers = true
        ) {
            // Chuyển GeoJSON sang Leaflet
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

                const color = disease ? diseaseColorMap[disease] : "#2611dd";

                const fillOpacity = disease ? 0.45 : status ? 0.45 : 0.25;

                const layer = L.geoJSON(feature, { style: { color, weight: 2, fillOpacity } });

                const popupContent = createFieldPopupContent(feature, info);

                layer.eachLayer((l: any) => {
                    l._cornfieldId = feature.properties.id;
                    l.on('click', () => {
                        setSelectedField({ feature, info });
                    });

                    allFieldsLayerRef.current?.addLayer(l);
                });
            });


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

        const legend = new L.Control({ position: 'bottomleft' });
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = `
        <h2 style="font-size:16px; font-weight:bold; line-height:1.5">Trạng thái ruộng</h2>
            <div style="font-size:13px; line-height:1.5">
                <i style="background:#33CC00;width:14px;height:14px;display:inline-block;margin-right:5px;"></i> Khỏe mạnh<br/>
                <i style="background:#FF9900;width:14px;height:14px;display:inline-block;margin-right:5px;"></i> Đạo ôn<br/>
                <i style="background:#fb00ffff;width:14px;height:14px;display:inline-block;margin-right:5px;"></i> Đốm nâu<br/>
                <i style="background:#CC3366;width:14px;height:14px;display:inline-block;margin-right:5px;"></i> Cháy bìa lá
            </div>
    `;
            div.style.background = '#ffffff';
            div.style.padding = '8px 10px';
            div.style.borderRadius = '8px';
            div.style.color = '#000000';
            return div;
        };
        legend.addTo(map);

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
        <strong>Lọc ruộng 🌾</strong>
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

            L.DomEvent.on(container, 'click', e => L.DomEvent.stopPropagation(e));

            return container;
        };
        filterControl.addTo(map);

        // Tải ruộng từ backend
        async function loadFields() {
            try {
                const allData = await fetchAllFields();
                const allInfo = await fetchAllUserFieldsInfo();
                const myData = await fetchMyFields();

                const myFieldIds = new Set<number>(
                    (myData?.data || [])
                        .map((f: any) => f.cornfield?.id as number)
                        .filter((id: number) => !!id)
                );
                const latestInfo = getLatestFieldsPerPair(allInfo?.data || allInfo || []);
                renderFieldsOnMap(allData, myFieldIds, latestInfo);
            } catch (err) {
                console.error("Lỗi tải ruộng:", err);
            }
        }

        // Lắng nghe thay đổi bộ lọc
        map.whenReady(() => {
            const select = document.getElementById('field-filter-select') as HTMLSelectElement | null;
            if (!select) return;

            const mineOption = select.querySelector('option[value="mine"]') as HTMLOptionElement | null;
            if (mineOption && !userRef.current) mineOption.disabled = true;

            select.addEventListener('change', async (e: Event) => {
                const value = (e.target as HTMLSelectElement).value;
                allFieldsLayer.clearLayers();
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
                    const latestAllInfoData = getLatestFieldsPerPair(allInfoData || []);
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

                            const allFieldIds = new Set(
                                geojson.features.map((f: any) => f.properties.id)
                            );

                            renderFieldsOnMap(geojson, allFieldIds, list, true);
                        } catch (error) {
                            console.error("Lỗi tải tất cả ruộng:", error);
                        }
                    }

                    else if (value === 'mine') {
                        const latestMine = getLatestFieldsPerPair(myData?.data || []);
                        renderFieldsOnMap(allData, myFieldIds, latestMine, false);
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

        // helper kiểm tra map
        function isMapReady() {
            return !!(mapRef.current && mapRef.current.getContainer()?.isConnected);
        }

        // Định vị người dùng
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
                alert('Trình duyệt không hỗ trợ định vị.');
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
                    if (err.code === 1 && promptIfNeeded) alert('Vui lòng bật quyền định vị cho trang này.');
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
        };
    }, []);

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
                    console.log('Success:', saved);
                } else console.error('Lưu ruộng thất bại', res.statusText);
            } catch (err) {
                console.error('Error handling draw created:', err);
            }
        };

        const handleDeleted = async (e: any) => {
            e.layers.eachLayer(async (layer: any) => {
                const id = layer.id ?? layer.feature?.properties?.id;
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

        map.on((L as any).Draw.Event.CREATED, handleCreated);
        map.on('draw:deleted', handleDeleted);

        return () => {
            map.off((L as any).Draw.Event.CREATED, handleCreated);
            map.off('draw:deleted', handleDeleted);
            map.removeControl(drawControl);
        };
    }, [user]);

    return (
        <div style={{ display: 'flex', height: '89vh', width: '100%' }}>
            <div
                style={{
                    width: selectedField ? '40%' : '0',
                    transition: 'width 0.3s ease',
                    overflowY: selectedField ? 'auto' : 'hidden',
                    background: '#fff',
                    borderRight: '1px solid #ccc',
                    padding: selectedField ? '16px' : '0',
                }}
            >

                {selectedField ? (
                    <div style={{ fontSize: 14 }}>
                        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img
                                src="/rice.png"
                                alt="Rice"
                                style={{ width: 32, height: 32 }}
                            />
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#facc15' }}>Thông tin ruộng</p>
                        </h2>
                        <div className="p-4 rounded-xl bg-white shadow-md space-y-4 animate-fadeIn">

                            {(() => {
                                const dateStr =
                                    selectedField.info?.created_at ||
                                    selectedField.info?.updated_at ||
                                    selectedField.info?.cornfield?.properties?.created_at ||
                                    selectedField.feature?.properties?.created_at;
                                const date = new Date(dateStr);

                                if (isNaN(date.getTime())) {
                                    return <span className="text-gray-700 italic">Chưa nhận được thông tin</span>;
                                }

                                return (
                                    <>
                                        <span className="text-gray-700 italic">*Dữ liệu được cập nhật lúc </span>
                                        <span className="text-gray-700 italic">{date.toLocaleString('vi-VN')}</span>
                                    </>
                                );
                            })()}

                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-semibold text-gray-700">Nông dân:</span>
                                <span className="text-green-600">
                                    {selectedField.info?.farmer
                                        ? `${selectedField.info.farmer.last_name ?? ''} ${selectedField.info.farmer.first_name ?? ''}`
                                        : selectedField.field?.properties?.name ?? 'Chưa nhận được thông tin'}
                                </span>

                                <span className="font-semibold text-gray-700">Diện tích khoảng:</span>
                                <span className="text-gray-900">
                                    {Math.round(
                                        selectedField.info?.cornfield?.properties?.area_m2 ||
                                        selectedField.feature?.properties?.area_m2 ||
                                        0
                                    ).toLocaleString()} m²
                                </span>

                                <span className="font-semibold text-gray-700">Trạng thái:</span>
                                <span className="font-semibold">
                                    {selectedField.info?.disease_class ? (
                                        <span style={{ color: diseaseColorMap[selectedField.info.disease_class] || '#333', fontWeight: 600 }}>
                                            {DISEASE_MAP[selectedField.info.disease_class] || selectedField.info.disease_class}
                                        </span>
                                    ) : 'Không có dữ liệu'}
                                </span>
                            </div>

                            {selectedField.info?.image_rel && (
                                <div className="">
                                    <div className="overflow-hidden rounded-lg shadow-sm">
                                        <img
                                            src={selectedField.info.image_rel}
                                            alt="Ảnh ruộng"
                                            className="w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                    <div className="text-center text-[12px] italic mt-2">
                                        Hình ảnh ruộng
                                    </div>
                                </div>

                            )}

                        </div>

                        <ul className="pl-4 space-y-2">
                            {['confidence', 'temp', 'hum', 'ph', 'soil', 'wind', 'wind_avg', 'lux'].map((key, index) => {
                                const value = selectedField.info?.[key];
                                if (value === null || value === undefined) return null;

                                const labelMap: Record<string, string> = {
                                    confidence: 'Độ tin cậy chuẩn đoán bệnh',
                                    temp: 'Nhiệt độ',
                                    hum: 'Độ ẩm',
                                    ph: 'pH',
                                    soil: 'Độ ẩm đất',
                                    wind: 'Gió hiện tại',
                                    wind_avg: 'Gió trung bình',
                                    lux: 'Ánh sáng',
                                };

                                const unitMap: Record<string, string> = {
                                    confidence: '%',
                                    temp: '°C',
                                    hum: '%',
                                    wind: ' m/s',
                                    wind_avg: ' m/s',
                                    lux: ' lux',
                                };

                                let color = '#333';
                                if (key === 'confidence') {
                                    const perc = Math.min(Math.max(value, 0), 1) * 100;
                                    if (perc >= 75) color = '#33CC00';
                                    else if (perc >= 50) color = '#FFCC00';
                                    else if (perc >= 25) color = '#fb00ffff';
                                    else color = '#CC3300';
                                }

                                return (
                                    <li
                                        key={key}
                                        className="relative p-3 rounded-xl bg-gradient-to-r from-white to-gray-50 text-gray-900 shadow-md transform translate-y-3 opacity-0 hover:translate-x-1 hover:shadow-lg transition-all duration-400 ease-out"
                                        style={{
                                            animation: `fadeSlideIn 0.5s forwards`,
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                    >
                                        <span className="font-semibold">{labelMap[key]}:</span>{' '}
                                        <span className="font-medium" style={{ color }}>
                                            {key === 'confidence' ? (value * 100).toFixed(1) + '%' : value + (unitMap[key] ?? '')}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>

                        <button
                            onClick={() => setSelectedField(null)}
                            style={{
                                position: 'absolute',
                                top: 90,
                                left: '35.8%',
                                transform: 'translateX(-50%)',
                                background: '#ffff',
                                color: 'green',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                boxShadow: '0 2px 6px rgba(43, 238, 9, 0.3)',
                            }}
                        >
                            Đóng
                        </button>
                    </div>
                ) : (
                    <div style={{ color: '#777', textAlign: 'center', marginTop: '40%' }}>
                        Ấn vào 1 ruộng để xem chi tiết 🌱
                    </div>
                )}
            </div>

            <div id="map" style={{ flexGrow: 1 }} />
        </div>
    );

}
