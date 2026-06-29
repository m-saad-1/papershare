<div align="center">
  <div style="background-color: #2563eb; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  </div>
  
  <h1>PaperShare</h1>
  <p><strong>The Ultimate Academic Resource Sharing Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white" alt="Cloudinary" />
  </p>
</div>

<br />

**PaperShare** is a full-stack, dynamic marketplace built for students, educators, and researchers to share past papers, comprehensive study notes, and critical academic resources. By heavily emphasizing community-driven content, reputation scores, and real-time interactions, PaperShare aims to democratize academic knowledge.

---

## 🚀 Key Features

* **📚 Resource Library**: Upload, search, and download past academic papers and study notes categorized by university, department, and course.
* **☁️ Cloud Storage**: Secure and permanent file storage for PDFs and profile pictures powered by Cloudinary.
* **🏆 Gamified Reputation**: Earn reputation points and unique badges by contributing helpful resources and receiving upvotes from the community.
* **💬 Real-Time Chat**: Connect and collaborate with peers and mentors through an integrated messaging system.
* **⚡ Blazing Fast**: Route-based code-splitting on the frontend ensures near-instantaneous load times and a highly responsive user experience.
* **🛡️ Admin Moderation**: Powerful administrative tools for reviewing pending uploads, managing user reports, and keeping the platform clean.

---

## 💻 Tech Stack

* **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, React Router
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Storage**: Cloudinary (for persistent serverless file uploads)
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs
* **Realtime**: Socket.io

---

## 🛠️ Local Development

### Prerequisites

* Node.js 18+ recommended
* npm or yarn
* MongoDB Atlas Cluster (or local MongoDB instance)
* Cloudinary Account

### 1. Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5002

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Run the App

Install dependencies and start the backend:
```bash
npm install
npm start
```

In a new terminal, start the frontend development server:
```bash
npm run dev:frontend
```

Open your browser and navigate to `http://localhost:5173`.

---

## ☁️ Deployment (Vercel)

PaperShare is fully optimized for serverless deployment on Vercel.

1. Create a new project in Vercel and import this repository.
2. Keep the **Framework Preset** as Vite.
3. In the **Environment Variables** section, add your critical backend secrets:
   * `MONGODB_URI`
   * `JWT_SECRET`
   * `CLOUDINARY_CLOUD_NAME`
   * `CLOUDINARY_API_KEY`
   * `CLOUDINARY_API_SECRET`
4. Click **Deploy**. Vercel will automatically build the frontend and map the `/api` routes to your Express backend functions.

*(Note: Because Vercel uses ephemeral file systems, Cloudinary is strictly required in production for user avatars, PDF uploads, and chat attachments to persist.)*
