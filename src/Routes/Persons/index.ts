import { Router } from 'express';
import { requireAuth, requirePermission } from '../../Middlewares/Auth';
import { validateArrayZod, createPersonAndUserSchema } from '../../Library/Validations/zod';
import { createPerson } from '../../Controllers/Persons';

const person = Router();

/*
person.put('/person/create', validateArrayZod(createPersonAndUserSchema), createPerson);
*/

person.put('/person/create', createPerson);

export default person;