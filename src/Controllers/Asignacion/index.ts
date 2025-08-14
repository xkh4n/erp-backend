/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Asignacion Controller:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import {CustomError, createServerError, createNotFoundError, createConflictError, createValidationError} from "../../Library/Errors/index";

/* INTERFACES */
import { IAsignacion } from '../../Interfaces';

/* MODELS */
import AsignacionModel from '../../Models/asignacionModel';