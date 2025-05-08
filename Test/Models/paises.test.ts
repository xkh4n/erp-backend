import mongoose from 'mongoose';
import Paises from '../../src/Models/paisesModel';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

describe('Paises Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('debería crear y guardar un país correctamente', async () => {
    const validPais = {
      iso_code: 'CHL',
      name_country: 'Chile',
      iata_code: 'SCL'
    };

    const savedPais = await Paises.create(validPais);
    expect(savedPais._id).toBeDefined();
    expect(savedPais.iso_code).toBe(validPais.iso_code);
    expect(savedPais.name_country).toBe(validPais.name_country);
    expect(savedPais.iata_code).toBe(validPais.iata_code);
  });

  it('debería fallar al crear un país sin campos requeridos', async () => {
    const paisSinCampos = {};
    let err;
    try {
      await Paises.create(paisSinCampos);
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});