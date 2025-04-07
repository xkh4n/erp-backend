/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Registro Controllers:');
logger.level = 'all';

import { Request, Response } from "express";

const NewUser = (req: Request, res: Response) => {
    try {
        res.status(200).json({
            message: "Registro successful",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

export{
    NewUser
}