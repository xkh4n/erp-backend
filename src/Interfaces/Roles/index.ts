export default interface IRoles {
    name: string;
    description?: string;
    permissions: string[];
    fechaCreacion: Date;
    fechaModificacion: Date;
    isActive: boolean;
}