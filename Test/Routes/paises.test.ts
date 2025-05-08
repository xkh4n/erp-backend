import request from 'supertest';
import express from 'express';
import paises from '../../src/Routes/Paises';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

const app = express();
app.use(express.json());
app.use('/api/1.0/', paises);

describe('Paises Routes Tests', () => {
  it('debería manejar la ruta POST /pais/todos', async () => {
    const response = await request(app)
      .post('pais/todos');
    
    expect(response.status).toBe(200);
  });

  it('debería manejar la ruta PUT /pais/nuevo', async () => {
    const newCountry = {
      iso_code: 'CHL',
      name_country: 'Chile',
      iata_code: 'SCL'
    };

    const response = await request(app)
      .put('pais/nuevo')
      .send(newCountry);
    
    expect(response.status).toBe(201);
  });
});