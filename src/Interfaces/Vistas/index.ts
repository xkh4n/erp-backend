export default interface IVistas {
    codigo: string;
    nombre: string;
    enlace: string;
    submenu: boolean;
    vistas?: IVistas[];
}