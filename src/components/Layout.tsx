import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  LayoutDashboard, 
  User, 
  BarChart3, 
  MessageCircle, 
  Plus, 
  LogOut,
  Settings
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: MessageCircle, label: 'Contact', path: '/contact' },
    { icon: Plus, label: 'Add Income/Expenses', path: '/add-transaction' },
    { icon: Settings, label: 'Manage Transactions', path: '/manage-transactions' },
    ...(user?.role === 'admin' ? [{ icon: Settings, label: 'Admin Panel', path: '/admin' }] : []),
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-card">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-full flex-col bg-gradient-primary">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-white">Menu</h2>
                </div>
                <nav className="flex-1 space-y-2 px-4">
                  {menuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className="w-full justify-start text-white hover:bg-white/20"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
                <div className="p-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white hover:bg-white/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Trust Name */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Vinayk Mitra Mandal
            </h1>
          </div>

          {/* User Avatar */}
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={user?.photo} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;