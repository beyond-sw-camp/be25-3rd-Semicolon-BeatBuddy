export const getResponseResult = (response) => {
  return response.data?.result ?? response.data?.data ?? response.data
}

export const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || '요청 처리 중 오류가 발생했습니다.'
}
