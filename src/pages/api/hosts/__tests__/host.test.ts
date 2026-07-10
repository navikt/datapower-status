import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[host]';
import * as gcsconfig from '../../../../libs/getStorageConfig';
import { Bucket, File } from '@google-cloud/storage';
import { createAuth } from '../../../../libs/testUtils/testHelper';
import { clearJsonCache } from '../../../../libs/storage';

jest.mock('@google-cloud/storage');

describe('API hosts/[host] Route', () => {
  const hostBody = {
    dpInstance: 'dp-01',
    State: 'active',
    Version: '3.0.0',
    MachineType: '5725',
    Domains: [{ domain: 'partner', mAdminState: 'enabled' }],
    uptime: '2 days',
    bootuptime2: '2 days',
  };
  const statusData = JSON.stringify([hostBody]);

  let mockBucket: Bucket;
  let mockStatusFile: File;

  beforeEach(() => clearJsonCache());

  beforeAll(() => {
    mockStatusFile = {
      save: jest.fn(),
      download: jest.fn().mockResolvedValue(statusData),
      exists: jest.fn().mockResolvedValue([true]),
    } as unknown as File;

    mockBucket = {
      file: jest.fn(() => mockStatusFile),
    } as unknown as Bucket;

    jest.spyOn(gcsconfig, 'getBucket').mockResolvedValue(mockBucket);
  });

  it('GET returns host metadata', async () => {
    const req = {
      method: 'GET',
      query: { host: 'dp-01' },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ dpInstance: 'dp-01' }));
  });

  it('GET returns 404 for unknown host', async () => {
    const req = {
      method: 'GET',
      query: { host: 'unknown' },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Host not found' });
  });

  it('POST saves host metadata without touching group membership', async () => {
    const req = {
      method: 'POST',
      query: { host: 'dp-01' },
      headers: { authorization: createAuth() },
      body: hostBody,
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(hostBody);
    expect(mockStatusFile.save).toHaveBeenCalled();
  });

  it('POST returns 400 when dpInstance does not match host path', async () => {
    const req = {
      method: 'POST',
      query: { host: 'different-host' },
      headers: { authorization: createAuth() },
      body: hostBody,
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Host name does not match dpInstance' });
  });

  it('POST returns 400 when body is invalid', async () => {
    const req = {
      method: 'POST',
      query: { host: 'dp-01' },
      headers: { authorization: createAuth() },
      body: { dpInstance: 'dp-01' }, // missing required fields
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Validating input failed' });
  });

  it('POST returns 401 when not authorized', async () => {
    const req = {
      method: 'POST',
      query: { host: 'dp-01' },
      body: hostBody,
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
  });
});
