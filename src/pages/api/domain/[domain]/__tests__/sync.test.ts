import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../sync';
import * as gcsconfig from '../../../../../libs/getStorageConfig';
import { Bucket, File } from '@google-cloud/storage';

jest.mock('@google-cloud/storage');

describe('API domain/[domain]/sync Route', () => {
  const inputData = '{"testDomain":{"versions":{"dp-01":"2.0.1","dp-02":"2.0.1"}},"testDomain2":{"versions":{"dp-01":"6.6.6"}}, "notinsyncDomain":{"versions":{"dp-01":"6.6.6","dp-02":"4.0.4"}}}'
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

    it('GET domain sync status multiple hosts deployed returns status code 200', async () => {
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
    expect(res.json).toHaveBeenCalledWith("testDomain is in sync");
  });

  it('GET domain sync status one hosts deployed returns status code 200', async () => {
    const req = {
        method: 'GET',
        query: {
          domain: 'testDomain2'
        },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith("testDomain2 is in sync");
  });

  it('GET domain sync status multiple host not in sync returns status code 200', async () => {
    const req = {
        method: 'GET',
        query: {
          domain: 'notinsyncDomain'
        },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith("notinsyncDomain is not in sync");
  });

  it('GET domain sync status multiple host not in sync returns status code 200', async () => {
    const req = {
        method: 'GET',
        query: {
          domain: 'wrongDomain'
        },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith("wrongDomain cannot find status");
  });

});