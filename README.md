# File Storage System 

This project is a file storage system similar to Google Drive. It uses:
- **React (TypeScript)** for the frontend (`client` folder)
- **Node.js/Express** for the backend (`server` folder)
- **PostgreSQL** for metadata storage
- **AWS S3** (or compatible) for file storage
- **Sequelize** ORM for database access
- **Multer** for file uploads
- **dotenv** for environment configuration

## Features
- Upload, download, and manage files
- Access control (user authentication/authorization)
- File versioning
- Cloud storage integration

## Getting Started

### Backend
1. `cd server`
2. Configure your `.env` file for database and AWS credentials
3. `npm install`
4. `node sync.js` (to sync database models)
5. `npm start`

### Frontend
1. `cd client`
2. `npm install`
3. `npm start`

---

For more details, see the code and comments in each folder.
