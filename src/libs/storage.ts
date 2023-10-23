
import { sanitize } from "sanitize-filename-ts";
import { saveFile, downloadFile } from "./storageUtil";
const filenameStatus = sanitize("statusInfo.json");
const filenameDomains = sanitize("domainInfo.json");


async function getDownloadFileAsJSON(filename:string) {
    const fileContent = await downloadFile(filename);
    if ( fileContent){
        console.log(fileContent.toString())
        const json = JSON.parse(fileContent.toString());
        return json;
    } else {
         return null;
    }
}

export async function uploadStatusFile(content: string) {
    console.log("Upload file");
    await saveFile(filenameStatus, content);
    console.log(`${filenameStatus} uploaded with contents`)
    console.log(content)
}

export async function getStatusFileContent() {
    console.log("getStatusFileContent");
    return await getDownloadFileAsJSON(filenameStatus)
}

export async function getAllDomains() {
    console.log("getDomains " + filenameDomains);
    const content = await getDownloadFileAsJSON(filenameDomains);
    console.log(content)
    if ( content) {
        const keys= Object.keys(content)
        console.log(keys)
        return keys;
    }  else {
        return null;
    }
}

export async function getDomain(domain: string) {
    //console.log("getDomain " + domain);
    const content = await getDownloadFileAsJSON(filenameDomains);
    if (content && domain in content) {
        const versions = content[domain].versions
        return versions;
    } else {
        return undefined;
    }
}

export async function deleteDomain(domain:string) {
    const content = await getDownloadFileAsJSON(filenameDomains);
    if (content && domain in content) {
        console.log("Deleting domain " + domain);
        delete content[domain]
        saveFile(filenameDomains, JSON.stringify(content));
        return true;
    } else {
        return false;
    }
}

export async function getDomainWithHost(domain: string, host:string) {
    const content = await getDownloadFileAsJSON(filenameDomains);
    if ( content && domain in content && (host in content[domain].versions)){
        console.log(content[domain].versions[host])
        return content[domain].versions[host];
    } else {
        console.log("domain not found");
        return;
    }
}

export async function saveDomainVersion(domain: string, host: string, version: string) {
    console.log("saveDomainVersion " + domain)
    try {
        let content = await getDownloadFileAsJSON(filenameDomains);

        if (!content) {
            content = {};
        }

        if (!content[domain]) {
            content[domain] = { versions: {} };
        }

        const { versions } = content[domain];
        versions[host] = version;

        console.log(content);

        await saveFile(filenameDomains, JSON.stringify(content));
    } catch (error) {
        console.error("Error saving domain version:", error);
    }
}

export async function deleteHostFromDomain(domain: string, host:string) {
    const content = await getDownloadFileAsJSON(filenameDomains);
    if ( domain in content && (host in content[domain].versions)){
        delete content[domain].versions[host];
    }
    await saveFile(filenameDomains, JSON.stringify(content));
}

export async function getDomainSyncStatus(domain: string) {
    const content = await getDownloadFileAsJSON(filenameDomains);

    if ( content && domain in content && content[domain].versions){
        let okStatus = false;
        if (Object.keys(content[domain].versions).length == 1) {
            console.log("Found only 1 version returning OK")
            okStatus = true;
        } else {
            let oldversion = null;
            const domainhosts = content[domain].versions
            for ( const host in domainhosts) {
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