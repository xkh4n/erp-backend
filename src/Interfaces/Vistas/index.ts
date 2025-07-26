export default interface IVistas {
    codVista: string;
    descripcion: string;
    estado: boolean;
    proceso: string;
    label: string;
    link: string;
    title: string;
    fechaCreacion?: Date; // Fecha de creación
    fechaModificacion?: Date; // Fecha de modificación
    vistas?: IVistas[];
}