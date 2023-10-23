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