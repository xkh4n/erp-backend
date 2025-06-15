/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Validations file:');
logger.level = 'all';

import { validateRut } from '@fdograph/rut-utilities'; // Importar la librería para validar RUT

const IsUsername = (username: string) => {
    // Verificar si el valor no es una cadena
    if (typeof username !== 'string') {
      logger.error("The input is not a string");
      return false;
    }
    // Eliminar espacios en blanco al inicio y al final
    username = username.trim();
    const regex = /^[a-z]{1,20}$/;
    // Verificar si el valor no cumple con la expresión regular
    if (!regex.test(username)) {
      logger.error(`The input "${username}" is not a valid username`);
      return false;
    }
    return true;
};

const IsName = (name: string) => {
  // Verificar si el valor no es una cadena
  if (typeof name !== 'string') {
    logger.error("The input is not a string");
    return false;
  }
  // Eliminar espacios en blanco al inicio y al final
  name = name.trim();
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ-]+( [a-zA-ZÁÉÍÓÚáéíóúñÑ-]+)*$/;
  // Verificar si el valor no cumple con la expresión regular
  if (!regex.test(name)) {
    logger.error(`The input "${name}" is not a valid name`);
    return false;
  }
  return true;
};

const IsPassword = (password:string) => {
    // Expresión regular para validar contraseñas
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,;:!?'%$&#?¡@"()\[\]{}\-_*]).{8,}$/;
    // Verificar si el valor no es una cadena o no cumple con la expresión regular
    if (typeof password !== 'string' || !regex.test(password)) {
      logger.error("The input is not a valid password");
      return false;
    }
    return true;
};


const IsIata = (iata:string) => {
    const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9]{3}$/;
    if (typeof iata !== 'string' || !regex.test(iata)) {
      logger.error("The input is not a valid IATA code");
      return false;
    }
    return true;
};

const IsISO = (iata:string) => {
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9]{2}$/;
  if (typeof iata !== 'string' || !regex.test(iata)) {
    logger.error("The input is not a valid ISO code");
    return false;
  }
  return true;
};

const IsEmail = (email:string) => {
  // Expresión regular para validar un correo electrónico
  const regex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
  // Verificar si el valor no es una cadena o no cumple con la expresión regular
  logger.debug(`Validating phone number: ${regex.test(email)}`);
  if (typeof email !== 'string' || !regex.test(email)) {
    console.warn("The input is not a valid E-Mail");
    return false;
  }
  return true;
};

const IsParagraph = (paragraph: string) => {
  // Verificar si el valor no es una cadena
  if (typeof paragraph !== 'string') {
      console.warn("The input is not a string");
      return false;
  }
  // Eliminar espacios en blanco al inicio y al final
  paragraph = paragraph.trim();
  // Expresión regular mejorada para validar párrafos
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9\s.,;:!?'"()\[\]{}\-_*\/&@#%^~|\\+=™°®©]{1,}$/;  
  // Verificar si el valor no cumple con la expresión regular
  if (!regex.test(paragraph)) {
      console.warn(`The input "${paragraph}" is not a valid paragraph`);
      return false;
  }
  return true;
};

const IsDecimal = (decimal:number) => {
    // Expresión regular para validar números decimales
    const regex = /^-?\d+(\,\d+)?$/;
    // Verificar si el valor no es una cadena o no cumple con la expresión regular
    if (typeof decimal !== 'string' || !regex.test(decimal)) {
        logger.error("The input is not a valid decimal number");
        return false;
    }
    return true;
}

const IsPhone = (phone:string) => {
    // Verificar si el valor no es una cadena
    if (typeof phone !== 'string') {
        console.warn("The input is not a string");
        return false;
    }
    // Eliminar espacios en blanco al inicio y al final (opcional, pero recomendado)
    phone = phone.trim();
    // Expresión regular para validar números de teléfono
    const regex = /^(\+?56\s?\d{1,2}|\(56\s?\d{1,2}\))\s?\d{4,5}\s?\d{4}$|^\d{7,11}$/;
    // Verificar si el valor no cumple con la expresión regular
    if (!regex.test(phone)) {
        console.warn(`The input "${phone}" is not a valid phone number`);
        return false;
    }
    return true;
}

