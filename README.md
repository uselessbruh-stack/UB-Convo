# 🗣️ UB Convo

A modern, real-time conversation platform built with **React**, **Firebase**, and **Vite**. Connect, communicate, and collaborate seamlessly.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28?logo=firebase)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## ✨ Features

- 💬 **Real-Time Messaging** – Powered by Firebase Firestore
- 🔐 **Secure Authentication** – Firebase Auth integration
- 🚀 **Fast & Responsive** – Built with Vite for optimal performance
- 📱 **Cross-Platform** – Works on desktop and mobile
- 🎨 **Modern UI** – React with responsive design
- 🔄 **Virtual Scrolling** – Smooth message rendering with react-virtuoso
- 🗓️ **Timestamp Support** – Date formatting with date-fns
- 🎯 **Routing** – Client-side navigation with React Router

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ub-convo.git
cd UB\ Convo

# Install dependencies
npm install

# Set up Firebase credentials
# Create a .env.local file with your Firebase config
cp .env.example .env.local
```

### Development

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Lint

```bash
# Check code quality
npm run lint
```

---

## 📁 Project Structure

```
UB Convo/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Firebase & API services
│   ├── styles/            # CSS modules/stylesheets
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── dist/                  # Production build (generated)
├── package.json           # Dependencies & scripts
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint rules
├── README.md              # This file
├── LICENSE                # MIT License
└── .gitignore             # Git ignore rules
```

---

## ⚙️ Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database and Authentication
4. Copy your config credentials
5. Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📦 Dependencies

### Production
- **react** (^19.2.4) – UI library
- **react-dom** (^19.2.4) – DOM rendering
- **react-router-dom** (^7.14.0) – Client-side routing
- **firebase** (^12.11.0) – Backend & authentication
- **react-virtuoso** (^4.18.4) – Virtual scrolling for messages
- **react-icons** (^5.6.0) – Icon library
- **date-fns** (^4.1.0) – Date formatting
- **uuid** (^13.0.0) – Unique ID generation

### Development
- **vite** – Fast build tool
- **eslint** – Code linting
- **@vitejs/plugin-react** – React support in Vite

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 💡 Future Enhancements

- [ ] Voice & video calling
- [ ] File sharing
- [ ] Typing indicators
- [ ] Message reactions
- [ ] User presence indicators
- [ ] Dark mode toggle
- [ ] Notifications
- [ ] Message search

---

## 📧 Support

For issues and questions, please open an issue on [GitHub](https://github.com/your-username/ub-convo/issues).

---

**Built with ❤️ using React & Firebase**
