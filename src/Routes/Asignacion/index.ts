import {Router} from "express";

/* CONTROLLER */
import { asignarActivo } from "../../Controllers/Asignacion";
import { validateAsignacion } from "../../Middlewares/Validations";
const asigna = Router();

asigna.post('/asignacion/asignar', validateAsignacion, asignarActivo);


export default asigna;