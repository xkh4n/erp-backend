import {Router} from "express";

/* CONTROLLER */
import { asignarActivo } from "../../Controllers/Asignacion";
import { conditionalAuth } from "../../Library/Security/conditionalAuth";
const asigna = Router();

asigna.post('/asignacion/asignar', conditionalAuth, asignarActivo);
export default asigna;