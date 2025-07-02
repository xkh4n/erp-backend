export default interface ISubEstadosActivos {
    nombre: String;
    descripcion: String;
    codigoestado: number;
    idEstado?: string; // Referencia al ID del estado activo
    fechaCreacion?: Date; // Fecha de creación
    fechaModificacion?: Date; // Fecha de modificación
}