const IsId = (id:string) => {
    // Verificar si el valor no es una cadena
    const regex = /^[a-z0-9]{10,30}$/;
    if (typeof id!=='string') {
        logger.error("The input is not a string");
        return false;
    }
    if (!regex.test(id)) {
      logger.error(`The input "${id}" is not a valid ID`);
      return false;
    }
    return true;
}

const IsPostal = (postal:string) => {
  const regex = /^[0-9]{7,10}$/;
  if (typeof postal !== 'number' || !regex.test(postal)) {
    logger.error("The input is not a valid postal code");
    return false;
  }
  return true;
}

const IsTerritorial = (code: string) => {
  const regex = /^[a-zA-Z0-9]{3,5}$/;
  if (typeof code !== 'string' || !regex.test(code)) {
    logger.error("The input is not a valid territorial code");
    return false;
  }
  return true;
}

const IsSii = (code: string) => {
  const regex = /^[0-9]{4,7}$/;
  if (typeof code !== 'number' || !regex.test(code)) {
    logger.error("The input is not a valid SII code");
    return false;
  }
  return true;
}

const IsCodGerencia = (number: string) => {
  const regex = /^[0-9]{2}$/;
  if (typeof number !== 'number' || !regex.test(number)) {
    logger.error("The input is not a valid Number Range");
    return false;
  }
  return true;
}

const IsProceso = (proceso: string) => {
  const regex = /^[a-zA-Z0-9]{8}$/;
  if (typeof proceso !== 'string' || !regex.test(proceso)) {
    logger.error("The input is not a valid Cod Process");
    return false;
  }
  return true;
}

const IsBoolean = (value: any): boolean => {
  // Si es un booleano nativo
  if (typeof value === 'boolean') {
      return true;
  }
  
  // Si es un número
  if (typeof value === 'number') {
      return value === 0 || value === 1;
  }
  
  // Si es una cadena
  if (typeof value === 'string') {
      const normalizedValue = value.toLowerCase().trim();
      return ['true', 'false', '1', '0'].includes(normalizedValue);
  }
  
  // Si no es ninguno de los tipos anteriores
  console.error("El valor no es un booleano válido");
  return false;
};

const IsNameDepto = (name: string) => {
  // Verificar si el valor no es una cadena
  if (typeof name !== 'string') {
    logger.error("The input is not a string");
    return false;
  }
  // Eliminar espacios en blanco al inicio y al final
  name = name.trim();
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9(),.\-]+( [a-zA-ZÁÉÍÓÚáéíóúñÑ0-9(),.\-]+)*$/;
  // Verificar si el valor no cumple con la expresión regular
  if (!regex.test(name)) {
    logger.error(`The input "${name}" is not a valid name`);
    return false;
  }
  return true;
};

const IsRut = (rut: string) => {
    // Verificar si el valor no es una cadena
    if (typeof rut !== 'string') {
        console.warn("The input is not a string");
        return false;
    }
    const newRut = rut.replace(".","");
    const isValid = validateRut(newRut);
    if (isValid) {
        return true;
    }else{
        console.warn(`The input "${rut}" is not a valid RUT`);
        return false;
    }
}

const IsCodTipo = (codTipo: string) => {
    // Verificar si el valor no es una cadena
    if (typeof codTipo !== 'string') {
        logger.error("The input is not a string");
        return false;
    }
    // Expresión regular para validar el código de tipo
    const regex = /^[A-Z0-9]{5}$/;
    // Verificar si el valor no cumple con la expresión regular
    if (!regex.test(codTipo)) {
        logger.error(`The input "${codTipo}" is not a valid codTipo`);
        return false;
    }
    return true;
}

export{
    IsUsername,
    IsPassword,
    IsIata,
    IsEmail,
    IsParagraph,
    IsDecimal,
    IsPhone,
    IsISO,
    IsName,
    IsId,
    IsPostal,
    IsTerritorial,
    IsSii,
    IsCodGerencia,
    IsProceso,
    IsBoolean,
    IsNameDepto,
    IsRut,
    IsCodTipo,
}