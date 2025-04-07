/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const registro = Router();

/* CONTROLLER */
import { NewUser } from '../../Controllers/Registro/index';

registro.put('/registro/usuario', NewUser);


export default registro;