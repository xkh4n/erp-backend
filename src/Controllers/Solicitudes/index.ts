/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Solicitudes Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError} from "../../Library/Errors/index";

/* INTERFACES */
import { ISolicitud } from '../../Interfaces';

/* MODELS */