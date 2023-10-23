import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../index';
import * as gcsconfig from '../../../../../libs/getStorageConfig';
import { Bucket, File } from '@google-cloud/storage';

jest.mock('@google-cloud/storage');

describe('API domain/[domain] Route', () => {
  const inputData = '{"testDomain":{"versions":{"dp-01":"2.0.1","dp-02":"2.0.1"}},"testDomain2":{"versions":{"dp-01":"6.6.6"}}}'
  let mockBucket: Bucket;
  let mockFile: File;
  beforeAll(() => {
    mockFile = {
        save: jest.fn(),
        download: jest.fn().mockResolvedValue(inputData),
        exists: jest.fn().mockResolvedValue([true]),
    } as unknown as File;

    mockBucket = {
      file: jest.fn(() => mockFile),
    } as unknown as Bucket;
    jest.spyOn(gcsconfig, "getBucket").mockResolvedValue(mockBucket);
  });

  it('GET one domain returns status code 200', async () => {
    const req = {
        method: 'GET',
        query: {
          domain: 'testDomain'
        },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(JSON.parse('{"dp-01": "2.0.1","dp-02": "2.0.1"}'));
  });

  it('GET one domain returns status code 404', async () => {
    const req = {
        method: 'GET',
        query: {
          domain: 'notExistingDomain'
        },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Domain not found' });
  });

  it("DELETE domain and return status code 401 Not Authorized", async () =>{
    const req = {
      method: 'DELETE',
      query: {
        domain: 'testDomain'
      },

    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
  });

it("DELETE domain and return status code 204", async () =>{
    const req = {
      method: 'DELETE',
      headers: {
        "authorization": "Basic ZHB1c2VyOnRlc3Q="
      },
      query: {
        domain: 'testDomain'
      },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith(JSON.parse('{"success": "testDomain deleted"}'));
    expect(mockFile.save).toHaveBeenCalled();
  });

it("DELETE domain failed and return status code 400", async () =>{
    const req = {
      method: 'DELETE',
      headers: {
        "authorization": "Basic ZHB1c2VyOnRlc3Q="
      },
      query: {
        domain: 'failedDomain'
      },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(JSON.parse('{"error": "failedDomain failed to delete"}'));
  });


});