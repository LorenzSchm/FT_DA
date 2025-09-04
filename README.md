# FT_DA

## Project Overview

FT_DA is a multi-platform application consisting of a backend API, a mobile app, and a web application. This project follows a modern multi-tier architecture pattern to provide a complete solution across different platforms.

## Repository Structure

- **`/backend`** - Python-based backend service
- **`/mobile`** - Expo/React Native mobile application
- **`/webapp`** - Next.js web application

## Getting Started

### Using Docker (Recommended)

This project is fully Dockerized for easy setup and deployment.

1. **Prerequisites**:
   - Docker and Docker Compose installed on your system

2. **Running the entire stack**:
   ```bash
   docker-compose up
   ```

3. **Accessing the applications**:
   - Web Application: http://localhost:3000
   - Backend API: http://localhost:8000
   - Mobile App (Expo): http://localhost:19002

4. **Building the images**:
   ```bash
   docker-compose build
   ```

5. **Running individual services**:
   ```bash
   docker-compose up webapp
   docker-compose up mobile
   docker-compose up backend
   ```

### Manual Setup

See the README files in each subdirectory for specific manual setup and running instructions.
