
import { getBucket } from './getStorageConfig'
import { sanitize } from "sanitize-filename-ts";

const filenameStatus = sanitize("statusInfo.json");
const filenameDomains = sanitize("domainInfo.json");


const bucket = getBucket();

async function fileExists(fileName: string) {
    const exist = (await (await bucket).file(fileName).exists());
    return exist
}

async function downloadFile(filename: string) {
    // console.log("downloading file " + filename);
    try {
        const exists = await fileExists(filename);
        console.log("file exists " + exists);
        if (exists) {
            console.log("Found file " + filename);
            const content = await (await bucket).file(filename).download();
            if (content) {
                console.log("found content")
                return content;
            }
        } else {
            console.log("File not found")
            return undefined;
        }
    } catch (error) {
        console.error("Error downloading file:", error);
        return undefined;
    }
}

async function getDownloadFileAsJSON(filename:string) {
    const fileContent = await downloadFile(filename);
    if ( fileContent !== undefined){
        const json = JSON.parse(fileContent.toString());
        return json;
    } else {
         return undefined;
    }
}

async function saveFile(filename: string, content: string) {
    // console.log("savefile " + filename);
    // console.log(content);
    (await bucket)
        .file(filename)
        .save(content);
}

export async function uploadStatusFile(content: string) {
    console.log("Upload file");
    saveFile(filenameStatus, content);
    console.log(`${filenameStatus} uploaded with contents`)
}

export async function getStatusFileContent() {
    console.log("getStatusFileContent");
    return await getDownloadFileAsJSON(filenameStatus)
}

export async function getAllDomains() {
    console.log("getDomains " + filenameDomains);
    const content = await getDownloadFileAsJSON(filenameDomains);
    const keys= Object.keys(content)
    console.log(keys)
    return keys;
}

export async function getDomain(domain: string) {
    //console.log("getDomain " + domain);
    const content = await getDownloadFileAsJSON(filenameDomains);
    if (content) {
        const versions = content[domain]
        return versions;
    }
}

export async function getDomainWithHost(domain: string, host:string) {
    console.log("getDomainWithHost " + domain + " " + host);
    const content = await getDownloadFileAsJSON(filenameDomains);
    console.log(content)
    if ( content && domain in content && (host in content[domain].versions)){
        return content[domain].versions[host];
    } 
    console.log("domain not found")  
}

export async function saveDomainVersion(domain: string, host: string, version: string) {
    //console.log("saveDomainVersion " + domain)
    let content: any = {};
    try {
        console.log("Try to get existing domainlist")
        content = getDownloadFileAsJSON(filenameDomains);
        //console.log(content[domain])
        // console.log(content)
        if (domain in content) {
        //content[domain].versions[host] = version;
            content[domain].versions[host] = version;
        }else {
            content[domain] =  {versions: {}};
            content[domain].versions[host] = version;
        }
    } catch (error) {
        console.log("Error saving domainversion")
        console.log(error)
        content[domain] =  {versions: {}};
        content[domain].versions[host] = version;
    }
    console.log(content)
    saveFile(filenameDomains, JSON.stringify(content));
}

export async function deleteHostFromDomain(domain: string, host:string) {
    let content = await getDownloadFileAsJSON(filenameDomains);
    if ( domain in content && (host in content[domain].versions)){
        delete content[domain].versions[host];
    }
    //console.log(content)
    saveFile(filenameDomains, JSON.stringify(content));
}

export async function getDomainSyncStatus(domain: string) {
    const content = await getDownloadFileAsJSON(filenameDomains);
    console.log("getDomainSyncStatus " + domain)

    if ( content && domain in content && content[domain].versions){
        let okStatus = false;
        if (Object.keys(content[domain].versions).length == 1) {
            console.log("Found only 1 version returning OK")
            okStatus = true;
        } else {
            let oldversion = null;
            const domainhosts = content[domain].versions
            for ( let host in domainhosts) {
                //console.log(host + " " + domainhosts[host])
                if ( !oldversion ) {
                    //console.log("oldversion is null");
                    oldversion = domainhosts[host];
                    continue;
                }
                if (oldversion != domainhosts[host]) {
                    //console.log("oldversion is not equal");
                    console.log(oldversion + " " + domainhosts[host]);
                    okStatus = false;
                }else {
                    okStatus = true;
                }
            }
        }

        if (okStatus) {
            return true
        }else {
            return false
        }
    } else {
        console.log("Did not found domain");
        return undefined
    }
}