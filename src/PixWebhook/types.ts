export interface MPEventBody {
    action?: string;
    data?: {
        id?: string;
    }
}

export interface MPTelemetryBody {
    topic?: string;
    resource?: string;
}

export type MPRequestBody = MPEventBody | MPTelemetryBody;