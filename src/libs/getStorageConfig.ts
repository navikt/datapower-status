import { Bucket, Storage } from '@google-cloud/storage'
const inDevelopment = process.env.NODE_ENV === 'development'

function getBucketName() {
    const bucketName = process.env.BUCKET_NAME;
    if (bucketName) {
        return bucketName as string

    }
    console.log("BUCKET_NAME not defined");
    process.exit(-1)
}

function getStorage() {
    console.log(`inDevelopment: ${inDevelopment}`)
    if (inDevelopment) {
        return new Storage({
            apiEndpoint: 'http://localhost:4443',
            projectId: process.env.GCP_TEAM_PROJECT_ID
        });
    } else {
        return new Storage({ projectId: process.env.GCP_TEAM_PROJECT_ID });
    }
};

function createBucket(storage: Storage) {
    if (!inDevelopment) {
        throw Error("Bucket not exist and we cannot automaticly create it in GCP")
    }
    storage.createBucket(getBucketName());
    console.log("Bucket created");
}

export async function getBucket() {
    const storage = getStorage();
    const bucketName = getBucketName();

    if (inDevelopment) {
        const [buckets] = await storage.getBuckets();
        const foundBucket = buckets.find(({ name }) => name === bucketName);
        if (!foundBucket) {
            createBucket(storage);
        }
    }
    const bucket: Bucket = storage.bucket(bucketName);
    return bucket;
}