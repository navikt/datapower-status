
import { FilterNone, UploadFile } from '@mui/icons-material';
import { notEqual } from 'assert';
import { versions } from 'process';
import { stringify } from 'querystring';
import { getBucket } from './getStorageConfig'
import { DomainSchema } from './interfaces';

const filenameStatus = "statusInfo.json";
const filenameDomains = "domainInfo.json";

const bucket = getBucket();

async function fileExists(fileName: string) {
    const exist = (await (await bucket).file(fileName).exists());
    // console.log("File exists " + fileName + " " + exist);
    return exist
}

async function downloadFile(filename: string) {
    // console.log("downloading file " + filename);
    if (await fileExists(filename)) {
        const content = await (await bucket).file(filename).download();
        if (content) {
            // console.log(content.toString())
            return content.toString();
        }
    }
    return "";
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
    return JSON.parse(await downloadFile(filenameStatus));
}

export async function getAllDomains() {
    console.log("getDomains");
    const content = JSON.parse(await downloadFile(filenameDomains));
    const keys= Object.keys(content)
    console.log(keys)
    return keys;
}

export async function getDomain(domain: string) {
    console.log("getDomain " + domain);
    const content = JSON.parse(await downloadFile(filenameDomains));
    const versions = content[domain]
    return versions;
}

export async function getDomainWithHost(domain: string, host:string) {
    // console.log("getDomainWithHost " + domain + " " + host);
    const content = JSON.parse(await downloadFile(filenameDomains));
    if ( domain in content && (host in content[domain].versions)){
        return content[domain].versions[host];
    } 
    console.log("domain not found")  
}

export async function saveDomainVersion(domain: string, host: string, version: string) {
    console.log("saveDomainVersion " + domain)

    let content = JSON.parse(await downloadFile(filenameDomains));
    // console.log(content)
    if (domain in content) {
    //     content[domain].versions[host] = version;
        content[domain].versions[host] = version;
    } else{
        content[domain] =  {versions: {}};
        content[domain].versions[host] = version;
    }
    console.log(content[domain])
    saveFile(filenameDomains, JSON.stringify(content));
}

export async function deleteHostFromDomain(domain: string, host:string) {
    let content = JSON.parse(await downloadFile(filenameDomains));
    if ( domain in content && (host in content[domain].versions)){
        delete content[domain].versions[host];
    }
    console.log(content)
    saveFile(filenameDomains, JSON.stringify(content));
}

export async function getDomainSyncStatus(domain: string) {
    console.log(domain)
    let content = JSON.parse(await downloadFile(filenameDomains));;
    console.log(content[domain].versions)
    if ( domain in content && content[domain].versions){
        console.log("found domain versions")
        const versions = content[domain].versions
        
        // for (const keys, v in versions) {
        //     console.log(keys + " " + v)
        // }

    }

}