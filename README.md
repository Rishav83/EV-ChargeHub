# EV ChargeHub ⚡

A full-stack web application for finding, managing, and booking electric vehicle (EV) charging stations. This platform features a dual-role system for Administrators and general Users, complete with real-time maps, bunk management, and a sleek dark/light mode interface.

## 🚀 Live Demo

[Check out the live website!](https://ev-charging-bank.web.app) 

## ✨ Features

### For All Users
-   **Interactive Map:** Browse all available charging stations on an interactive map.
-   **Station Details:** View detailed information about each charging bunk, including available slots, pricing, and amenities.
-   **Responsive Design:** Fully responsive UI that works seamlessly on desktop, tablet, and mobile.
-   **Dark/Light Mode:** Toggle between themes for comfortable viewing at any time.

### For EV Owners (User Role)
-   **User Dashboard:** A personalized dashboard for managing your EV charging experience.
-   **Find Nearby Bunks:** Locate charging stations near your current location.
-   **User Profile:** Manage your account details and preferences.

### For Station Operators (Admin Role)
-   **Admin Dashboard:** Overview of the platform's key metrics and management tools.
-   **Bunk Management:** Full CRUD (Create, Read, Update, Delete) operations for charging stations.
-   **Slot Management:** Manage and configure individual charging slots at each station.
-   **Approval System:** Review and approve new station registration requests from operators.

### General
-   **User Authentication:** Secure login and registration system powered by Firebase.
-   **Role-Based Access Control:** Secure routes and UI elements based on user roles (Admin/User).
-   **Modern UI:** Built with React and Bootstrap for a clean and professional user experience.

## 🛠️ Tech Stack

This project is built with a modern React-based tech stack:

-   **Frontend Framework:** [React](https://reactjs.org/) ^19.1.1
-   **Build Tool & Dev Server:** [Vite](https://vitejs.dev/) ^7.1.2
-   **Routing:** [React Router DOM](https://reactrouter.com/) ^7.8.2
-   **UI Library & Styling:** [React Bootstrap](https://react-bootstrap.github.io/) ^2.10.10 & [Bootstrap](https://getbootstrap.com/) ^5.3.8
-   **Authentication & Database:** [Firebase](https://firebase.google.com/) ^12.2.1
-   **Maps:** [Leaflet](https://leafletjs.com/) ^1.9.4 & [React Leaflet](https://react-leaflet.js.org/) ^5.0.0
-   **Icons:** [Lucide React](https://lucide.dev/) ^0.542.0
-   **Linting:** [ESLint](https://eslint.org/) ^9.33.0

## 📦 Installation & Setup

Follow these steps to get a local copy up and running:

### Prerequisites

-   **Node.js** (version 18 or higher recommended)
-   **npm** (usually comes with Node.js) or **yarn**

### Instructions

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Rishav83/EV-ChargeHub.git
    cd ev-charging-bunk
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```
    *You can get these values from your Firebase project console.*

4.  **Start the development server**
    ```bash
    npm run dev
    ```
5.  **Open your browser**
    Navigate to `http://localhost:5173` (or the URL provided in the terminal) to view the application.

### Other Available Scripts

-   `npm run build`: Builds the app for production to the `dist` folder.
-   `npm run preview`: Previews the production build locally.
-   `npm run lint`: Runs ESLint to analyze the code for potential errors.

## 🔧 Project Structure

src/
├── components/ # Reusable React components
│ ├── Common
│   ├── Footer.jsx
│   ├── LoadingSpinner.jsx
│   ├── Navbar.jsx
│   └── ThemeToggle.jsx
├── contexts
│ └── ThemeContext.jsx
├── pages/ # Main page components
│ ├── Admin/ 
│   ├── AdminDashboard.jsx
│   ├── BunkApproval.jsx
│   ├── BunkManagement.jsx
│   └── SlotManagement.jsx
│ ├── Auth/ 
│   ├── AdminLogin.jsx
│   ├── BunkRegistration.jsx
│   ├── Login.jsx
│   └── Register.jsx
│ ├── Profile/ # User profile page(Profile.jsx)
│ ├── User/ 
│   ├── BunkDetails.jsx
│   ├── NearbyBunks.jsx
│   └── UserDashboard.jsx
│ ├── About.jsx
│ └── Home.jsx
├── services/ # External service configurations(firebase.js)
└── utils/ # Utility functions (logger.js)


## 🔮 Future Enhancements

This project is under active development. Planned features and improvements include:

*   **Real-time Slot Booking:** Allow users to reserve and pay for charging slots directly through the platform.
*   **Live Availability Status:** Integrate with charging hardware APIs to show real-time availability and charging status.
*   **Payment Gateway Integration:** Secure payment processing for charging sessions using Stripe or similar.
*   **Advanced Filtering & Search:** Filter stations by connector type (CCS, CHAdeMO, Type 2), power output, pricing, and amenities.
*   **User Reviews & Ratings:** A system for users to leave reviews and ratings for charging stations.
*   **Session History:** Allow users to view their past charging sessions and receipts.
*   **Mobile Application:** Develop a companion mobile app using React Native for a native experience.
*   **Predictive Analytics:** Use historical data to predict station busy times and suggest optimal charging times to users.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.

## 👥 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📧 Contact

Your Name - Rishav Pandey - rishavpandey83@gmail.com

Project Link: [https://github.com/Rishav83/EV-ChargeHub]
