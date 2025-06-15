import type { jest } from '@jest/globals';

export interface IMockResponse {
    status: jest.Mock;
    json: jest.Mock;
}
  
export interface IMockRequest {
    body?: any;
    params?: any;
    query?: any;
}
  
export interface IMockCountry {
    _id?: string;
    iso_code: string;
    name_country: string;
    iata_code: string;
}
  
export interface IMockResponseObject {
    codigo?: number;
    data?: IMockCountry[];
    error?: string;
}