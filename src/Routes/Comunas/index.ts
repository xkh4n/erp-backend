/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const comuna = Router();

/* CONTROLLER */
import { setStates, getAllComunas, getComunaByCity } from "../../Controllers/Comunas";	

comuna.put('/comuna/nueva', setStates);
comuna.post('/comuna/todas', getAllComunas);
comuna.post('/comuna/ciudad', getComunaByCity);


export default comuna;