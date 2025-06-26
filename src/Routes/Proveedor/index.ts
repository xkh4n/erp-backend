/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';

const proveedor = Router();

/* CONTROLLER */
import { createProveedor, getAllProveedores, getProveedorById } from "../../Controllers/Proveedor";

proveedor.put('/proveedor/nuevo', createProveedor);
proveedor.post('/proveedor/todos', getAllProveedores);
proveedor.post('/proveedor/getbyid', getProveedorById);

export default proveedor;