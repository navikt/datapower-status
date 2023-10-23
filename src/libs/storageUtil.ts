import { getBucket } from './getStorageConfig';


export async function fileExists(fileName: string) {
    const bucket = await getBucket();
    const exist = (await (await bucket).file(fileName).exists());
    //console.log("Exist " + exist)
    return exist
}

export async function downloadFile(filename: string) {
    const bucket = await getBucket();
    console.log("downloading file " + filename);
    try {
       // console.log((await bucket).getFiles());
        const exists = await fileExists(filename);
        //console.log("file exists " + exists);
        if (exists) {
            console.log("Found file " + filename);
            const content = await (await bucket).file(filename).download();
            if (content) {
                //console.log("found content")
                //console.log(content)
                return content;
            }
        } else {
            console.log("File not found");
            return;
        }
    } catch (error) {
        console.error("Error downloading file:", error);
        return;
    }
}

export async function saveFile(filename: string, content: string) {
    console.log("savefile " + filename);
    const bucket = await getBucket();
    // console.log(content);
    try {
        (await bucket).file(filename).save(content);
        console.log('File saved successfully');
    } catch (error) {
        console.error('Error saving file:', error);
    }
}

