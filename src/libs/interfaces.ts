import { z } from "zod";

export const statusSchemaZod = z.array( z.object({
        dpInstance: z.string(),
        State: z.string(),
        Version: z.string(),
        MachineType: z.string(),
        Domains: z.array( z.object({
            domain: z.string(),
            mAdminState: z.string()
        }) ),
        uptime: z.string(),
        bootuptime2: z.string()
    }).required({
        dpInstance: true,
        State: true,
        Version: true,
        MachineType: true,
        Domains: true,
        uptime: true,
        bootuptime2: true
    }));

export const hostMetadataSchemaZod = z.object({
    dpInstance: z.string(),
    State: z.string(),
    Version: z.string(),
    MachineType: z.string(),
    Domains: z.array(z.object({
        domain: z.string(),
        mAdminState: z.string(),
        version: z.string().optional()
    })),
    uptime: z.string(),
    bootuptime2: z.string()
}).required({
        dpInstance: true,
        State: true,
        Version: true,
        MachineType: true,
        Domains: true,
        uptime: true,
        bootuptime2: true
    });

export type HostMetadata = z.infer<typeof hostMetadataSchemaZod>;


export type statusSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            dpInstance: { type: "string", min: 15, max:20 },
            State: { type: "string" },
            Version: { type: "string" },
            MachineType: { type: "string" },
            Domains: { type: "array", items: { 
                type: "object",
                properties: {
                    domain: { type: "string"},
                    mAdminState: { type: "string"}
                }
             } },
            uptime: { type: "string" },
            bootuptime2: { type: "string" },
        },
        required: [
            "dpInstance",
            "State",
            "Version",
            "MachineType",
            "Domains",
            "uptime",
            "bootuptime2",
        ],
        additionalProperties: false,
    },
};

export interface dpInstance {
    dpInstance: string,
    Version: string,
    State: string,
    uptime: string,
    bootuptime2: string,
    MachineType: string,
    Domains: Domain[]
}

export interface Domain {
    domain: string,
    mAdminState: string
}

/* export interface DomainSchema {
    domain: string,
    versions: { 
        [key: string]: DomainVersionSchema
    }
} */

export interface DomainVersionSchema {
    host: string,
    version: string
}


export interface ErrorResponse {
    error: string;
}
export interface SuccessResponse {
    success: string;
}

export interface HostGroup {
    hosts: string[];
}

export interface GroupRegistry {
    [group: string]: HostGroup;
}

export interface HostRecord {
    hostName: string;
    dpInstance: string;
    Version: string;
    State: string;
    uptime: string;
    bootuptime2: string;
    MachineType: string;
    Domains: Domain[];
}

export interface GroupHostsResponse {
    group: string;
    hosts: HostRecord[];
}

export interface DomainVersionComparisonEntry {
    host: string;
    version: string | null;
    status: "match" | "different" | "missing";
}

export interface DomainVersionComparison {
    group: string;
    domain: string;
    referenceVersion: string | null;
    uniqueVersions: string[];
    isSynced: boolean;
    hosts: DomainVersionComparisonEntry[];
}