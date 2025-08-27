import { Router } from 'express';
import { conditionalValidation } from '../../Library/Security/conditionalAuth';
import { createPersonAndUserSchema } from '../../Library/Validations/zod';
import { createPerson } from '../../Controllers/Persons';

const person = Router();

// Temporalmente sin middleware para inicialización
person.put('/person/create', createPerson);

export default person;