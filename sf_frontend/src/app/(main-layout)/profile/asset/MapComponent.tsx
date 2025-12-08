'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import wellknown from 'wellknown';
import { useId } from 'react';
import { MapPin } from 'lucide-react';

interface FieldObservation {
    cornfield: {
        id: number;
        geometry: string;
        properties: any;
    };
    disease_class: string;
    image_rel?: string;
}

interface Props {
    observations: FieldObservation[];
}

export default function MapComponent({ observations }: Props) {
    const mapRef = useRef<L.Map | null>(null);
    const allFieldsLayerRef = useRef<L.LayerGroup | null>(null);
    const mapId = useId();
    const fieldBoundsRef = useRef<L.LatLngBounds | null>(null);

    const diseaseColorMap: Record<string, string> = {
        healthy: "#33CC00",
        blast: "#FF9900",
        brown_spot: "#fb00ffff",
        bacterial_leaf_blight: "#CC3366",
    };

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map(mapId, { center: [10.7769, 106.7009], zoom: 13, zoomControl: true, dragging: true });
            const satelliteLayer = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                { maxZoom: 19, attribution: 'Tiles © Esri' }
            );
            satelliteLayer.addTo(mapRef.current);
            allFieldsLayerRef.current = L.layerGroup().addTo(mapRef.current);
        }

        allFieldsLayerRef.current?.clearLayers();

        const bounds = L.latLngBounds([]);

        observations.forEach(obs => {
            const color = diseaseColorMap[obs.disease_class] || '#2611dd';
            const fillOpacity = obs.disease_class ? 0.45 : 0.25;

            const geojson = wellknown(obs.cornfield.geometry) as GeoJSON.Geometry;

            const layer = L.geoJSON(geojson, {
                style: { color, weight: 2, fillOpacity },
            }).addTo(allFieldsLayerRef.current!);

            layer.eachLayer((l: any) => {
                bounds.extend(l.getBounds());
            });
        });

        fieldBoundsRef.current = bounds.isValid() ? bounds : null;

        if (bounds.isValid() && mapRef.current) {
            const center = bounds.getCenter();
            if (observations.length === 1) {
                mapRef.current.setView(center, 16);
                mapRef.current.panBy([0, 50]);
            } else {
                mapRef.current.fitBounds(bounds, { padding: [10, 10], maxZoom: 16 });
                mapRef.current.panBy([0, 50]);
            }
        }

    }, [observations, mapId]);

const goToField = () => {
    if (mapRef.current && fieldBoundsRef.current) {
        const map = mapRef.current;
        const bounds = fieldBoundsRef.current;

        const center = bounds.getCenter();
        const point = map.latLngToContainerPoint(center);

        const newPoint = L.point(point.x, point.y + 50);
        const newCenter = map.containerPointToLatLng(newPoint);

        map.setView(newCenter, 16, { animate: true });
    }
};


    return (
        <div className="relative">
            <div id={mapId} style={{ width: '100%', height: '100%', minHeight: '300px' }} />

            <button
                onClick={goToField}
                className="absolute top-4 right-4 bg-white z-999 p-2 rounded-full shadow hover:bg-gray-100 transition-all"
                title="Trở về vị trí ruộng"
            >
                <MapPin className="w-6 h-6 text-green-600" />
            </button>
        </div>
    );
}
