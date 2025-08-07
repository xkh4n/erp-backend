export default interface IProducto {
    nombre: string;
    modelo: string;
    marca?: string;
    descripcion: string;
    categoria: String; // Assuming this is a string representing the category ID
}