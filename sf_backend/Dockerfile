# Dùng Python 3.12 slim
FROM python:3.12-slim

# Thiết lập biến môi trường
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# --- KÌM HÃM CPU KHI BUILD ---
# Chỉ cho phép biên dịch C++ (GDAL/NumPy) chạy 2 luồng để không sập máy
ENV MAKEFLAGS="-j2"

WORKDIR /app

# 1. Cài đặt thư viện hệ thống
# Thêm binutils, libproj-dev để GDAL compile mượt
RUN apt-get update && apt-get install -y \
    build-essential \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    python3-dev \
    libffi-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. CẤU HÌNH GDAL
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# 3. Copy file requirements
COPY requirements.txt .

# 4. Cài đặt Python Dependencies
RUN pip install --upgrade pip

# Tự động cài GDAL đúng phiên bản hệ thống
RUN pip install GDAL==$(gdal-config --version)

# Cài các thư viện còn lại (Không dùng cache để giảm lỗi)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy code
COPY . .

# 6. Gom static file
RUN python manage.py collectstatic --noinput

# 7. Mở cổng
EXPOSE 8000

# 8. Chạy server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]