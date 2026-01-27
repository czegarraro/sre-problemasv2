/**
 * Header Component
 */
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, User, Activity, BarChart3, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Dynatrace Problems</h1>
            <p className="text-xs text-muted-foreground">Monitoring Dashboard</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              location.pathname === '/dashboard'
                ? 'bg-blue-500/20 text-blue-400'
                : 'hover:bg-white/5 text-muted-foreground'
            )}
          >
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          
          <Link
            to="/analytics"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              location.pathname === '/analytics'
                ? 'bg-blue-500/20 text-blue-400'
                : 'hover:bg-white/5 text-muted-foreground'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Analytics</span>
          </Link>
          
          <Link
            to="/downtime"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              location.pathname === '/downtime'
                ? 'bg-orange-500/20 text-orange-400'
                : 'hover:bg-white/5 text-muted-foreground'
            )}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Downtime</span>
          </Link>
          
          <Link
            to="/false-positives"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              location.pathname === '/false-positives'
                ? 'bg-red-500/20 text-red-400'
                : 'hover:bg-white/5 text-muted-foreground'
            )}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">FP Analysis</span>
          </Link>
          
          <Link
            to="/problems"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              location.pathname === '/problems'
                ? 'bg-blue-500/20 text-blue-400'
                : 'hover:bg-white/5 text-muted-foreground'
            )}
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Problems</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">{user?.username}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
