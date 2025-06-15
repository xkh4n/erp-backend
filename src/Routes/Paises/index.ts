/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const paises = Router();

/* CONTROLLER */
import { deleteCountry, getAllCountries, getCountryById, setPaises, updateCountry } from '../../Controllers/Paises';

paises.put('/pais/nuevo', setPaises);
paises.post('/pais/todos', getAllCountries);
paises.post('/pais/uno', getCountryById);
paises.delete('/pais/eliminar', deleteCountry);
paises.patch('/pais/actualizar', updateCountry);

export default paises;