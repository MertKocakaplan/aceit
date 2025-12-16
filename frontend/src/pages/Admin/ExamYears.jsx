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
} from 'lucide-react';
import {
  DashboardHeader,
  AnimatedButton,
  AnimatedInput,
  Modal,
} from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';

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
      const response = await adminAPI.examYears.getAll();
      // response = { success: true, data: [...] }
      setYears(response.data);
    } catch {
      // Axios interceptor will show the error toast
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
    } catch {
      // Axios interceptor will show the error toast
    }
  };

  const handleSetActive = async (id) => {
    try {
      await adminAPI.examYears.setActive(id);
      toast.success('Aktif yıl değiştirildi');
      fetchYears();
    } catch {
      // Axios interceptor will show the error toast
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
    } catch {
      // Axios interceptor will show the error toast
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <DashboardBackgroundEffects />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl shadow-elegant">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-normal bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent font-display">
                    Sınav Yılları
                  </h1>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1 font-display">
                    Sınav yıllarını yönet ve aktif yılı belirle
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddModal}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-colors shadow-elegant font-display font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Yeni Yıl Ekle
              </motion.button>
            </div>
          </motion.div>

          {/* Years List */}
          {loading ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-purple-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 font-display">Yükleniyor...</p>
            </div>
          ) : years.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant p-12 text-center"
            >
              <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2 font-display">
                Henüz yıl yok
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 font-display">
                İlk sınav yılını ekleyerek başla
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddModal}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-colors shadow-elegant font-display font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                İlk Yılı Ekle
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {years.map((year, index) => (
                <motion.div
                  key={year.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={`relative bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant overflow-hidden group hover:shadow-elegant-lg transition-shadow ${
                    year.isActive ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-fuchsia-600"></div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                          <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 font-display">
                            {year.year}
                          </h3>
                          {year.isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800 font-display">
                              <Check className="w-3 h-3" />
                              Aktif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {year.examDate && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 font-display">
                        <span className="font-semibold">Sınav Tarihi:</span> {new Date(year.examDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}

                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 font-display">
                      <span className="font-semibold">{year._count?.topicStats || 0}</span> konu verisi
                    </p>

                    <div className="flex gap-2">
                      {!year.isActive && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSetActive(year.id)}
                          className="flex-1 px-3 py-2 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors font-display font-medium border-2 border-emerald-200 dark:border-emerald-800"
                        >
                          Aktif Yap
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(year)}
                        className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors border-2 border-blue-200 dark:border-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(year.id)}
                        className="p-2.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors border-2 border-rose-200 dark:border-rose-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingYear(null);
          setFormData({ year: '', examDate: '' });
        }}
        title={editingYear ? 'Yıl Düzenle' : 'Yeni Yıl Ekle'}
        maxWidth="md"
      >
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
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowModal(false);
                setEditingYear(null);
                setFormData({ year: '', examDate: '' });
              }}
              className="flex-1 px-4 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-display font-medium"
            >
              İptal
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-colors shadow-elegant font-display font-medium"
            >
              {editingYear ? 'Güncelle' : 'Ekle'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamYears;