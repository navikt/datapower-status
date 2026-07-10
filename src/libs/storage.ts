import { sanitize } from "sanitize-filename-ts";
import { saveFile, downloadFile } from "./storageUtil";
import { DomainVersionComparison, DomainVersionComparisonEntry, Domain, HostRecord } from "./interfaces";

const filenameStatus = sanitize("statusInfo.json");
const filenameDomains = sanitize("domainInfo.json");
const filenameGroups = sanitize("groupInfo.json");

const jsonCache = new Map<string, any>();

export function clearJsonCache(): void {
    jsonCache.clear();
}

function invalidateCacheEntry(filename: string): void {
    jsonCache.delete(filename);
}

async function getDownloadFileAsJSON(filename: string) {
    if (jsonCache.has(filename)) {
        return jsonCache.get(filename);
    }

    const fileContent = await downloadFile(filename);
    if (fileContent) {
        //console.log(fileContent.toString());
        const json = JSON.parse(fileContent.toString());
        jsonCache.set(filename, json);
        return json;
    }

    return null;
}

interface ParsedSemver {
    major: number;
    minor: number;
    patch: number;
    prerelease: Array<number | string>;
}

function parseSemver(version: string): ParsedSemver | undefined {
    const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
    if (!match) {
        return undefined;
    }

    const prereleasePart = match[4];
    const prerelease = prereleasePart
        ? prereleasePart.split(".").map((identifier) => {
            if (/^\d+$/.test(identifier)) {
                return Number(identifier);
            }

            return identifier;
        })
        : [];

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        prerelease,
    };
}

function compareSemver(a: ParsedSemver, b: ParsedSemver): number {
    if (a.major !== b.major) {
        return a.major - b.major;
    }
    if (a.minor !== b.minor) {
        return a.minor - b.minor;
    }
    if (a.patch !== b.patch) {
        return a.patch - b.patch;
    }

    const aHasPrerelease = a.prerelease.length > 0;
    const bHasPrerelease = b.prerelease.length > 0;
    if (!aHasPrerelease && !bHasPrerelease) {
        return 0;
    }
    if (!aHasPrerelease) {
        return 1;
    }
    if (!bHasPrerelease) {
        return -1;
    }

    const maxLength = Math.max(a.prerelease.length, b.prerelease.length);
    for (let i = 0; i < maxLength; i++) {
        const aId = a.prerelease[i];
        const bId = b.prerelease[i];

        if (aId === undefined) {
            return -1;
        }
        if (bId === undefined) {
            return 1;
        }
        if (aId === bId) {
            continue;
        }

        const aIsNumber = typeof aId === "number";
        const bIsNumber = typeof bId === "number";
        if (aIsNumber && bIsNumber) {
            return aId - bId;
        }
        if (aIsNumber && !bIsNumber) {
            return -1;
        }
        if (!aIsNumber && bIsNumber) {
            return 1;
        }

        return String(aId).localeCompare(String(bId));
    }

    return 0;
}

function getGroupHosts(groupContent: any, group: string) {
    if (!groupContent || !(group in groupContent)) {
        return [];
    }

    const hosts = groupContent[group].hosts;
    if (Array.isArray(hosts)) {
        return hosts;
    }

    return [];
}

function toHostRecord(statusEntry: any): HostRecord {
    return {
        hostName: statusEntry.dpInstance,
        dpInstance: statusEntry.dpInstance,
        Version: statusEntry.Version,
        State: statusEntry.State,
        uptime: statusEntry.uptime,
        bootuptime2: statusEntry.bootuptime2,
        MachineType: statusEntry.MachineType,
        Domains: statusEntry.Domains as Domain[],
    };
}

export async function getHostStatus(hostName: string): Promise<HostRecord | undefined> {
    const content = await getDownloadFileAsJSON(filenameStatus);
    if (!content || !Array.isArray(content)) {
        return undefined;
    }

    const statusEntry = content.find((entry: any) => entry.dpInstance === hostName);
    if (!statusEntry) {
        return undefined;
    }

    return toHostRecord(statusEntry);
}

export async function uploadStatusFile(content: string) {
    console.log("Upload file");
    await saveFile(filenameStatus, content);
    invalidateCacheEntry(filenameStatus);
    console.log(`${filenameStatus} uploaded with contents`);
    console.log(content);
}

export async function getStatusFileContent() {
    console.log("getStatusFileContent");
    return await getDownloadFileAsJSON(filenameStatus);
}

