import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Shield, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ProfileEditModal from '../components/modals/ProfileEditModal';

const DashboardHeader = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Check if we're on an admin page
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    onLogout();
  };

  const handleProfileEditClick = () => {
    setIsDropdownOpen(false);
    setIsProfileModalOpen(true);
  };

  return (
    <>
      <header className="relative z-20 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-md shadow-sm">
        {/* Decorative gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-400/30 dark:via-primary-600/30 to-transparent" />

        {/* Subtle shadow gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-neutral-100/20 dark:to-neutral-950/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-600 dark:to-primary-800 rounded-2xl flex items-center justify-center shadow-elegant-lg group-hover:shadow-elegant-xl transition-all duration-300 group-hover:scale-105">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-normal text-primary-700 dark:text-primary-400 font-display tracking-wide">
                AceIt
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {/* Admin Button (only on non-admin pages) */}
              {user?.role === 'ADMIN' && !isAdminPage && (
                <>
                  <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-700"></div>
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all font-sans"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                </>
              )}

              <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-700"></div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {/* User Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-medium">
                    {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                  </div>

                  {/* User Info (hidden on mobile) */}
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">
                      {user?.name || user?.username}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                      {user?.email}
                    </p>
                  </div>

                  {/* Dropdown Icon */}
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden z-20">
                      <div className="p-2">
                        {/* Profile Edit */}
                        <button
                          onClick={handleProfileEditClick}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm font-medium">Profili Düzenle</span>
                        </button>

                        {/* Divider */}
                        <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />

                        {/* Logout */}
                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsLogoutConfirmOpen(false)}
          />

          {/* Confirmation Dialog */}
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Çıkış Yapmak İstediğinizden Emin Misiniz?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Oturumunuz sonlandırılacak ve giriş sayfasına yönlendirileceksiniz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
