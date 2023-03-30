import { type } from "os";

export type statusSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            dpInstance: { type: "string" },
            State: { type: "string" },
            Version: { type: "string" },
            MachineType: { type: "string" },
            Domains: { type: "array", items: { type: "string" } },
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
    Domains: string[]
}

export interface DomainSchema {
    domain: string,
    versions: { 
        [key: string]: DomainVersionSchema
    }
}

export interface DomainVersionSchema {
    host: string,
    version: string
}