export const getResponseResult = (response) => {
  return response.data?.result ?? response.data?.data ?? response.data
}

const getValidationMessage = (data) => {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors[0].defaultMessage || data.errors[0].message
  }

  if (Array.isArray(data?.fieldErrors) && data.fieldErrors.length > 0) {
    return data.fieldErrors[0].defaultMessage || data.fieldErrors[0].message
  }

  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors)[0]
  }

  return ''
}

export const getErrorMessage = (error) => {
  const data = error.response?.data

  return (
    data?.message ||
    getValidationMessage(data) ||
    error.message ||
    '요청 처리 중 오류가 발생했습니다.'
  )
}
