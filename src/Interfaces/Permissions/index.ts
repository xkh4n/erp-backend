export default interface IPermissions {
    name: string;
    description: string;
    resource: string;
    action: string;
    isActive: boolean;
    fechaCreacion: Date;
    fechaModificacion: Date;
}