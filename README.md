# SmartFarming - TL Rice

# Tổng quan kiến trúc

Frontend: Next.js + React + Leaflet + Leaflet.draw

Hiển thị các ruộng dưới dạng GeoJSON từ API

Cho phép vẽ polygon mới, gửi GeoJSON về API để lưu

Backend: Django + GeoDjango + Django REST Framework (+ rest_framework_gis)

Lưu ruộng với PolygonField vào PostgreSQL(PostGIS)

Trả GeoJSON cho frontend

Database: PostgreSQL trên AWS (RDS) hoặc EC2 với PostGIS extension

Deployment: AWS (RDS cho PostGIS, EC2/ECS/Elastic Beanstalk cho Django, Vercel cho Next.js)

# Chuẩn bị kiến trúc