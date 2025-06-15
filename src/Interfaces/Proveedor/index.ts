// This file defines the IProveedor interface for a supplier in an ERP system.
export default interface IProveedor {
    rut: string;
    razonSocial: string;
    giro: string;
    telefono: string;
    correo: string;
    direccion: string;
    fechaCreacion: Date; // ISO date string
    contacto: string;
    fonoContacto: string;
    tipoServicio: string;
    estado: boolean; // true or false
    condicionesPago: string;
    condicionesEntrega: string;
    condicionesDespacho: string;
    pais: string; // ISO country code
    ciudad: string; // ISO city code
    comuna: string; // ID of the comuna
}