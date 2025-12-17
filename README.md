# SmartFarming - TL Rice
Smart Farming is a web-based platform that leverages cloud computing, GIS, IoT, and AI technologies to monitor, manage, and optimize agricultural activities, helping farmers make data-driven decisions and improve crop productivity.
## Features

- **Smart Farming Monitoring**
  - Collect and monitor farming data from IoT devices (environment, crops, sensors)
  - Store images captured from field devices (rice leaf images)

- **AI-based Rice Disease Analysis**
  - Analyze rice leaf images using AI models
  - Integrate OpenAI for data analysis and decision support

- **GIS & WebGIS**
  - Visualize farming areas and sensor data on interactive maps
  - WebGIS implementation using Leaflet for geospatial monitoring

- **Backend & API**
  - RESTful API built with Django
  - User authentication and role-based access control
  - Scalable backend architecture for future expansion

- **Frontend**
  - Modern web interface built with Next.js (React)
  - Responsive UI for desktop and mobile devices

- **Cloud Infrastructure (AWS)**
  - **EC2** for backend and frontend deployment
  - **Application Load Balancer** for traffic distribution
  - **Route 53** for domain and DNS management
  - **RDS (PostgreSQL)** for structured data storage
  - **S3** for storing rice leaf images and media files

- **Realtime & Data Storage**
  - Firebase for receiving and storing real-time data from IoT devices
  - Image data pipeline for AI-based disease detection
