# Videoplayer - Private Video Platform

Eine private Videoplattform für einen einzelnen Administrator zum Hochladen, Verwalten und Streamen von Videos.

## Features

- **Single-User System**: Nur ein Administrator-Account möglich
- **Video Upload**: Drag & Drop Upload mit Fortschrittsanzeige
- **Video Streaming**: On-the-fly Streaming mit Range-Request Support
- **Tag & Kategorie Management**: Organisieren Sie Videos mit Tags und Kategorien
- **Favoriten System**: Markieren Sie Videos als Favoriten
- **Suche & Filter**: Volltextsuche und Tag-basierte Filterung
- **Dark Mode UI**: Dunkles Design mit hohem Kontrast
- **Docker Support**: Vollständig containerisiert

## Technischer Stack

- **Backend**: Node.js mit Express
- **Frontend**: React mit TypeScript und Vite
- **Datenbank**: PostgreSQL
- **Authentication**: Argon2 Password Hashing, Express Sessions
- **File Storage**: Lokaler Storage mit UUID-basierter Organisation
- **Streaming**: FFmpeg für Video-Transcoding
- **Containerization**: Docker & Docker Compose

## Installation & Setup

### Mit Docker (Empfohlen)

1. Repository klonen:
```bash
git clone <repository-url>
cd videoplayer
```

2. Docker Compose starten:
```bash
docker-compose up -d
```

3. Anwendung öffnen: http://localhost

### Lokale Entwicklung

1. Dependencies installieren:
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

2. PostgreSQL Datenbank einrichten und `.env` Datei erstellen:
```bash
cp .env.example .env
# .env Datei mit Ihren Datenbankdaten anpassen
```

3. Datenbank initialisieren:
```bash
psql -U postgres -d videoplayer -f database/init.sql
```

4. Backend starten:
```bash
npm run dev
```

5. Frontend starten (in neuem Terminal):
```bash
cd frontend
npm run dev
```

6. Anwendung öffnen: http://localhost:5173

## Verwendung

1. **Erste Anmeldung**: Registrieren Sie sich als erster Benutzer - dies wird Ihr Administrator-Account
2. **Videos hochladen**: Nutzen Sie die Upload-Seite für Drag & Drop Upload
3. **Kategorien & Tags**: Erstellen Sie in den Einstellungen Kategorien und Tags
4. **Videos organisieren**: Weisen Sie Videos Tags zu und markieren Sie Favoriten
5. **Suchen & Filtern**: Nutzen Sie die Sidebar zum Filtern nach Tags

## Dateistruktur

Videos werden in UUID-basierten Ordnern gespeichert:

```
/uploads/
├── <video-uuid-1>/
│   ├── video.mp4
│   ├── preview.jpg
│   └── cover.jpg
├── <video-uuid-2>/
│   ├── video.mp4
│   ├── preview.jpg
│   └── cover.jpg
```

## API Endpoints

- `POST /api/auth/register` - Benutzerregistrierung
- `POST /api/auth/login` - Benutzeranmeldung
- `POST /api/auth/logout` - Benutzerabmeldung
- `GET /api/videos` - Videos auflisten (mit Suche/Filter)
- `POST /api/videos/upload` - Video hochladen
- `GET /api/videos/:id/stream` - Video streamen
- `GET /api/categories` - Kategorien auflisten
- `POST /api/categories` - Kategorie erstellen
- `GET /api/tags` - Tags auflisten
- `POST /api/tags` - Tag erstellen
- `POST /api/favorites/:videoId` - Video zu Favoriten hinzufügen
- `DELETE /api/favorites/:videoId` - Video aus Favoriten entfernen

## Entwicklung

### Backend
```bash
npm run dev  # Startet nodemon für automatisches Neuladen
```

### Frontend
```bash
cd frontend
npm run dev  # Startet Vite Dev Server
```

### Build für Produktion
```bash
npm run build  # Baut Frontend für Produktion
```

## Lizenz

MIT License
