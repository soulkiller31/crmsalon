import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import WhatsApp from './pages/WhatsApp';
import Templates from './pages/Templates';
import MessageLogs from './pages/MessageLogs';
import Invoice from './pages/Invoice';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#202123',
              color: '#ececf1',
              border: '1px solid #40414f',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#202123' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#202123' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Layout><Customers /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp"
            element={
              <ProtectedRoute>
                <Layout><WhatsApp /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Layout><Templates /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-logs"
            element={
              <ProtectedRoute>
                <Layout><MessageLogs /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <ProtectedRoute>
                <Layout><Invoice /></Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
