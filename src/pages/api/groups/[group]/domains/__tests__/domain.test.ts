import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[domain]';
import * as gcsconfig from '../../../../../../libs/getStorageConfig';
import { Bucket, File } from '@google-cloud/storage';
import { clearJsonCache } from '../../../../../../libs/storage';

jest.mock('@google-cloud/storage');

describe('API groups/[group]/domains Route', () => {
  const statusData = '[{"dpInstance":"qa-01","State":"active","Version":"1.0","MachineType":"5725","Domains":[{"domain":"partner","mAdminState":"enabled","version":"1.0.0"}],"uptime":"1 day","bootuptime2":"1 day"},{"dpInstance":"qa-02","State":"active","Version":"1.0","MachineType":"5725","Domains":[{"domain":"partner","mAdminState":"enabled","version":"2.0.0"}],"uptime":"1 day","bootuptime2":"1 day"}]';
  const groupData = '{"qa-sbs":{"hosts":["qa-01","qa-02"]}}';
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

  it('GET returns per-host comparison payload', async () => {
    const req = {
      method: 'GET',
      query: {
        group: 'qa-sbs',
        domain: 'partner',
      },
    } as unknown as NextApiRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      group: 'qa-sbs',
      domain: 'partner',
      referenceVersion: '2.0.0',
      uniqueVersions: ['1.0.0', '2.0.0'],
      isSynced: false,
      hosts: [
        { host: 'qa-01', version: '1.0.0', status: 'different' },
        { host: 'qa-02', version: '2.0.0', status: 'match' },
      ],
    });
  });
});
