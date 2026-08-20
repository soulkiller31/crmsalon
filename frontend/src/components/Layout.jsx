import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, FileText, Smartphone,
  LogOut, Menu, X, Scissors, Receipt,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/invoice', icon: Receipt, label: 'Invoice' },
  { to: '/whatsapp', icon: Smartphone, label: 'WhatsApp' },
  { to: '/templates', icon: FileText, label: 'Templates' },
  { to: '/message-logs', icon: MessageSquare, label: 'Message Logs' },
];

export default function Layout({ children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <aside className="flex flex-col h-full bg-dark-900 border-r border-dark-700">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-700">
        <div className="p-2 rounded-xl bg-accent/10 text-accent">
          <Scissors size={22} />
        </div>
        <div>
          <h1 className="font-bold text-dark-50 text-lg leading-tight">Salon CRM</h1>
          <p className="text-xs text-dark-400">Management System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
            {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">{admin?.name}</p>
            <p className="text-xs text-dark-400 truncate">{admin?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-dark-400 hover:bg-dark-800 hover:text-red-400 transition-colors">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">{sidebar}</div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 z-50">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-dark-900 border-b border-dark-700">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-dark-800">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-dark-50">Salon CRM</span>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-dark-800 opacity-0 pointer-events-none">
            <X size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
