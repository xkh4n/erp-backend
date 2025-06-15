/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';

const proveedor = Router();

/* CONTROLLER */
import { createProveedor } from "../../Controllers/Proveedor";

proveedor.put('/proveedor/nuevo', createProveedor);

export default proveedor;