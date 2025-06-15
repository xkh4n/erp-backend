/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const registro = Router();

/* CONTROLLER */
import { NewUser } from '../../Controllers/Registro/index';

registro.put('/registro/basic', NewUser);


export default registro;