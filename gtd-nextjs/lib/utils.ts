import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export function formatDateTime(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
}

export function isPast(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < new Date();
}

export function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'P1':
            return 'text-red-600 bg-red-50';
        case 'P2':
            return 'text-orange-600 bg-orange-50';
        case 'P3':
            return 'text-blue-600 bg-blue-50';
        case 'P4':
        default:
            return 'text-gray-600 bg-gray-50';
    }
}

export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        'inbox': 'Inbox',
        'next-actions': 'Próximas Acciones',
        'waiting': 'En Espera',
        'someday': 'Algún Día',
        'completed': 'Completado',
        'trash': 'Papelera'
    };
    return labels[status] || status;
}
