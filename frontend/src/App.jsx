import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import WhatsApp from './pages/WhatsApp';
import Templates from './pages/Templates';
import MessageLogs from './pages/MessageLogs';
import Invoice from './pages/Invoice';
import Services from './pages/Services';

export default function App() {
  return (
    <BrowserRouter>
      <>
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
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/customers" element={<Layout><Customers /></Layout>} />
          <Route path="/whatsapp" element={<Layout><WhatsApp /></Layout>} />
          <Route path="/templates" element={<Layout><Templates /></Layout>} />
          <Route path="/message-logs" element={<Layout><MessageLogs /></Layout>} />
          <Route path="/invoice" element={<Layout><Invoice /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    </BrowserRouter>
  );
}
