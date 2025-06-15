/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const ciudad = Router();

/* CONTROLLER */
import { setCity, getAllCities, cityById, cityByCountry, updateCity, deleteCity } from '../../Controllers/Ciudad';

ciudad.put('/ciudad/nueva', setCity);
ciudad.post('/ciudad/todas', getAllCities);
ciudad.post('/ciudad/citybyid', cityById);
ciudad.post('/ciudad/citybycountry', cityByCountry);
ciudad.patch('/ciudad/actualizar', updateCity);
ciudad.delete('/ciudad/eliminar', deleteCity);

export default ciudad;