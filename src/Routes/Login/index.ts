/* EXPRESS */
import express from 'express';

/* ROUTER */
import { Router } from 'express';
const login = Router();

/* CONTROLLER */
import { Login } from '../../Controllers/Login/index';

login.post('/login', Login);


export default login;