import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { adminAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Users as UsersIcon,
  Shield,
  User,
  Trash2,
  ArrowLeft,
  Search,
} from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  GlassCard,
  AnimatedButton,
  AnimatedInput,
  AnimatedSelect,
} from '../../ui';

const Users = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.users.getAll(filters);
      // response = { success: true, data: [...] }
      setUsers(response.data);
    } catch (error) {
      toast.error('Kullanıcılar yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Bu kullanıcının rolünü ${newRole} olarak değiştirmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await adminAPI.users.updateRole(userId, newRole);
      toast.success('Rol güncellendi');
      fetchUsers();
    } catch (error) {
      toast.error('Rol güncellenemedi');
      console.error(error);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === user.id) {
      toast.error('Kendi hesabınızı silemezsiniz');
      return;
    }

    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    try {
      await adminAPI.users.delete(userId);
      toast.success('Kullanıcı silindi');
      fetchUsers();
    } catch (error) {
      toast.error('Kullanıcı silinemedi');
      console.error(error);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
        <User className="w-3 h-3" />
        Kullanıcı
      </span>
    );
  };

  const getExamTypeBadge = (examType) => {
    const labels = {
      'YKS_SAYISAL': 'Sayısal',
      'YKS_ESIT_AGIRLIK': 'Eşit Ağırlık',
      'YKS_SOZEL': 'Sözel',
      'LGS': 'LGS',
    };
    return labels[examType] || examType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Panel'e Dön</span>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Kullanıcı Yönetimi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kullanıcıları görüntüle ve yönet
            </p>
          </motion.div>

          {/* Filters */}
          <GlassCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <AnimatedInput
                  id="search"
                  name="search"
                  type="text"
                  placeholder="Email, kullanıcı adı veya ad ile ara..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  icon={Search}
                />
              </div>
              <AnimatedSelect
                id="role"
                name="role"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                icon={Shield}
                options={[
                  { value: '', label: 'Tüm Roller' },
                  { value: 'USER', label: 'Kullanıcı' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
              />
            </div>
            <div className="mt-4">
              <AnimatedButton
                onClick={handleSearch}
                variant="primary"
                icon={Search}
              >
                Ara
              </AnimatedButton>
            </div>
          </GlassCard>

          {/* Users List */}
          {loading ? (
            <GlassCard className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </GlassCard>
          ) : users.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Kullanıcı bulunamadı</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {users.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {u.fullName}
                          </h3>
                          {getRoleBadge(u.role)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>@{u.username}</p>
                          <p>{u.email}</p>
                          <p>Branş: {getExamTypeBadge(u.examType)}</p>
                          <p className="text-xs">
                            Kayıt: {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {u.id !== user.id && (
                          <>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                            >
                              <option value="USER">Kullanıcı</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(u.id)}
                              className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </motion.button>
                          </>
                        )}
                        {u.id === user.id && (
                          <p className="text-sm text-gray-500 italic">Mevcut kullanıcı</p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Total Count */}
          {!loading && users.length > 0 && (
            <GlassCard className="p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toplam {users.length} kullanıcı
              </p>
            </GlassCard>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;