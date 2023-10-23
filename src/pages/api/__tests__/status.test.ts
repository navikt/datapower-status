import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../status';
import * as gcsconfig from '../../../libs/getStorageConfig';
import { Bucket, File } from '@google-cloud/storage';
import { createAuth } from '../../../libs/testUtils/testHelper';

jest.mock('@google-cloud/storage');

describe('API Status Route', () => {
    const inputData:string  = '[{"dpInstance": "hostname.example.com","State": "active","Version": "IDG.10.0.1.4","MachineType": "5725","Domains": [{"domain": "default", "mAdminState": "enabled"}],"uptime": "29 days 00:54:21","bootuptime2": "29 days 00:54:40"}]';

    beforeEach(() => {
        const mockBucket = {
            file: jest.fn(() => ({
              save: jest.fn(),
              download: jest.fn().mockResolvedValue(inputData),
              exists: jest.fn().mockResolvedValue([true]),
            })),
        } as unknown as Bucket;
        jest.spyOn(gcsconfig, "getBucket").mockResolvedValue(mockBucket);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    it('POST returns status code 415, missing content-type application/json', async () => {
        const req = {
            method: "POST",
            headers: {
                "content-type": "text/plain"
            },
        } as NextApiRequest;
        const res = {status: jest.fn().mockReturnThis() , json: jest.fn()} as unknown as NextApiResponse;

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(415);
        expect(res.json).toHaveBeenCalledWith({ error: 'Content-Type: application/json must be set' });
    });

    it('POST returns status code 401, not authorized', async () => {
        const req = {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
        } as NextApiRequest;
        const res = {status: jest.fn().mockReturnThis() , json: jest.fn()} as unknown as NextApiResponse;

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
    });

    it('POST returns status code 401, not authorized wrong user', async () => {
        const req = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": createAuth("wrong")
            },
        } as NextApiRequest;
        const res = {status: jest.fn().mockReturnThis() , json: jest.fn()} as unknown as NextApiResponse;

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
    });

    it('POST returns status code 400, incomplete json', async () => {
        const req = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": createAuth()
            },
            body: [{"hostname": "mismatch", "Domains":[{"domain": "failure"}]}]
        } as NextApiRequest;
        const res = {status: jest.fn().mockReturnThis(), json: jest.fn()} as unknown as NextApiResponse;

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('POST returns status code 200 and saveFile is true', async () => {
        const req = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": createAuth()
            },
            body: JSON.parse(inputData)
        } as NextApiRequest;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as NextApiResponse;

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        //console.log(res.json)
        expect(res.json).toHaveBeenCalledWith(JSON.parse(inputData));
    });

    it('POST returns status code 200 and saveFile is true when no existing content', async () => {
        const mockFile = {
            save: jest.fn(),
            //download: jest.fn().mockResolvedValue(inputData),
            //exists: jest.fn().mockResolvedValue([false]),
        } as unknown as File;
        const mockBucket = {
            file: jest.fn(() => mockFile),
        } as unknown as Bucket;
        jest.spyOn(gcsconfig, "getBucket").mockResolvedValue(mockBucket);

        const req = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": createAuth()
            },
            body: JSON.parse(inputData)
        } as NextApiRequest;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as NextApiResponse;

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(JSON.parse(inputData));
        //expect(mockFile.exists).toHaveBeenCalled();
        expect(mockFile.save).toHaveBeenCalled();
        //console.log(res.json)
    });

    it('GET returns status code 200 and JSON content', async () => {

        const req = {
            method: 'GET'
        } as NextApiRequest;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as NextApiResponse;

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(JSON.parse(inputData));
    });
});