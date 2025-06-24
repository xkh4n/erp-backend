// This file defines the interface for a Solicitud object in TypeScript.
export default interface ISolicitud {
    codigo: Number;
    solicitante: String;
    cargosolicitante: String;
    beneficiario: String;
    gerencia: String;
    categoria: String;
    producto: String;
    cantidad: Number;
    email: String;
    telefonosolicitante: String;
    telefonobenificario: String;
    cuantabeneficiario: String;
    observaciones: String;
    fecha: Date;
    estado: String;
}