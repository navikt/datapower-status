import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../index';
import * as gcsconfig from '../../../../libs/getStorageConfig';
import { Bucket } from '@google-cloud/storage';

jest.mock('@google-cloud/storage');

describe('API domain Route', () => {
  const inputData = '{"testDomain":{"versions":{"dp-02":"2.0.1"}},"testDomain2":{"versions":{"dp-01":"2.0.1"}}}'
 
  beforeAll(() => {
    const mockBucket = {
      file: jest.fn(() => ({
        save: jest.fn(),
        download: jest.fn().mockResolvedValue(inputData),
        exists: jest.fn().mockResolvedValue([true]),
      })),
    } as unknown as Bucket;
    jest.spyOn(gcsconfig, "getBucket").mockResolvedValue(mockBucket);
  });

  it('POST returns status code 405, missing content-type application/json', async () => {
      const req = {
          method: "POST",
      } as NextApiRequest;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      } as unknown as NextApiResponse;

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method POST Not Allowed' });
  });

  it('GET returns status code 200', async () => {
    const req = {
        method: 'GET'
    } as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(["testDomain","testDomain2"]);
  });
});