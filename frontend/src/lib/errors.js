export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (typeof error?.response?.data === 'string' && error.response.data.trim()) {
    return error.response.data
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Sunucuya baglanilamadi. Backend ve CORS ayarlarini kontrol edin.'
  }

  return fallbackMessage
}
