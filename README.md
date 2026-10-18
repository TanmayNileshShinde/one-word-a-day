# 📖 One Word A Day

[![GitHub stars](https://img.shields.io/github/stars/TanmayNileshShinde/one-word-a-day.svg?style=flat&color=yellow)](https://github.com/TanmayNileshShinde/one-word-a-day/stargazers)
[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://newdaynewword.vercel.app/)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

**One Word A Day** is a web application designed to help users expand their vocabulary by learning a new word every day. The app encourages daily learning through a streak tracking system, allowing users to sign in and maintain their progress over time.

🔗 **Live Demo:** [https://newdaynewword.vercel.app/](https://newdaynewword.vercel.app/)

## 🚀 Features

- **Daily Word:** Discover a new word every day, complete with its definition and part of speech.
- **Streak Tracking:** Gamified learning experience that tracks your current and highest daily streaks.
- **User Authentication:** Secure sign-in via Google to save your progress across devices.
- **Responsive Design:** Optimized for both desktop and mobile viewing.
- **Serverless Backend:** Utilizes Vercel serverless functions for secure API interactions.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend / Services:**
  - **Firebase:** Authentication (Google Sign-In) & Firestore/Realtime Database (User Data)
  - **Vercel:** Hosting & Serverless Functions (API)

## 📂 Project Structure

```text
one-word-a-day/
├── api/                  # Serverless functions (Vercel)
├── .env.example          # Example environment variables file
├── firebase-config.js    # Firebase initialization and configuration
├── index.html            # Main HTML file
├── main.js               # Frontend logic (UI updates, Auth, Fetching)
├── style.css             # Application styling
├── package.json          # Project dependencies and scripts
└── LICENSE               # MIT License
