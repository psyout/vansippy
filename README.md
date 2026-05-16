# VanSippy Happy Hour

VanSippy is a full-stack happy hour finder for Vancouver. It helps people discover nearby bars, pubs, and restaurants with happy hour deals using a map-first interface, location-based sorting, search, category filters, neighbourhood filters, and business menu cards.

## 🧐 About

VanSippy was born out of a simple problem: happy hour information is often scattered across restaurant websites, social media posts, and outdated lists. This app brings that information into one place so users can quickly explore nearby venues, check happy hour times, view food and drink specials, and open map directions.

The project is built as a monorepo with a React client and an Express/MongoDB API server.

```text
web-app/
  client/   # React frontend
  server/   # Express + MongoDB backend
```

## ✨ Features

- Interactive Mapbox map with venue markers
- Browser geolocation support
- Distance-based sorting after location is detected
- Search across business data
- Category and neighbourhood filters
- Happy hour cards with drinks and food menus
- Placeholder/skeleton loading states while app data and location load
- Admin login with HTTP-only cookie auth
- Protected admin routes for adding, editing, and deleting businesses
- REST API for locations and authentication
- Production-ready deployment structure for Netlify and Render

## ⛏️ Built Using

### Client

- [React](https://react.dev/) - UI framework
- [React Router](https://reactrouter.com/) - Client-side routing
- [Material UI](https://mui.com/material-ui/) - Component library
- [Mapbox GL JS](https://www.mapbox.com/) - Interactive maps
- [Sass](https://sass-lang.com/) - Styling
- [Axios](https://axios-http.com/docs/intro) - HTTP client

### Server

- [Node.js](https://nodejs.org/en) - JavaScript runtime
- [Express](https://expressjs.com/) - API framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [JWT](https://jwt.io/) - Authentication tokens
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing
- [Helmet](https://helmetjs.github.io/) - Security headers
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) - API rate limiting

## ⚙️ Installation

Clone the repository:

```bash
git clone your-repository-url
cd web-app
```

Install dependencies for both apps:

```bash
cd client
npm install

cd ../server
npm install
```

## 🔐 Environment Variables

This project needs environment variables for both the client and server.

### Client

Create `client/.env`:

```bash
REACT_APP_SERVER_URL=http://localhost:8080
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

A template is available at:

```text
client/.env.example
```

### Server

Create `server/.env`:

```bash
PORT=8080
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=your_bcrypt_password_hash
JWT_SECRET=replace_with_a_long_random_secret
```

A template is available at:

```text
server/.env.example
```

### Generate an Admin Password Hash

The server expects `ADMIN_PASSWORD_HASH` to be a bcrypt hash, not a plain password.

From the `server/` folder, generate one with:

```bash
node -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('your_admin_password_here', 12));"
```

Copy the generated hash into `server/.env` or your production environment variables.

## 🚀 Usage

Start the backend API:

```bash
cd server
npm run dev
```

The server will run at:

```text
http://localhost:8080
```

Start the React client in another terminal:

```bash
cd client
npm start
```

The client will run at:

```text
http://localhost:3000
```

## 🧭 API Overview

### Health

```text
GET /health
```

### Locations

```text
GET    /api/locations
GET    /api/locations/:id
POST   /api/locations
PUT    /api/locations/:id
DELETE /api/locations/:id
```

Create, update, and delete routes require admin authentication.

### Auth

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Authentication uses an HTTP-only `token` cookie.

## 🧪 Useful Commands

### Client

```bash
cd client
npm start
npm run build
npm test
```

### Server

```bash
cd server
npm run dev
npm start
```

## 🌐 Deployment

### Frontend - Netlify

Recommended settings:

```text
Base directory: client
Build command: npm run build
Publish directory: build
```

Set these environment variables in Netlify:

```text
REACT_APP_SERVER_URL=https://your-render-service.onrender.com
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

### Backend - Render

Recommended settings:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Set these environment variables in Render:

```text
PORT=8080
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=https://your-netlify-site.netlify.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=your_bcrypt_password_hash
JWT_SECRET=replace_with_a_long_random_secret
```

## 📁 Project Structure

```text
web-app/
  client/
    public/
    src/
      assets/
      components/
      styles/
    package.json
    netlify.toml

  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    server.js
    package.json
```

## 🔒 Security Notes

- Do not commit `.env` files.
- Store only bcrypt password hashes in `ADMIN_PASSWORD_HASH`.
- Use a long random value for `JWT_SECRET`.
- Keep `CORS_ORIGIN` restricted to your deployed frontend URL in production.
- Admin routes are protected by server-side JWT cookie authentication.

## ✍🏼 Author

- [Felipe Gonzalez / psyout](https://github.com/psyout) - Idea, design, and development
- Portfolio: [felipegonzalez.io](https://felipegonzalez.io)

## 🎉 Acknowledgements

VanSippy Happy Hour was inspired by the scarcity of easily accessible information about bars, restaurants, and venues offering happy hour deals. In a busy city, many great spots hide their best specials across menus, posts, and websites.

This app aims to bridge that gap by providing a simple platform where users can explore nearby venues, discover happy hour menus, and find new places to enjoy the city.
