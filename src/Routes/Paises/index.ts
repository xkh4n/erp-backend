/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const paises = Router();

/* CONTROLLER */
import { deleteCountry, getAllCountries, getCountryById, getPaisByIso, getPaisByIata, setPaises, updateCountry, updateCountryByIso, updateCountryByIata } from '../../Controllers/Paises';

paises.put('/pais/nuevo', setPaises);
paises.post('/pais/todos', getAllCountries);
paises.post('/pais/uno', getCountryById);
paises.post('/pais/iso', getPaisByIso);
paises.post('/pais/iata', getPaisByIata);
paises.delete('/pais/eliminar', deleteCountry);
paises.patch('/pais/actualizar', updateCountry);
paises.patch('/pais/updatebyiso', updateCountryByIso);
paises.patch('/pais/updatebyiata', updateCountryByIata);

export default paises;