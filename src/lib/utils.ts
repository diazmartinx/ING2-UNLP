export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
} 