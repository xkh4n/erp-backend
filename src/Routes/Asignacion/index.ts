import {Router} from "express";

/* CONTROLLER */
import { asignarActivo } from "../../Controllers/Asignacion";
import { conditionalAuth, conditionalPermission } from "../../Library/Security/conditionalAuth";
const asigna = Router();

asigna.post('/asignacion/asignar', conditionalAuth, conditionalPermission('users', 'read'), asignarActivo);
export default asigna;