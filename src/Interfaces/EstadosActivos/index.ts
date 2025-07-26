export default interface IEstadosActivos {
    codigo?: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    fechaCreacion: Date;
    fechaModificacion?: Date;        // Opcional
    usuarioCreacion?: string;
    usuarioModificacion?: string;    // Opcional
}