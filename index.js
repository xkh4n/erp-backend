/* ENVIRONMENT */
const dotenv = require("dotenv").config();

/* LOGS */
const log4 = require("log4js");
const logger = log4.getLogger("File Index.js");
logger.level = "all";

/* BDD */
const mongo = require("mongoose");
mongo.set("strictQuery", false);

/* SERVER */
const app = require("./server");
var SERVER = '';


/* PORT */
var PORT = undefined; 

/* URL */
var URI = '';

/* VALIDATE THE AMBIENT RUNNING */
switch (process.env.NODE_ENV) {
  case 'production':
    PORT = 3030; //PUERTO DEL SERVIDOR EXPRESS PARA PRODUCCION
    URI = `mongodb://prd_${process.env.DB_USER}:${process.env.DB_PASS}p@${process.env.DB_HOST}01PRD:${process.env.DB_PORT}/prd_${process.env.DB_NAME}?${process.env.DB_AUTH}`;
    SERVER = 'PRODUCTION';
    break;
  case 'development':
    PORT = 3040; //PUERTO DEL SERVIDOR EXPRESS PARA DESARROLLO
    
    URI = `mongodb://dev_${process.env.DB_USER}:${process.env.DB_PASS}d@${process.env.DB_HOST.toUpperCase()}02DEV/dev_${process.env.DB_NAME}?${process.env.DB_AUTH}`;
    SERVER = 'DEVELOPMENT';
    break;
  case 'testing':
    PORT = 3050; //PUERTO DEL SERVIDOR EXPRESS PARA TESTING
    URI = `mongodb://tst_${process.env.DB_USER}:${process.env.DB_PASS}t@${process.env.DB_HOST}03TST:${process.env.DB_PORT}/tst_${process.env.DB_NAME}?${process.env.DB_AUTH}`;

    SERVER = 'TESTING';
    break;
}

(async () => {
    try {
        logger.fatal(`Connecting to ${SERVER}...`);
        await mongo.connect(URI);
        logger.info(`Connection to ${SERVER} it's Ok`);
        await app.listen(PORT, () => {
            logger.debug(`Server of ${SERVER} is Running in: http://${SERVER}:${PORT}/api/${process.env.API_VER}/`);
        });
    } catch (error) {
        logger.error("Connection to BDD is Fail: ", error);
    }
})();