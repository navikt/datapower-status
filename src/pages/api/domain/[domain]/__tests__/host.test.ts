import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[host]';
import * as gcsconfig from '../../../../../libs/getStorageConfig';
import { Storage, Bucket, File } from '@google-cloud/storage';
import { createAuth } from '../../../../../libs/testUtils/testHelper';

jest.mock('@google-cloud/storage');

describe('API domain/[domain]/[host] Route', () => {
  const inputData: string = '{"testDomain":{"versions":{"dp-01":"2.0.1","dp-02":"2.0.1"}},"testDomain2":{"versions":{"dp-01":"6.6.6"}}}';
  const mockBucketName: string = "mockBucket";
  let mockBucket: jest.Mocked<Bucket>;
  let mockFile: jest.Mocked<File>;
  let mockStorage: jest.Mocked<Storage>;

  beforeAll(() => {
    mockFile = {
        save: jest.fn(),
        download: jest.fn().mockResolvedValue(inputData),
        exists: jest.fn().mockResolvedValue([true]),
    } as unknown as jest.Mocked<File>;

    mockBucket = {
      file: jest.fn(() => mockFile),
    } as unknown as jest.Mocked<Bucket>;

    mockStorage = {
      bucket: jest.fn(() => mockBucket),
  } as unknown as jest.Mocked<Storage>;

    jest.spyOn(gcsconfig, "getBucketName").mockReturnValue(mockBucketName);
    jest.spyOn(gcsconfig, 'getStorage').mockReturnValue(mockStorage);
    jest.spyOn(gcsconfig, "getBucket").mockResolvedValue(mockBucket);
  });

  it('GET one domain and one host returns status code 200', async () => {
    const req = {
        method: 'GET',
        query: {
          domain: 'testDomain',
          host: 'dp-02'
        },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith("2.0.1");
  });

  it('GET one domain and one host not found returns status code 404', async () => {
    const req = {
        method: 'GET',
        query: {
          domain: 'wrongDomain',
          host: 'wronHost'
        },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({"error": "Domain or host not exist"});
  });

  it('POST one domain with host returns status code 201', async () => {
    const req = {
        method: 'POST',
        query: {
          domain: 'testDomain',
          host: 'dp-02'
        },
        headers: {
            "authorization": createAuth()
        },
        body: "4.0.4"
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("4.0.4");
    expect(mockFile.save).toHaveBeenCalled();
  });

  it("POST one domain with host and return status code 401 Not Authorized", async () =>{
    const req = {
      method: 'POST',
      query: {
        domain: 'testDomain',
        host: 'dp-02'
      },
      body: "4.0.4"
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
  });

  it('DELETE one host from domain returns status code 204', async () => {
    const req = {
        method: 'DELETE',
        query: {
          domain: 'testDomain',
          host: 'dp-02'
        },
        headers: {
            "authorization": createAuth()
        }
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith(JSON.parse('{"success": "dp-02 deleted"}'));
    expect(mockFile.save).toHaveBeenCalled();
  });

  it("DELETE domain and return status code 401 Not Authorized", async () =>{
    const req = {
      method: 'DELETE',
      query: {
        domain: 'testDomain',
        host: 'dp-02'
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
});