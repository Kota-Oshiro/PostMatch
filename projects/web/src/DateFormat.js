export const formats = {
    DATE: 'yyyy/mm/dd',
    DATE_TIME: 'yyyy/mm/dd hh:mm',
    MONTH_DAY: 'mm/dd',
    MONTH_DAY_TIME: 'mm/dd hh:mm',
    HOUR_MINUTE: 'hh:mm',
};

const pad = (num) => String(num).padStart(2, '0');

export const formatUsing = (dateTimeString, formatType) => {
    const date = new Date(dateTimeString);
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    
    switch (formatType) {
        case formats.DATE:
            return `${year}/${month}/${day}`;
        case formats.DATE_TIME:
            return `${year}/${month}/${day} ${hours}:${minutes}`;
        case formats.MONTH_DAY:
            return `${month}/${day}`;
        case formats.MONTH_DAY_TIME:
            return `${month}/${day} ${hours}:${minutes}`;
        case formats.HOUR_MINUTE:
            return `${hours}:${minutes}`;
        default:
            return dateTimeString;
    }
};
