import { useState, useRef } from 'react';
import { useAuth } from '../../store/AuthContext';
import { aiAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Brain,
  X,
  Loader2,
  Star,
  History,
  ChevronDown,
  Calendar,
  Clock,
  Sparkles,
  ImagePlus,
  Send,
  RotateCcw
} from 'lucide-react';
import { DashboardHeader } from '../../ui';
import { DashboardBackgroundEffects, GradientCard } from '../../components/dashboard';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * AI Question Solver Page
 * Allows users to solve questions using AI with text and/or images
 */
const QuestionSolver = () => {
  const { user, logout } = useAuth();
  const [questionText, setQuestionText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [currentRating, setCurrentRating] = useState(null);
  const fileInputRef = useRef(null);

  /**
   * Görüntü seçildiğinde
   */
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Dosya boyutu çok büyük. Maksimum 10MB yüklenebilir.');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        toast.error('Lütfen bir görüntü dosyası seçin');
        return;
      }

      setSelectedImage(file);

      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Görüntüyü kaldır
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Soruyu çöz
   */
  const handleSolveQuestion = async (e) => {
    e.preventDefault();

    if (!questionText.trim() && !selectedImage) {
      toast.error('Lütfen soru metni yazın veya görüntü yükleyin');
      return;
    }

    setIsLoading(true);
    setSolution(null);
    setCurrentRating(null);

    try {
      const response = await aiAPI.solveQuestion({
        questionText: questionText.trim() || null,
        image: selectedImage,
      });

      if (response.success) {
        setSolution(response.data);
        toast.success('Soru başarıyla çözüldü!');
      }
    } catch (error) {
      toast.error(error.message || 'Soru çözülürken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Çözümü değerlendir
   */
  const handleRateSolution = async (rating) => {
    if (!solution || !solution.id) return;

    try {
      await aiAPI.rateQuestion(solution.id, rating);
      setCurrentRating(rating);
      toast.success('Değerlendirmeniz kaydedildi');
    } catch (error) {
      toast.error('Değerlendirme kaydedilirken hata oluştu');
    }
  };

  /**
   * Yeni soru
   */
  const handleNewQuestion = () => {
    setQuestionText('');
    setSelectedImage(null);
    setImagePreview(null);
    setSolution(null);
    setCurrentRating(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Geçmişi getir
   */
  const handleShowHistory = async () => {
    setShowHistory(true);
    try {
      const response = await aiAPI.getHistory({ limit: 10 });
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      toast.error('Geçmiş yüklenirken hata oluştu');
    }
  };

  /**
   * LaTeX içeren metni render et
   */
  const renderLatex = (text) => {
    if (!text) return null;

    const parts = [];
    let lastIndex = 0;

    // Block math ($$...$$) regex
    const blockRegex = /\$\$(.*?)\$\$/gs;
    // Inline math ($...$) regex
    const inlineRegex = /\$([^\$]+?)\$/g;

    // First, find all block math
    const blockMatches = [...text.matchAll(blockRegex)];
    const blockRanges = blockMatches.map(match => ({
      start: match.index,
      end: match.index + match[0].length,
      latex: match[1],
      type: 'block'
    }));

    // Then find inline math (excluding block math ranges)
    let tempText = text;
    blockRanges.forEach(range => {
      tempText = tempText.substring(0, range.start) +
                 ' '.repeat(range.end - range.start) +
                 tempText.substring(range.end);
    });

    const inlineMatches = [...tempText.matchAll(inlineRegex)];
    const inlineRanges = inlineMatches.map(match => ({
      start: match.index,
      end: match.index + match[0].length,
      latex: match[1],
      type: 'inline'
    }));

    // Combine and sort all ranges
    const allRanges = [...blockRanges, ...inlineRanges].sort((a, b) => a.start - b.start);

    // Build the result
    allRanges.forEach((range, index) => {
      // Add text before this math
      if (range.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, range.start)}
          </span>
        );
      }

      // Add the math
      if (range.type === 'block') {
        parts.push(
          <div key={`math-${index}`} className="my-4">
            <BlockMath math={range.latex} />
          </div>
        );
      } else {
        parts.push(
          <InlineMath key={`math-${index}`} math={range.latex} />
        );
      }

      lastIndex = range.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-final">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background Effects */}
      <DashboardBackgroundEffects />

      {/* Header */}
      <DashboardHeader user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-elegant-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-5xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                    AI Soru Çözücü
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 font-sans mt-1">
                    GPT-5.1 ile desteklenmektedir
                  </p>
                </div>
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-4 font-serif max-w-xl">
                Soru metnini yaz veya fotoğrafını yükle, AI sana adım adım çözüm sunsun
              </p>
            </div>

            {/* History Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShowHistory}
              className="relative flex items-center gap-2 px-6 py-3.5 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-2 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 rounded-2xl font-medium shadow-elegant hover:shadow-elegant-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all overflow-hidden group"
            >
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.08]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="historyBtnGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#historyBtnGrid)" />
                </svg>
              </div>
              <History className="relative w-5 h-5" />
              <span className="relative font-display">Geçmiş</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant overflow-hidden"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/50 via-primary-600/80 to-primary-500/50" />

            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="inputPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-neutral-600" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#inputPattern)" />
              </svg>
            </div>

            <div className="relative p-8">
              <h3 className="text-2xl font-normal text-neutral-900 dark:text-white mb-6 font-display tracking-wide">
                Soru Girişi
              </h3>

              <form onSubmit={handleSolveQuestion} className="space-y-6">
                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
                    Soru Metni
                  </label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Sorunuzu buraya yazın..."
                    className="w-full h-36 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-600 resize-none transition-all font-sans text-neutral-900 dark:text-white placeholder-neutral-400"
                    disabled={isLoading}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
                    Soru Görseli (Opsiyonel)
                  </label>

                  {!imagePreview ? (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-2xl p-10 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-600 transition-all bg-neutral-50/50 dark:bg-neutral-800/30 group"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-primary-50 dark:bg-primary-950/30 rounded-2xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                          <ImagePlus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                            Görüntü yüklemek için tıklayın
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 font-sans">
                            PNG, JPG, WebP (Maks. 10MB)
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-contain bg-neutral-100 dark:bg-neutral-800"
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || (!questionText.trim() && !selectedImage)}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="relative w-full py-4 px-6 bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white rounded-2xl font-medium shadow-elegant-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 overflow-hidden"
                >
                  {/* Dot pattern */}
                  <div className="absolute inset-0 opacity-[0.15]">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="solveBtnDots" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="1" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#solveBtnDots)" />
                    </svg>
                  </div>

                  {isLoading ? (
                    <>
                      <Loader2 className="relative w-5 h-5 animate-spin" />
                      <span className="relative font-display">Çözülüyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="relative w-5 h-5" />
                      <span className="relative font-display text-lg">Soruyu Çöz</span>
                      <Send className="relative w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Solution Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant overflow-hidden"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-500/50 via-secondary-600/80 to-secondary-500/50" />

            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="solutionPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-neutral-600" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#solutionPattern)" />
              </svg>
            </div>

            <div className="relative p-8 min-h-[500px] flex flex-col">
              <h3 className="text-2xl font-normal text-neutral-900 dark:text-white mb-6 font-display tracking-wide">
                Çözüm
              </h3>

              {!solution && !isLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 mb-6">
                      <Brain className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <p className="text-lg text-neutral-500 dark:text-neutral-400 font-serif">
                      Çözüm burada görünecek
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-700 dark:border-t-primary-400 rounded-full mx-auto mb-6"
                    />
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 font-serif">
                      AI sorunuzu analiz ediyor...
                    </p>
                  </div>
                </div>
              )}

              {solution && (
                <div className="flex-1 flex flex-col">
                  {/* Solution Text */}
                  <div className="flex-1 prose prose-sm max-w-none dark:prose-invert overflow-y-auto">
                    <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed font-serif">
                      {renderLatex(solution.solution)}
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-4 font-sans">
                      <span>Model: {solution.model}</span>
                      <span>{solution.duration}ms</span>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                        Çözümü değerlendirin:
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <motion.button
                            key={rating}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRateSolution(rating)}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                currentRating && rating <= currentRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-neutral-300 dark:text-neutral-600'
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* New Question Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNewQuestion}
                      className="w-full mt-4 py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl transition-colors flex items-center justify-center gap-2 font-display"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Yeni Soru
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border-2 border-neutral-200 dark:border-neutral-800"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/50 via-primary-600/80 to-primary-500/50" />

            {/* Header */}
            <div className="relative p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-950/30 rounded-xl">
                  <History className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-normal text-neutral-900 dark:text-white font-display">
                  Soru Geçmişi
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
                    >
                      {/* Question Summary */}
                      <button
                        onClick={() =>
                          setExpandedHistoryId(
                            expandedHistoryId === item.id ? null : item.id
                          )
                        }
                        className="w-full p-4 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-sans">
                                {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-sans">{item.responseTime}ms</span>
                            </div>
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                                  {item.rating}/5
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-neutral-900 dark:text-white font-medium line-clamp-2 font-sans">
                            {item.questionText}
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-neutral-400 transition-transform flex-shrink-0 ${
                            expandedHistoryId === item.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Expanded Content */}
                      {expandedHistoryId === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800"
                        >
                          {/* Question Image */}
                          {item.questionImage && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
                                Soru Görseli:
                              </p>
                              <img
                                src={item.questionImage}
                                alt="Question"
                                className="max-w-full h-auto rounded-xl border border-neutral-200 dark:border-neutral-700"
                              />
                            </div>
                          )}

                          {/* Solution */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
                              Çözüm:
                            </p>
                            <div className="prose prose-sm max-w-none dark:prose-invert bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
                              <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed font-serif">
                                {renderLatex(item.aiResponse)}
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-800 font-sans">
                            <span>Model: {item.aiModel}</span>
                            <span>Tokens: {item.tokensUsed}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-neutral-800 mb-6">
                    <History className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <p className="text-lg text-neutral-500 dark:text-neutral-400 font-serif">
                    Henüz soru geçmişi yok
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuestionSolver;
