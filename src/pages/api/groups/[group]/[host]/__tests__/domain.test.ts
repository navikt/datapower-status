import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[domain]';
import * as gcsconfig from '../../../../../../libs/getStorageConfig';
import { Bucket, File } from '@google-cloud/storage';
import { createAuth } from '../../../../../../libs/testUtils/testHelper';
import { clearJsonCache } from '../../../../../../libs/storage';

jest.mock('@google-cloud/storage');

describe('API groups/[group]/[host]/[domain] Route', () => {
  const groupData = '{"qa-sbs":{"hosts":["qa-01"]}}';
  const domainData = '{"partner":{"versions":{}}}';
  let mockBucket: Bucket;
  let mockGroupFile: File;
  let mockDomainFile: File;

  beforeEach(() => clearJsonCache());

  beforeAll(() => {
    mockGroupFile = {
      save: jest.fn(),
      download: jest.fn().mockResolvedValue(groupData),
      exists: jest.fn().mockResolvedValue([true]),
    } as unknown as File;

    mockDomainFile = {
      save: jest.fn(),
      download: jest.fn().mockResolvedValue(domainData),
      exists: jest.fn().mockResolvedValue([true]),
    } as unknown as File;

    mockBucket = {
      file: jest.fn((fileName: string) => fileName === 'groupInfo.json' ? mockGroupFile : mockDomainFile),
    } as unknown as Bucket;

    jest.spyOn(gcsconfig, 'getBucket').mockResolvedValue(mockBucket);
  });

  it('POST stores a version for a host in a group without touching group membership', async () => {
    const req = {
      method: 'POST',
      query: {
        group: 'qa-sbs',
        host: 'qa-01',
        domain: 'partner',
      },
      headers: {
        authorization: createAuth(),
      },
      body: '2.0.1',
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith('2.0.1');
    // Domain version should be saved
    expect(mockDomainFile.save).toHaveBeenCalled();
    // Group membership must NOT be modified
    expect(mockGroupFile.save).not.toHaveBeenCalled();
  });

  it('POST returns 400 when host is not in group', async () => {
    const req = {
      method: 'POST',
      query: {
        group: 'qa-sbs',
        host: 'unknown-host',
        domain: 'partner',
      },
      headers: {
        authorization: createAuth(),
      },
      body: '2.0.1',
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'unknown-host is not part of qa-sbs' });
  });

  it('POST returns 401 when not authorized', async () => {
    const req = {
      method: 'POST',
      query: {
        group: 'qa-sbs',
        host: 'qa-01',
        domain: 'partner',
      },
      body: '2.0.1',
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
