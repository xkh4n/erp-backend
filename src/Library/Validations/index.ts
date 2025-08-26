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
    const regex = /^[a-z_.0-9]{1,20}$/;
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
  //logger.debug(`Validating Email: ${regex.test(email)}`);
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
  const regex = /^[a-zA-Z0-9]{5,8}$/;
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
    const regex = /^[A-Z0-9]{6}$/;
    // Verificar si el valor no cumple con la expresión regular
    if (!regex.test(codTipo)) {
        logger.error(`The input "${codTipo}" is not a valid codTipo`);
        return false;
    }
    return true;
}

const IsNumero = (numero: any) => {
  // Verificar si el valor es null o undefined
  if (numero === null || numero === undefined) {
    logger.error("The input is null or undefined");
    return false;
  }
  
  // Convertir a string si es número
  const numeroStr = typeof numero === 'number' ? numero.toString() : numero;
  
  // Verificar si no es una cadena después de la conversión
  if (typeof numeroStr !== 'string') {
    logger.error("The input cannot be converted to string");
    return false;
  }
  
  // Expresión regular para validar números enteros positivos
  const regex = /^[0-9]+$/;
  
  // Verificar si el valor no cumple con la expresión regular
  if (!regex.test(numeroStr)) {
    logger.error(`The input "${numeroStr}" is not a valid number`);
    return false;
  }
  
  // Verificar que sea un número válido y no sea NaN
  const parsedNumber = parseInt(numeroStr, 10);
  if (isNaN(parsedNumber)) {
    logger.error(`The input "${numeroStr}" cannot be parsed as a number`);
    return false;
  }
  
  return true;
};

const IsCodVista = (codVista: string) => {
  // Verificar si el valor no es una cadena
  if (typeof codVista !== 'string') {
    logger.error("The input is not a string");
    return false;
  }
  // Expresión regular para validar el código de vista: PROC seguido de dígitos
  // PROC + hasta 12 dígitos (ejemplo: PROC00115131214)
  const regex = /^PROC\d{4,12}$/;
  // Verificar si el valor no cumple con la expresión regular
  if (!regex.test(codVista)) {
    logger.error(`The input "${codVista}" is not a valid codVista. Expected format: PROC + 4-12 digits`);
    return false;
  }
  
  return true;
};

const IsCodigoSolicitud = (codigo: string | number) => {
  // Convertir a string si es número
  const codigoStr = typeof codigo === 'number' ? codigo.toString() : codigo;
  
  // Verificar si el valor no es una cadena después de la conversión
  if (typeof codigoStr !== 'string') {
    logger.error("The input cannot be converted to string");
    return false;
  }
  
  // Verificar que tenga exactamente 17 dígitos
  const regex = /^\d{17}$/;
  if (!regex.test(codigoStr)) {
    logger.error(`The input "${codigoStr}" is not a valid codigoSolicitud. Expected format: 17 digits (YYYYMMDDHHMMSSMMM)`);
    return false;
  }
  
  // Convertir a BigInt para evitar pérdida de precisión con números grandes
  let codigoNum: bigint;
  try {
    codigoNum = BigInt(codigoStr);
  } catch (error) {
    logger.error(`The input "${codigoStr}" cannot be converted to a valid BigInt: ${error}`);
    return false;
  }
  
  // Validar que esté en el rango válido usando BigInt
  // 01/01/2000 00:00:00.000 = 20000101000000000
  // 31/12/3000 23:59:59.999 = 30001231235959999
  const minValue = BigInt("20000101000000000");
  const maxValue = BigInt("30001231235959999");
  
  if (codigoNum < minValue || codigoNum > maxValue) {
    logger.error(`Invalid codigoSolicitud: ${codigoNum}. Must be between ${minValue} (01/01/2000 00:00:00.000) and ${maxValue} (31/12/3000 23:59:59.999)`);
    return false;
  }
  
  return true;
};

const IsObjectId = (id: string) => {
  // Verificar si el valor no es una cadena
  if (typeof id !== 'string') {
    logger.error("The input is not a string");
    return false;
  }
  
  // Verificar que tenga exactamente 24 caracteres hexadecimales (formato de ObjectId de MongoDB)
  const regex = /^[a-fA-F0-9]{24}$/;
  if (!regex.test(id)) {
    logger.error(`The input "${id}" is not a valid ObjectId. Expected format: 24 hexadecimal characters`);
    return false;
  }
  
  return true;
};

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
    IsNumero,
    IsCodVista,
    IsCodigoSolicitud,
    IsObjectId
}