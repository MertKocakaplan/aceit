import { toast } from 'sonner';

/**
 * API hatalarını kullanıcı dostu mesajlara çevir
 */
export const getErrorMessage = (error) => {
  // Eğer hata objesi string ise direkt döndür
  if (typeof error === 'string') {
    return error;
  }

  // Backend'den gelen hata mesajı
  if (error?.message) {
    return error.message;
  }

  // Axios response hatası
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Network hatası
  if (error?.message === 'Network Error') {
    return 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
  }

  // Timeout hatası
  if (error?.code === 'ECONNABORTED') {
    return 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.';
  }

  // Genel hata
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

/**
 * Başarılı toast göster
 */
export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

/**
 * Hata toast göster
 */
export const showErrorToast = (error) => {
  const message = getErrorMessage(error);
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  });
};

/**
 * Bilgi toast göster
 */
export const showInfoToast = (message) => {
  toast.info(message, {
    duration: 3000,
    position: 'top-right',
  });
};

/**
 * Uyarı toast göster
 */
export const showWarningToast = (message) => {
  toast.warning(message, {
    duration: 3500,
    position: 'top-right',
  });
};

/**
 * Yükleme toast göster (promise ile)
 */
export const showLoadingToast = (promise, messages) => {
  return toast.promise(promise, {
    loading: messages.loading || 'İşlem yapılıyor...',
    success: messages.success || 'İşlem başarılı!',
    error: (error) => getErrorMessage(error),
    duration: 3000,
    position: 'top-right',
  });
};

/**
 * API çağrısını error handling ile wrap et
 */
export const handleApiCall = async (apiFunction, options = {}) => {
  const {
    successMessage,
    errorMessage,
    showLoading = false,
    onSuccess,
    onError,
  } = options;

  try {
    const result = await apiFunction();

    if (successMessage) {
      showSuccessToast(successMessage);
    }

    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    const message = errorMessage || getErrorMessage(error);
    showErrorToast(message);

    if (onError) {
      onError(error);
    }

    throw error;
  }
};
