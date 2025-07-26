export default interface ICategoria {
    codigo: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    estado: boolean;
    fechaCreacion?: Date; // Fecha de creación
    fechaModificacion?: Date; // Fecha de modificación
}