export async function getAllDomains() {
    console.log("getDomains " + filenameDomains);
    const content = await getDownloadFileAsJSON(filenameDomains);
    console.log(content);
    if (content) {
        const keys = Object.keys(content);
        console.log(keys);
        return keys;
    }

    return null;
}

export async function getAllGroups() {
    const content = await getDownloadFileAsJSON(filenameGroups);
    const realGroups = content ? Object.keys(content) : [];
    return ["default", ...realGroups];
}

async function getUngroupedHostNames(): Promise<string[]> {
    const groupContent = await getDownloadFileAsJSON(filenameGroups);
    const statusContent = await getDownloadFileAsJSON(filenameStatus);

    const allHosts: string[] = Array.isArray(statusContent)
        ? statusContent.map((h: any) => h.dpInstance as string)
        : [];

    const groupedHosts = new Set<string>();
    if (groupContent) {
        for (const group of Object.keys(groupContent)) {
            for (const host of getGroupHosts(groupContent, group)) {
                groupedHosts.add(host);
            }
        }
    }

    return allHosts.filter((h) => !groupedHosts.has(h));
}

export async function getGroup(group: string) {
    if (group === "default") {
        const hostNames = await getUngroupedHostNames();
        const hosts = await Promise.all(hostNames.map(async (hostName: string) => {
            const status = await getHostStatus(hostName);
            return status || {
                hostName,
                dpInstance: hostName,
                Version: "",
                State: "",
                uptime: "",
                bootuptime2: "",
                MachineType: "",
                Domains: [],
            };
        }));
        return { group: "default", hosts };
    }

    const content = await getDownloadFileAsJSON(filenameGroups);
    if (content && group in content) {
        const hostNames = getGroupHosts(content, group);
        const hosts = await Promise.all(hostNames.map(async (hostName: string) => {
            const status = await getHostStatus(hostName);
            return status || {
                hostName,
                dpInstance: hostName,
                Version: "",
                State: "",
                uptime: "",
                bootuptime2: "",
                MachineType: "",
                Domains: [],
            };
        }));
        return {
            group,
            hosts,
        };
    }

    return undefined;
}

export async function getDomain(domain: string) {
    const content = await getDownloadFileAsJSON(filenameDomains);
    if (content && domain in content) {
        const versions = content[domain].versions;
        return versions;
    }

    return undefined;
}

export async function deleteDomain(domain: string) {
    const content = await getDownloadFileAsJSON(filenameDomains);
    if (content && domain in content) {
        console.log("Deleting domain " + domain);
        delete content[domain];
        saveFile(filenameDomains, JSON.stringify(content));
        invalidateCacheEntry(filenameDomains);
        return true;
    }

    return false;
}

export async function getDomainWithHost(domain: string, host: string) {
    const content = await getDownloadFileAsJSON(filenameDomains);
    if (content && domain in content && (host in content[domain].versions)) {
        console.log(content[domain].versions[host]);
        return content[domain].versions[host];
    }

    console.log("domain not found");
    return;
}

export async function saveDomainVersion(domain: string, host: string, version: string) {
    console.log("saveDomainVersion " + domain);
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
        invalidateCacheEntry(filenameDomains);
    } catch (error) {
        console.error("Error saving domain version:", error);
    }
}

export async function saveHostStatus(metadata: any) {
    const content = await getDownloadFileAsJSON(filenameStatus);
    const hosts = Array.isArray(content) ? content : [];
    const nextHosts = hosts.filter((entry: any) => entry.dpInstance !== metadata.dpInstance);
    nextHosts.push(metadata);
    await saveFile(filenameStatus, JSON.stringify(nextHosts));
    invalidateCacheEntry(filenameStatus);
}

export async function saveGroupHost(group: string, host: string) {
    const content = await getDownloadFileAsJSON(filenameGroups) || {};

    for (const existingGroup of Object.keys(content)) {
        const hosts = getGroupHosts(content, existingGroup).filter((currentHost: string) => currentHost !== host);
        if (hosts.length > 0) {
            content[existingGroup].hosts = hosts;
        } else {
            delete content[existingGroup];
        }
    }

    if (!content[group]) {
        content[group] = { hosts: [] };
    }

    const hosts = getGroupHosts(content, group);
    if (!hosts.includes(host)) {
        hosts.push(host);
    }
    content[group].hosts = hosts;

    await saveFile(filenameGroups, JSON.stringify(content));
    invalidateCacheEntry(filenameGroups);
}

