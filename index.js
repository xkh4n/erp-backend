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
    SERVER = 'PRODUCTION';
    break;
  case 'development':
    SERVER = 'DEVELOPMENT';
    break;
  case 'testing':

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