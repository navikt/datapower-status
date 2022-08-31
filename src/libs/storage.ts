
import { getBucket } from './getStorageConfig'

const filename = "statusInfo.json";
const bucket = getBucket();

async function fileExists(fileName: string) {
    const exist = (await (await bucket).file(fileName).exists());
    return exist
}

export async function uploadStatusFile(content: string) {
    console.log("Upload file");
    (await bucket)
        .file(filename)
        .save(content);
    console.log(`${filename} uploaded with contents`)
}

export async function getStatusFileContent() {
    console.log("getStatusFileContent");

    if (await fileExists(filename)) {
        const content = await (await bucket).file(filename).download();
        if (content) {
            return content.toString();
        }
    }
    return ""
}

