import { Router } from 'express';
import { validatePerson, validateObjectId, validateCreatePerson } from '../../Middlewares/Validations';
import { createPerson } from '../../Controllers/Persons';

const person = Router();

person.put('/person/create', validateCreatePerson, createPerson);

export default person;