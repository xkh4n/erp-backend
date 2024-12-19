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
var PORT_DB = Number.parseInt(process.env.DB_PORT, 10);

/* URL */
var URI = '';

/* VALIDATE THE AMBIENT RUNNING */
switch (process.env.NODE_ENV) {
  case 'production':
    PORT = 3030; //PUERTO DEL SERVIDOR EXPRESS PARA PRODUCCION
     // CASSINI01
    URI = `mongodb://prd_${process.env.DB_USER}:${process.env.DB_PASS}p@${process.env.DB_HOST}01:${PORT_DB}/prd_${process.env.DB_NAME}?${process.env.DB_AUTH}`;
    SERVER = 'PRODUCTION';
    break;
  case 'development':
    PORT = 3040; //PUERTO DEL SERVIDOR EXPRESS PARA DESARROLLO
    PORT_DB = PORT_DB + 10; // CASSINI02
    URI = `mongodb://dev_${process.env.DB_USER}:${process.env.DB_PASS}d@${process.env.DB_HOST}02:${PORT_DB}/dev_${process.env.DB_NAME}?${process.env.DB_AUTH}`;
    SERVER = 'DEVELOPMENT';
    break;
  case 'testing':
    PORT = 3050; //PUERTO DEL SERVIDOR EXPRESS PARA TESTING
    PORT_DB = PORT_DB + 20; // CASSINI03
    URI = `mongodb://tst_${process.env.DB_USER}:${process.env.DB_PASS}t@${process.env.DB_HOST}03:${PORT_DB}/tst_${process.env.DB_NAME}?${process.env.DB_AUTH}`;

    SERVER = 'TESTING';
    break;
}


(async () => {
  try {
    await mongo.connect(URI);
    logger.info(`Connection to ${SERVER} it's Ok`);
    await app.listen(PORT, () => {
      logger.debug(`Server of ${SERVER} is Running in: http://${SERVER}:${PORT}/api/${process.env.API_VER}/`);
    });
  } catch (error) {
    logger.error("Connection to BDD is Fail: ", error);
  }
})();