import {Router} from "express";

/* CONTROLLER */
import { asignarActivo } from "../../Controllers/Asignacion";
import { requireAuth } from "../../Middlewares/Auth";
const asigna = Router();

asigna.post('/asignacion/asignar', requireAuth, asignarActivo);


export default asigna;