
# Project Mates

An online platform to help university students find compatible teammates for their graduation projects. This application is a fully functional frontend built with React, TypeScript, and Tailwind CSS. It is integrated with Firebase for authentication and database services.

This guide provides instructions on how to run the frontend application.

## Frontend Setup and Execution

### Prerequisites

- A modern web browser.
- A local web server to serve the `index.html` file. Many code editors have extensions for this (e.g., "Live Server" for VS Code).

### Running the Application

1.  **Copy all the files** into a new project directory.
2.  **Open `index.html`** using a local web server. The application should now be running in your browser.

*There is no `npm install` step required for this setup as all dependencies are loaded from a CDN via the import map in `index.html`.*

## Firebase Backend Setup

This project uses Firebase for its backend. To get it working, you must configure it with your own project keys.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Add a Web App**: In your project dashboard, add a new web application to get your `firebaseConfig` credentials.
3.  **Update Firebase Configuration**: Open the `firebase.ts` file. You will see a `firebaseConfig` object. **Replace the placeholder values in this object with the credentials from your own Firebase project.**
4.  **Enable Authentication**: Go to the "Authentication" section, click "Get started", and enable the "Email/Password" sign-in method.
5.  **Set up Firestore Database**:
    -   Go to the "Firestore Database" section and click "Create database".
    -   Start in **test mode** for initial development. This allows open read/write access.
    -   **IMPORTANT**: For a production application, you must configure [Security Rules](https://firebase.google.com/docs/firestore/security/get-started) to protect your data.
6.  **Create Collections**: Firestore will automatically create the `users` collection when the first user signs up through the app.
