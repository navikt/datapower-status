import { Bucket, Storage } from '@google-cloud/storage';

const inDevelopment = process.env.NODE_ENV === 'development';
const filename = "statusInfo.json";

function getBucketName() {
    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
        console.log("BUCKET_NAME not defined");

    }
    return bucketName as string

}

async function initBucket() {
    if (inDevelopment) {
        const storage = getStorage();
        const [buckets] = await storage.getBuckets();
        const bucketName = getBucketName();

        const foundBucket = buckets.find(({ name }) => name === bucketName);
        if (foundBucket) {
            console.log(`Bucket "${bucketName}" found!`);
            return;
        }

        console.log(`Bucket "${bucketName}" created!`);
    }
}

function getStorage() {
    console.debug(`inDevelopment: ${inDevelopment}`)
    if (inDevelopment) {
        return new Storage({
            apiEndpoint: 'http://localhost:4443',
            projectId: process.env.GCP_TEAM_PROJECT_ID
        });
    } else {
        return new Storage({ projectId: process.env.GCP_TEAM_PROJECT_ID })
        /*            credentials: {
                        client_email: process.env.CLIENT_EMAIL,
                        private_key: process.env.PRIVATE_KEY,
                    },*/
        /*}); */
        //return new Storage();
    }
};

function createBucket(storage: Storage) {
    if (!inDevelopment) {
        throw Error("Bucket not exist and we cannot automaticly create it in GCP")
    }
    storage.createBucket(getBucketName());
    console.log("Bucket created");
}

async function getBucket() {
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


export async function uploadStatusFile(content: string) {
    console.log("Upload file");
    const bucket = getBucket();
    const response = (await bucket)
        .file(filename)
        .save(content);
    console.log(`${filename} uploaded with contents`)
}


export async function getStatusFileContent() {
    console.debug("getStatusFileContent");
    const content = (await getBucket())
        .file(filename)
        .download();
    return content;
}

