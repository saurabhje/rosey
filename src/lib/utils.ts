export function getDateLabel(dateStr: string) {
    const date = new Date(dateStr).toDateString()
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (date === today) {
        return 'Today';
    }
    if (date === yesterday) {   
        return 'Yesterday';
    }
    return date;
}
