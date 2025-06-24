export default interface ISubEstadosActivos {
    nombre: String;
    descripcion: String;
    estadoActivo: String; // This should reference the ID of an IEstadosActivos object
}
