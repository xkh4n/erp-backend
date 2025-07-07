import moment from 'moment-timezone';

/**
 * Obtiene la fecha y hora actual en la zona horaria de Chile.
 * @returns {Date} Fecha y hora actual en Chile.
 */
export function getChileDateTime(): Date {
    // Simplemente crear la fecha en Chile y convertirla directamente
    const chileTime = moment.tz('America/Santiago');
    
    // Obtener los componentes de fecha/hora en Chile
    const year = chileTime.year();
    const month = chileTime.month(); // moment usa 0-11
    const day = chileTime.date();
    const hour = chileTime.hour();
    const minute = chileTime.minute();
    const second = chileTime.second();
    const millisecond = chileTime.millisecond();
    
    // Crear una nueva fecha UTC con los valores de Chile
    return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
}