import { format, isToday, isTomorrow, isPast, addDays, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (dateString, fmt = 'dd MMM yyyy') => {
    if (!dateString) return '';
    return format(parseISO(dateString), fmt, { locale: es });
};

export const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    const date = parseISO(dateString);

    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    if (isPast(date) && !isToday(date)) return 'Vencido'; // Simplified check

    return format(date, 'EEEE d MMM', { locale: es });
};

export const isOverdue = (dateString) => {
    if (!dateString) return false;
    const date = parseISO(dateString);
    return isPast(date) && !isToday(date);
};
