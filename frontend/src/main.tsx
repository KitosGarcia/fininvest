
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 👈 Importante
import App from './App';
import { AuthProvider } from './context/AuthContext';

document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

