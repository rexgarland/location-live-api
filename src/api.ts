import {Result} from "./result";

class ApiError extends Error {
    toString() {
        return this.message;
    }
}

type SimpleLocation = { lon: number, lat: number };
type LocationResponse = {
    location: SimpleLocation,
    timestamp: number
}

function parseLocationResponse(raw: unknown): Result<LocationResponse> {
    try {
        const {location: {lon, lat}, timestamp} = raw as LocationResponse;
        if (typeof (lon as unknown) !== 'number') return {success: false, error: 'Failed to parse'};
        if (typeof (lat as unknown) !== 'number') return {success: false, error: 'Failed to parse'};
        if (typeof (timestamp as unknown) !== 'number') return {success: false, error: 'Failed to parse'};
        return {success: true, data: {location: {lon, lat}, timestamp}};
    } catch (e) {
        return {success: false, error: 'Failed to parse'};
    }
}

export class LocationLiveAPI {
    rootUrl: string;

    constructor(rootUrl: string) {
        this.rootUrl = rootUrl;
    }

    setUrl(url: string) {
        this.rootUrl = url;
    }

    getUrl() {
        return this.rootUrl;
    }

    // throws
    async getLocation(params: { username: string }): Promise<LocationResponse> {
        let response;
        try {
            response = await fetch(
                this.rootUrl + `/location?username=${params.username}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
            );
        } catch (e) {
            throw new ApiError('Failed to fetch /location endpoint');
        }
        if (response.status !== 200) {
            throw new ApiError(`Expected 200, received ${response.status}`);
        }
        const raw = await response.json();
        const result = parseLocationResponse(raw);
        if (!result.success) {
            throw new ApiError('Response data did not have correct shape.');
        }
        return result.data;
    }

    // throws
    async sendLocationUpdate(params: {
        username: string;
        key: string;
        location: SimpleLocation;
    }) {
        let response;
        try {
            response = await fetch(
                this.rootUrl +
                `/location?username=${params.username}&key=${params.key}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        location: params.location,
                    }),
                },
            );
        } catch (e) {
            throw new ApiError('Could not POST to /location.');
        }
        if (response.status !== 200) {
            throw new ApiError(
                `Expected status 200, received ${response.status}.`,
            );
        }
    }
}