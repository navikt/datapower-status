
import * as gcsconfig from "../getStorageConfig"; 
import * as storage from "../storageUtil"
import { Storage, Bucket, File } from '@google-cloud/storage'; 

jest.mock('@google-cloud/storage');

const data = { 'testDomain': { versions: { 'dp-02': '2.0.1' } } }

describe("Test storage",() => {
    const mockBucketName:string = 'mock-bucket';
    
    let mockBucket: jest.Mocked<Bucket>;
    let mockFile: jest.Mocked<File>;
    let mockStorage: jest.Mocked<Storage>;
    
    beforeAll(() => {
        console.log("Test Storage beforeAll");

        mockFile = {
            exists: jest.fn().mockResolvedValue([true]),
            download: jest.fn().mockResolvedValue(data),
        } as unknown as jest.Mocked<File>;
        
        mockBucket = {
            file: jest.fn(() => mockFile),
            getFiles: jest.fn().mockImplementation(() => {
                const fileArray = [mockFile];
                return fileArray;
            })
        } as unknown as jest.Mocked<Bucket>;
        
        mockStorage = {
            bucket: jest.fn(() => mockBucket),
        } as unknown as jest.Mocked<Storage>;
        
        jest.spyOn(gcsconfig, 'getBucketName').mockReturnValue(mockBucketName);
        console.log('Mocked function getBucketName setup:');

        jest.spyOn(gcsconfig, 'getStorage').mockReturnValue(mockStorage);
        console.log('Mocked function getStorage setup:');

        jest.spyOn(gcsconfig, "getBucket").mockResolvedValue(mockBucket);
        console.log('Mocked function getBUcket setup:');
        
        console.log("Test Storage beforeAll finished setup");
    })

    afterEach(() => {
        jest.restoreAllMocks();
    });
        
    it("Check for downloadFile", async () => {
        const resultFile = await storage.downloadFile('test-file.txt');
        
        expect(mockBucket.file).toHaveBeenCalledWith('test-file.txt');
        expect(mockFile.exists).toHaveBeenCalled();

        expect(mockFile.download).toHaveBeenCalled();
        expect(resultFile).toEqual(data);

    });
});