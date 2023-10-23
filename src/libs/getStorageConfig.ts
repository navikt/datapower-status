import { Bucket, Storage } from '@google-cloud/storage'
const inDevelopment = process.env.NODE_ENV === 'development'

/* istanbul ignore next */
export function getBucketName(): string {
    const bucketName = process.env.BUCKET_NAME;
    if (bucketName) {
        console.log('getBucketName called ' +  bucketName)
        return bucketName as string

    }
    console.log("BUCKET_NAME not defined");
    process.exit(-1)
}

/* istanbul ignore next */
export function getStorage(): Storage {
    console.log(`inDevelopment: ${inDevelopment}`)
    if (inDevelopment) {
        return new Storage({
            apiEndpoint: 'http://localhost:4443',
            projectId: process.env.GCP_TEAM_PROJECT_ID
        });
    } else {
        console.log("SHould return new Storage Object")
        return new Storage({ projectId: process.env.GCP_TEAM_PROJECT_ID });
    }
}

/* istanbul ignore next */
function createBucket(storage: Storage) {
    if (!inDevelopment) {
        throw Error("Bucket not exist and we cannot automaticly create it in GCP")
    }
    storage.createBucket(getBucketName());
    console.log("Bucket created");
}

/* istanbul ignore next */
export async function getBucket() {
    const bucketName = getBucketName();
    console.log("after getBucketName " + bucketName);
    const storage = getStorage();

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