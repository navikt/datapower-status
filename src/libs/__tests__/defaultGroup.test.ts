import * as gcsconfig from '../getStorageConfig';
import { getAllGroups, getGroup, getGroupDomainComparison, clearJsonCache } from '../storage';
import { Bucket, File } from '@google-cloud/storage';

jest.mock('@google-cloud/storage');

describe('Virtual "default" group', () => {
  // dp-01 is in group "qa", dp-02 and dp-03 are ungrouped
  const statusData = JSON.stringify([
    { dpInstance: 'dp-01', State: 'active', Version: '1.0', MachineType: '5725', Domains: [{ domain: 'partner', mAdminState: 'enabled', version: '1.0.0' }], uptime: '1 day', bootuptime2: '1 day' },
    { dpInstance: 'dp-02', State: 'active', Version: '1.0', MachineType: '5725', Domains: [{ domain: 'partner', mAdminState: 'enabled', version: '2.0.0' }], uptime: '1 day', bootuptime2: '1 day' },
    { dpInstance: 'dp-03', State: 'active', Version: '1.0', MachineType: '5725', Domains: [{ domain: 'partner', mAdminState: 'enabled', version: '2.0.0' }], uptime: '1 day', bootuptime2: '1 day' },
  ]);
  const groupData = JSON.stringify({ qa: { hosts: ['dp-01'] } });

  let mockBucket: Bucket;
  let mockStatusFile: File;
  let mockGroupFile: File;

  beforeEach(() => {
    clearJsonCache();

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
        if (fileName === 'groupInfo.json') return mockGroupFile;
        return mockStatusFile;
      }),
    } as unknown as Bucket;

    jest.spyOn(gcsconfig, 'getBucket').mockResolvedValue(mockBucket);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllGroups', () => {
    it('always includes "default" as the first entry', async () => {
      const groups = await getAllGroups();
      expect(groups[0]).toBe('default');
    });

    it('includes real groups after "default"', async () => {
      const groups = await getAllGroups();
      expect(groups).toContain('qa');
    });

    it('returns ["default"] when no real groups exist', async () => {
      mockGroupFile = {
        download: jest.fn().mockResolvedValue('{}'),
        exists: jest.fn().mockResolvedValue([true]),
        save: jest.fn(),
      } as unknown as File;
      mockBucket = { file: jest.fn(() => mockGroupFile) } as unknown as Bucket;
      jest.spyOn(gcsconfig, 'getBucket').mockResolvedValue(mockBucket);
      clearJsonCache();

      const groups = await getAllGroups();
      expect(groups).toEqual(['default']);
    });
  });

  describe('getGroup("default")', () => {
    it('returns only ungrouped hosts', async () => {
      const result = await getGroup('default');
      expect(result).toBeDefined();
      const hostNames = result!.hosts.map((h) => h.dpInstance);
      expect(hostNames).toContain('dp-02');
      expect(hostNames).toContain('dp-03');
      expect(hostNames).not.toContain('dp-01');
    });

    it('returns group name "default"', async () => {
      const result = await getGroup('default');
      expect(result!.group).toBe('default');
    });

    it('returns empty hosts array when all hosts are in groups', async () => {
      const allGroupedData = JSON.stringify({ qa: { hosts: ['dp-01', 'dp-02', 'dp-03'] } });
      mockGroupFile = {
        download: jest.fn().mockResolvedValue(allGroupedData),
        exists: jest.fn().mockResolvedValue([true]),
        save: jest.fn(),
      } as unknown as File;
      mockBucket = {
        file: jest.fn((f: string) => f === 'groupInfo.json' ? mockGroupFile : mockStatusFile),
      } as unknown as Bucket;
      jest.spyOn(gcsconfig, 'getBucket').mockResolvedValue(mockBucket);
      clearJsonCache();

      const result = await getGroup('default');
      expect(result!.hosts).toHaveLength(0);
    });
  });

  describe('getGroupDomainComparison("default", domain)', () => {
    it('uses only ungrouped hosts for comparison', async () => {
      const result = await getGroupDomainComparison('default', 'partner');
      expect(result).toBeDefined();
      const comparedHosts = result!.hosts.map((h) => h.host);
      expect(comparedHosts).toContain('dp-02');
      expect(comparedHosts).toContain('dp-03');
      expect(comparedHosts).not.toContain('dp-01');
    });

    it('returns group "default" in the response', async () => {
      const result = await getGroupDomainComparison('default', 'partner');
      expect(result!.group).toBe('default');
    });
  });
});
