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
  Search,
  Mail,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  AnimatedInput,
  AnimatedSelect,
  GlassCard,
} from '../../ui';

const Users = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
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

  const handleFocus = (e) => {
    setFocusedField(e.target.name);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-xl text-xs font-medium border-2 border-purple-200 dark:border-purple-800 font-display">
          <Shield className="w-3.5 h-3.5" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-medium border-2 border-blue-200 dark:border-blue-800 font-display">
        <User className="w-3.5 h-3.5" />
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-elegant">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-normal bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-display">
                  Kullanıcı Yönetimi
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 font-display">
                  {users.length} kullanıcı yönetiliyor
                </p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600"></div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <AnimatedInput
                    id="search"
                    name="search"
                    type="text"
                    label="Ara"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={Search}
                    placeholder="Email, kullanıcı adı veya ad ile ara..."
                  />
                </div>
                <div>
                  <AnimatedSelect
                    id="role"
                    name="role"
                    label="Rol"
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={Filter}
                    options={[
                      { value: '', label: 'Tüm Roller' },
                      { value: 'USER', label: 'Kullanıcı' },
                      { value: 'ADMIN', label: 'Admin' },
                    ]}
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-elegant font-display font-medium"
              >
                Ara
              </button>
            </div>
          </motion.div>

          {/* Users List */}
          {loading ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 font-display">Yükleniyor...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant p-12 text-center">
              <UsersIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 font-display">Kullanıcı bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {users.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                  className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant overflow-hidden group hover:shadow-elegant-lg transition-shadow"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-cyan-600"></div>

                  <div className="p-6 pl-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                            {u.fullName}
                          </h3>
                          {getRoleBadge(u.role)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-display">@{u.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="font-display">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span className="font-display">Branş: {getExamTypeBadge(u.examType)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-display text-xs">
                              Kayıt: {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        {u.id !== user.id && (
                          <>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-display cursor-pointer focus:outline-none focus:border-blue-500"
                            >
                              <option value="USER">Kullanıcı</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(u.id)}
                              className="px-3 py-2.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors flex items-center justify-center gap-2 font-display font-medium border-2 border-rose-200 dark:border-rose-800"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </motion.button>
                          </>
                        )}
                        {u.id === user.id && (
                          <p className="text-sm text-neutral-500 italic text-center font-display">Mevcut kullanıcı</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Total Count */}
          {!loading && users.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant p-4 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display">
                Toplam <span className="font-semibold">{users.length}</span> kullanıcı
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
