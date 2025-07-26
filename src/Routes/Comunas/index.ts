/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const comuna = Router();

/* CONTROLLER */
import { setStates, getAllComunas, getComunaByCity, getComunaByTerritorial, getComunaBySii, getComunaByPostal, getComunaByName } from "../../Controllers/Comunas";	

comuna.put('/comuna/nueva', setStates);
comuna.post('/comuna/todas', getAllComunas);
comuna.post('/comuna/ciudad', getComunaByCity);
comuna.post('/comuna/territorial', getComunaByTerritorial);
comuna.post('/comuna/sii', getComunaBySii);
comuna.post('/comuna/postal', getComunaByPostal);
comuna.post('/comuna/nombre', getComunaByName);


export default comuna;