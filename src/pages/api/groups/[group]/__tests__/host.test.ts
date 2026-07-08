import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[host]';
import * as gcsconfig from '../../../../../libs/getStorageConfig';
import { Bucket, File } from '@google-cloud/storage';
import { createAuth } from '../../../../../libs/testUtils/testHelper';
import { clearJsonCache } from '../../../../../libs/storage';

jest.mock('@google-cloud/storage');

describe('API groups/[group]/[host] Route', () => {
  const statusData = '[{"dpInstance":"qa-01","State":"active","Version":"1.0","MachineType":"5725","Domains":[{"domain":"partner","mAdminState":"enabled"}],"uptime":"1 day","bootuptime2":"1 day"}]';
  const groupData = '{"qa-sbs":{"hosts":["qa-01"]}}';
  let mockBucket: Bucket;
  let mockStatusFile: File;
  let mockGroupFile: File;

  beforeEach(() => clearJsonCache());

  beforeAll(() => {
    mockStatusFile = {
      save: jest.fn(),
      download: jest.fn().mockResolvedValue(statusData),
      exists: jest.fn().mockResolvedValue([true]),
    } as unknown as File;

    mockGroupFile = {
      save: jest.fn(),
      download: jest.fn().mockResolvedValue(groupData),
      exists: jest.fn().mockResolvedValue([true]),
    } as unknown as File;

    mockBucket = {
      file: jest.fn((fileName: string) => {
        if (fileName === 'groupInfo.json') {
          return mockGroupFile;
        }

        return mockStatusFile;
      }),
    } as unknown as Bucket;

    jest.spyOn(gcsconfig, 'getBucket').mockResolvedValue(mockBucket);
  });

  it('GET returns host metadata for a group host', async () => {
    const req = {
      method: 'GET',
      query: {
        group: 'qa-sbs',
        host: 'qa-01',
      },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      hostName: 'qa-01',
      dpInstance: 'qa-01',
      Version: '1.0',
      State: 'active',
      uptime: '1 day',
      bootuptime2: '1 day',
      MachineType: '5725',
      Domains: [{ domain: 'partner', mAdminState: 'enabled' }],
    });
  });

  it('POST adds a host to a group (membership only)', async () => {
    const req = {
      method: 'POST',
      query: {
        group: 'qa-sbs',
        host: 'qa-01',
      },
      headers: {
        authorization: createAuth(),
      },
      body: {},
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: 'qa-01 added to qa-sbs' });
    expect(mockGroupFile.save).toHaveBeenCalled();
    // Host metadata should NOT be saved — status file must not be touched
    expect(mockStatusFile.save).not.toHaveBeenCalled();
  });

  it('POST returns 401 when not authorized', async () => {
    const req = {
      method: 'POST',
      query: {
        group: 'qa-sbs',
        host: 'qa-01',
      },
      body: {},
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('DELETE returns 401 when not authorized', async () => {
    const req = {
      method: 'DELETE',
      query: {
        group: 'qa-sbs',
        host: 'qa-01',
      },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
