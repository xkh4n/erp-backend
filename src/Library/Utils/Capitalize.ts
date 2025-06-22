export default function Capitalize(str: string): string {
    if (!str) return str;
    str = str.toLowerCase(); // Convierte todo a minúsculas
    return str
        .trim() // Elimina espacios al inicio y final
        .split(/\s+/) // Divide por uno o más espacios
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}