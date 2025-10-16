'use client';

import { useEffect } from 'react';

const MapPage = () => {
  useEffect(() => {
    const L = require('leaflet');
    require('leaflet-draw');

    // 1️⃣ Tạo map, lấy tâm Hóc Môn
    const map = L.map('map').setView([10.8738, 106.5899], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // 2️⃣ Layer hiển thị ruộng đã có (Cornfields)
    const cornfieldsLayer = L.geoJSON().addTo(map);

    // Lấy danh sách ruộng từ API Django
    fetch('http://localhost:8000/api/cornfields/') // đổi endpoint cho đúng model
      .then(res => res.json())
      .then(data => {
        // Nếu serializer trả về GeoJSON chuẩn thì addData trực tiếp được
        cornfieldsLayer.addData(data);
      })
      .catch(console.error);

    // 3️⃣ FeatureGroup để chứa các polygon người dùng vừa vẽ
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // 4️⃣ Control vẽ polygon
    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
      },
    });
    map.addControl(drawControl);

    // 5️⃣ Khi người dùng vẽ polygon mới
    map.on(L.Draw.Event.CREATED, function (e: any) {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      // Lấy GeoJSON của polygon vừa tạo
      const geojson = layer.toGeoJSON();

      // Gửi dữ liệu POST lên Django API
      fetch('http://localhost:8000/api/cornfields/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ruộng mới',
          owner: 1, // TODO: thay bằng ID thật của farmer khi có login
          geom: geojson.geometry, // đúng theo serializer: geo_field='geom'
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('Đã lưu:', data);
          cornfieldsLayer.addData(data); // vẽ polygon vừa lưu
        })
        .catch(console.error);
    });

    // Cleanup khi component bị unmount
    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ height: '90vh', width: '100%' }}></div>;
};

export default MapPage;
