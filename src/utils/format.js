import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * 날짜를 "오후 3:45" 형식으로 포맷
 */
export function formatTime(dateStr) {
    if (!dateStr) return ''
    return format(new Date(dateStr), 'a h:mm', { locale: ko })
}

/**
 * 날짜를 "n분 전", "n시간 전" 형식으로 포맷
 */
export function formatRelative(dateStr) {
    if (!dateStr) return ''
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ko })
}

/**
 * 날짜를 "2025.04.10" 형식으로 포맷
 */
export function formatDate(dateStr) {
    if (!dateStr) return ''
    return format(new Date(dateStr), 'yyyy.MM.dd')
}

/**
 * 텍스트를 maxLen 글자까지만 표시하고 "..." 처리
 */
export function truncate(text, maxLen = 20) {
    if (!text) return ''
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}