export async function deleteHostFromGroup(group: string, host: string) {
    const content = await getDownloadFileAsJSON(filenameGroups);
    if (!content || !(group in content)) {
        return false;
    }

    if (!getGroupHosts(content, group).includes(host)) {
        return false;
    }

    const hosts = getGroupHosts(content, group).filter((currentHost: string) => currentHost !== host);
    if (hosts.length > 0) {
        content[group].hosts = hosts;
    } else {
        delete content[group];
    }

    await saveFile(filenameGroups, JSON.stringify(content));
    invalidateCacheEntry(filenameGroups);
    return true;
}

export async function getHostGroup(host: string) {
    const content = await getDownloadFileAsJSON(filenameGroups);
    if (!content) {
        return undefined;
    }

    for (const group of Object.keys(content)) {
        if (getGroupHosts(content, group).includes(host)) {
            return group;
        }
    }

    return undefined;
}

export async function getGroupDomainComparison(group: string, domain: string): Promise<DomainVersionComparison | undefined> {
    if (domain === "default") {
        return undefined;
    }

    const statusContent = await getDownloadFileAsJSON(filenameStatus);

    let hosts: string[];
    if (group === "default") {
        hosts = await getUngroupedHostNames();
    } else {
        const groupContent = await getDownloadFileAsJSON(filenameGroups);
        if (!groupContent || !(group in groupContent)) {
            return undefined;
        }
        hosts = getGroupHosts(groupContent, group);
    }

    // Extract versions from statusInfo.json for each host
    const hostVersions: DomainVersionComparisonEntry[] = hosts.map((host: string) => {
        let version: string | null = null;
        
        if (Array.isArray(statusContent)) {
            const hostStatus = statusContent.find((entry: any) => entry.dpInstance === host);
            if (hostStatus && Array.isArray(hostStatus.Domains)) {
                const domainEntry = hostStatus.Domains.find((d: any) => d.domain === domain);
                if (domainEntry && domainEntry.version) {
                    version = domainEntry.version;
                }
            }
        }

        return {
            host,
            version,
            status: version === null ? "missing" as const : "match" as const,
        };
    });

    const definedVersions = hostVersions
        .filter((entry: { version: string | null }) => entry.version !== null)
        .map((entry: { version: string | null }) => entry.version as string);
    const uniqueVersions = [...new Set(definedVersions)];
    const semverCandidates = uniqueVersions
        .map((version) => ({ version, parsed: parseSemver(version) }))
        .filter((candidate): candidate is { version: string; parsed: ParsedSemver } => candidate.parsed !== undefined)
        .sort((a, b) => compareSemver(b.parsed, a.parsed));
    const referenceVersion = semverCandidates.length > 0
        ? semverCandidates[0].version
        : (uniqueVersions[0] ?? null);

    const comparison: DomainVersionComparisonEntry[] = hostVersions.map((entry) => {
        if (entry.version === null) {
            return { ...entry, status: "missing" };
        }

        if (referenceVersion !== null && entry.version !== referenceVersion) {
            return { ...entry, status: "different" };
        }

        return { ...entry, status: "match" };
    });

    const isSynced = hosts.length > 0 && comparison.every((entry: { status: string }) => entry.status === "match");

    return {
        group,
        domain,
        referenceVersion,
        uniqueVersions,
        isSynced,
        hosts: comparison,
    };
}

export async function saveDomainVersionForGroup(group: string, domain: string, host: string, version: string) {
    await saveGroupHost(group, host);
    await saveDomainVersion(domain, host, version);
}

export async function deleteHostFromDomain(domain: string, host: string) {
    const content = await getDownloadFileAsJSON(filenameDomains);
    if (content && domain in content && (host in content[domain].versions)) {
        delete content[domain].versions[host];
    }

    await saveFile(filenameDomains, JSON.stringify(content));
    invalidateCacheEntry(filenameDomains);
}

export async function getDomainSyncStatus(domain: string) {
    const content = await getDownloadFileAsJSON(filenameDomains);

    if (content && domain in content && content[domain].versions) {
        let okStatus = false;
        if (Object.keys(content[domain].versions).length == 1) {
            console.log("Found only 1 version returning OK");
            okStatus = true;
        } else {
            let oldversion = null;
            const domainhosts = content[domain].versions;
            for (const host in domainhosts) {
                if (!oldversion) {
                    oldversion = domainhosts[host];
                    continue;
                }
                if (oldversion != domainhosts[host]) {
                    console.log(oldversion + " " + domainhosts[host]);
                    okStatus = false;
                } else {
                    okStatus = true;
                }
            }
        }

        if (okStatus) {
            return true;
        }

        return false;
    }

    console.log("Did not found domain");
    return undefined;
}
