import { Request, Response } from 'express';
import { setPaises, getAllCountries, getCountryById, updateCountry, deleteCountry } from '../../src/Controllers/Paises';
import Paises from '../../src/Models/paisesModel';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { CustomError } from '../../src/Library/Errors';
import { IMockResponse, IMockRequest, IMockCountry, IMockResponseObject } from '../Interfaces/IPaises';

jest.mock('../../src/Models/paisesModel');

describe('Paises Controller Tests', () => {
    let mockRequest: Partial<Request> & IMockRequest;
    let mockResponse: Response;
    let responseObject = {} as IMockResponseObject;

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockImplementation(function(result) {
          responseObject = result as IMockResponseObject;
          return this;
        }),
      } as unknown as Response;
    });

  describe('setPaises', () => {
    it('debería crear un nuevo país correctamente', async () => {
      mockRequest.body = [{
        iso_code: 'CHL',
        name_country: 'Chile',
        iata_code: 'SCL'
      }];

      const mockSavedCountry: IMockCountry = {
        _id: 'mockId',
        iso_code: 'CHL',
        name_country: 'Chile',
        iata_code: 'SCL'
    };

    (Paises.findOne as jest.Mock).mockResolvedValue(null as never);
    (Paises.prototype.save as jest.Mock).mockResolvedValue(mockSavedCountry as never);

      await setPaises(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        codigo: 201,
        data: [mockSavedCountry]
      });
    });

    it('debería manejar error cuando el país ya existe', async () => {
      mockRequest.body = [{
        iso_code: 'CHL',
        name_country: 'Chile',
        iata_code: 'SCL'
      }];

      (Paises.findOne as jest.Mock).mockResolvedValue({ _id: 'existingId' } as never);

      await setPaises(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(responseObject).toHaveProperty('error');
    });
  });
});