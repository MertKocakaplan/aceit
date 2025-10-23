import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { adminAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Check,
  ArrowLeft,
} from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  GlassCard,
  AnimatedButton,
  AnimatedInput,
} from '../../ui';

const ExamYears = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({
    year: '',
    examDate: '',
  });

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const data = await adminAPI.examYears.getAll();
      setYears(data);
    } catch (error) {
      toast.error('Yıllar yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingYear) {
        await adminAPI.examYears.update(editingYear.id, {
          examDate: formData.examDate || null,
        });
        toast.success('Yıl güncellendi');
      } else {
        await adminAPI.examYears.create({
          year: parseInt(formData.year),
          examDate: formData.examDate || null,
        });
        toast.success('Yıl eklendi');
      }

      setShowModal(false);
      setFormData({ year: '', examDate: '' });
      setEditingYear(null);
      fetchYears();
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleSetActive = async (id) => {
    try {
      await adminAPI.examYears.setActive(id);
      toast.success('Aktif yıl değiştirildi');
      fetchYears();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu yılı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await adminAPI.examYears.delete(id);
      toast.success('Yıl silindi');
      fetchYears();
    } catch (error) {
      toast.error('Yıl silinemedi');
    }
  };

  const openEditModal = (year) => {
    setEditingYear(year);
    setFormData({
      year: year.year.toString(),
      examDate: year.examDate ? year.examDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingYear(null);
    setFormData({ year: '', examDate: '' });
    setShowModal(true);
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
            className="flex items-center justify-between"
          >
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Admin Panel'e Dön</span>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Sınav Yılları
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Sınav yıllarını yönet ve aktif yılı belirle
              </p>
            </div>

            <AnimatedButton
              onClick={openAddModal}
              variant="primary"
              icon={Plus}
            >
              Yeni Yıl Ekle
            </AnimatedButton>
          </motion.div>

          {/* Years List */}
          {loading ? (
            <GlassCard className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </GlassCard>
          ) : years.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Henüz yıl yok
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                İlk sınav yılını ekleyerek başla
              </p>
              <AnimatedButton
                onClick={openAddModal}
                variant="primary"
                icon={Plus}
              >
                İlk Yılı Ekle
              </AnimatedButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {years.map((year, index) => (
                <motion.div
                  key={year.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className={`p-6 ${year.isActive ? 'ring-2 ring-green-500' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            {year.year}
                          </h3>
                          {year.isActive && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                              <Check className="w-3 h-3" />
                              Aktif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {year.examDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Sınav Tarihi: {new Date(year.examDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {year._count?.topicStats || 0} konu verisi
                    </p>

                    <div className="flex gap-2">
                      {!year.isActive && (
                        <button
                          onClick={() => handleSetActive(year.id)}
                          className="flex-1 px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          Aktif Yap
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(year)}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(year.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                {editingYear ? 'Yıl Düzenle' : 'Yeni Yıl Ekle'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatedInput
                  id="year"
                  name="year"
                  type="number"
                  label="Yıl"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  icon={Calendar}
                  required
                  disabled={!!editingYear}
                  min="2000"
                  max="2100"
                />

                <AnimatedInput
                  id="examDate"
                  name="examDate"
                  type="date"
                  label="Sınav Tarihi (Opsiyonel)"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  icon={Calendar}
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingYear(null);
                      setFormData({ year: '', examDate: '' });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    {editingYear ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExamYears;