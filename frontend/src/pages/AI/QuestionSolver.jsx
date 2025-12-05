import { useState, useRef } from 'react';
import { aiAPI } from '../../api';
import { toast } from 'sonner';
import { Brain, Upload, X, Loader2, Star, History, ChevronDown, Calendar, Clock } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * AI Question Solver Page
 * Allows users to solve questions using AI with text and/or images
 */
const QuestionSolver = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Soru Çözücü
                </h1>
                <p className="text-gray-600 text-sm">GPT-5.1 ile desteklenmektedir</p>
              </div>
            </div>

            <button
              onClick={handleShowHistory}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              Geçmiş
            </button>
          </div>

          <p className="text-gray-600">
            Soru metnini yazın veya fotoğrafını yükleyin, AI size adım adım çözüm sunsun.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold mb-6">Soru Girişi</h2>

            <form onSubmit={handleSolveQuestion} className="space-y-6">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soru Metni
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Sorunuzu buraya yazın..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soru Görseli (Opsiyonel)
                </label>

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Görüntü yüklemek için tıklayın
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WebP (Maks. 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
              <button
                type="submit"
                disabled={isLoading || (!questionText.trim() && !selectedImage)}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Çözülüyor...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Soruyu Çöz
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Solution Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold mb-6">Çözüm</h2>

            {!solution && !isLoading && (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Çözüm burada görünecek</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">AI sorunuzu analiz ediyor...</p>
                </div>
              </div>
            )}

            {solution && (
              <div className="space-y-6">
                {/* Solution Text */}
                <div className="prose prose-sm max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {renderLatex(solution.solution)}
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Model: {solution.model}</span>
                    <span>{solution.duration}ms</span>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Çözümü değerlendirin:
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRateSolution(rating)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              currentRating && rating <= currentRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* New Question Button */}
                  <button
                    onClick={handleNewQuestion}
                    className="w-full mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Yeni Soru
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Soru Geçmişi</h2>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {history && history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors"
                      >
                        {/* Question Summary */}
                        <button
                          onClick={() =>
                            setExpandedHistoryId(
                              expandedHistoryId === item.id ? null : item.id
                            )
                          }
                          className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-start justify-between gap-4"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <Clock className="w-4 h-4 text-gray-400 ml-2" />
                              <span className="text-sm text-gray-600">
                                {item.responseTime}ms
                              </span>
                              {item.rating && (
                                <div className="flex items-center gap-1 ml-2">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-gray-600">{item.rating}/5</span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-900 font-medium line-clamp-2">
                              {item.questionText}
                            </p>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                              expandedHistoryId === item.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Expanded Content */}
                        {expandedHistoryId === item.id && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            {/* Question Image */}
                            {item.questionImage && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Soru Görseli:
                                </p>
                                <img
                                  src={item.questionImage}
                                  alt="Question"
                                  className="max-w-full h-auto rounded-lg border border-gray-200"
                                />
                              </div>
                            )}

                            {/* Solution */}
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Çözüm:
                              </p>
                              <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {renderLatex(item.aiResponse)}
                                </div>
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                              <span>Model: {item.aiModel}</span>
                              <span>Tokens: {item.tokensUsed}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Henüz soru geçmişi yok</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSolver;
