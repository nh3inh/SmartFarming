'use client';

import Footer from "@/app/components/layouts/Footer";
import Navbar from "@/app/components/layouts/Navbar";
import Terraformer from 'terraformer';
import WKT from 'terraformer-wkt-parser';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, User } from 'lucide-react'
import { renderToString } from 'react-dom/server';
import { getUserProfile } from "@/services/userService";
import { useEffect, useState } from 'react';

const MapPage = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserProfile();
      setUser(data);
    };
    fetchUser();
  }, []);
  useEffect(() => {
    if (!user) return;

    const L = require('leaflet');
    require('leaflet-draw');
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
    });

    const map = L.map('map').setView([10.8738, 106.5899], 12);

    // Lớp bản đồ
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    });

    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles © Esri',
      }
    );

    satelliteLayer.addTo(map);
    L.control.layers({ "Bản đồ đường phố": osmLayer, "Ảnh vệ tinh": satelliteLayer }).addTo(map);

    // DÙNG MỘT LAYER CHUNG CHO CẢ RUỘNG CŨ VÀ MỚI
    const allFieldsLayer = new L.FeatureGroup();
    map.addLayer(allFieldsLayer);

    // Tải ruộng từ backend
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/`)
      .then(res => res.json())
      .then(data => {
        const features = data.features.map((f: any) => {
          const geojsonGeom = WKT.parse(f.geometry.replace(/^SRID=\d+;/, ''));
          return {
            type: "Feature",
            geometry: geojsonGeom,
            properties: { ...f, geometry: undefined },
          };
        });

        L.geoJSON(features, {
          onEachFeature: (feature: GeoJSON.Feature, layer: L.Layer) => {
            if (feature.properties && (feature.properties as any).id) {
              (layer as any).id = (feature.properties as any).id;
            }
            allFieldsLayer.addLayer(layer);
          },
        });
      })
      .catch(console.error);

    // Cho phép vẽ & xóa
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: allFieldsLayer,
        remove: true,
      },
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    // Khi tạo polygon mới
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      allFieldsLayer.addLayer(layer);

      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.data?.[0]?.id || "unknown_user",
          owner: 1,
          geom: layer.toGeoJSON().geometry,
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('Đã lưu:', data);
          layer.id = data.id;
        })
        .catch(console.error);
    });

    // Khi xóa polygon (bất kỳ)
    map.on(L.Draw.Event.DELETED, (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        if (layer.id) {
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/${layer.id}/`, {
            method: 'DELETE',
          })
            .then(res => {
              if (res.ok) console.log(`Đã xóa ruộng #${layer.id}`);
              else console.error('Xóa thất bại:', res.statusText);
            })
            .catch(console.error);
        } else {
          console.warn('Không có id để xóa:', layer);
        }
      });
    });

    // Vị trí người dùng
    let userMarker: any = null;
    const locateUser = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            if (userMarker) userMarker.setLatLng([latitude, longitude]);
            else {
              userMarker = L.marker([latitude, longitude], {
                title: 'Vị trí của bạn',
                icon: mapPinIcon,
              })
                .addTo(map).bindPopup('Bạn đang ở đây', { className: 'my-popup', offset: L.point(90, 20), });

            }
            map.setView([latitude, longitude], 15);
            userMarker.openPopup();
            setTimeout(() => map.panTo([latitude, longitude]), 100);
          },
          (err) => alert('Không thể lấy vị trí: ' + err.message),
          { enableHighAccuracy: true }
        );
      } else alert('Trình duyệt không hỗ trợ định vị.');
    };
    locateUser();

    // Nút “Vị trí của tôi”
    const locateBtn = L.control({ position: 'bottomright' });
    locateBtn.onAdd = function () {
      const btn = L.DomUtil.create('button', 'locate-btn');
      btn.innerHTML = `<span style="display: flex; align-items: center; gap: 6px;">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
    fill="#f0f0f0" stroke="#FACC15" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"
    class="lucide lucide-map-pin">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
  Vị trí của tôi
</span>
`;

      btn.style.backgroundColor = 'white';
      btn.style.padding = '8px 12px';
      btn.style.border = '1px solid #888';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      btn.style.fontSize = '14px';
      btn.style.fontWeight = '500';
      btn.onmouseenter = () => btn.style.backgroundColor = '#f0f0f0';
      btn.onmouseleave = () => btn.style.backgroundColor = 'white';
      L.DomEvent.on(btn, 'click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        locateUser();
      });
      return btn;
    };
    locateBtn.addTo(map);

    return () => map.remove();
  }, []);


  return (
    <div>
      <Navbar />
      <div id="map" style={{ height: '80vh', width: '100%' }}></div>
      <Footer />
    </div>
  );
};

export default MapPage;
