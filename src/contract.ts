import {isOk, Result} from "./result";
import {Observable} from "./observable";
import {LocationLiveAPI} from "./api";

// just dummy test data
const chicago = {
    lat: 41.881944,
    lon: -87.627778,
};

export type Check = () => Promise<Result<string>>;

/**
 * This is the contract that any custom backend must adhere to.
 */
class Contract extends LocationLiveAPI {

    // Checks should be run in this order
    allChecks: Check[] = [
        () => this.checkServerIsUp(),
        () => this.checkServerCanReceiveLocationUpdate(),
        () => this.checkServerCanSendLocationUpdates(),
        () => this.checkServerRejectsUnauthorizedLocationUpdate(),
        () => this.checkServerRecordsCorrectTimestamp()
    ];

    private async checkServerIsUp(): Promise<Result<string>> {
        let response;
        try {
            response = await fetch(this.rootUrl + '/');
        } catch (e) {
            return {success: false, error: `Could not connect to server: Could not fetch <root-url>/.`}
        }
        if (response.status !== 200) {
            return {success: false, error: 'Could not connect to server: Status from GET <root-url>/ is not 200.'}
        }
        return {success: true, data: 'Server is up.'}
    }

    private async checkServerCanReceiveLocationUpdate(): Promise<Result<string>> {
        try {
            await this.sendLocationUpdate({
                username: '__test_user',
                key: '__test_key',
                location: chicago,
            });
            return {success: true, data: 'Server can receive location updates.'}
        } catch (e) {
            return {success: false, error: `Server not accepting location updates: ${e}`}
        }

    }

    private async checkServerCanSendLocationUpdates(): Promise<Result<string>> {
        try {
            await this.getLocation({username: '__test_user'});
            return {success: true, data: 'Server can send location updates.'}
        } catch (e) {
            return {success: false, error: `Server could not send location updates correctly: ${e}`}
        }
    }

    private async checkServerRejectsUnauthorizedLocationUpdate(): Promise<Result<string>> {
        try {
            await this.sendLocationUpdate({
                username: '__test_user',
                key: '__test_key_new', // wrong key -> this should fail!
                location: chicago,
            });
        } catch (e) {
            // Failure expected
            return {
                success: true,
                data: `Server prevents one user from editing another user's location (aka spoofing).`
            }
        }
        return {
            success: false, error: `Server allowed an unauthorized user to update a location. ` +
                `This should be prevented by validating their key matches that of their first location update. ` +
                `See code.`
        }
    }

    /**
     * Make sure the server is using the correct timestamp format.
     *
     * Timestamps should be milliseconds since UNIX epoch, UTC.
     */
    private async checkServerRecordsCorrectTimestamp(): Promise<Result<string>> {
        // Send an update
        await this.sendLocationUpdate({
            username: '__test_user',
            key: '__test_key',
            location: chicago,
        });

        // Immediately retrieve that update
        const response = await this.getLocation({username: '__test_user'});

        const now = new Date().getTime(); // UTC
        const oneMinuteAgo = now - 60 * 1000; // ms

        if (response.timestamp < oneMinuteAgo) {
            const formattedTimestamp = new Date(response.timestamp).toISOString();
            return {success: false, error: `Timestamp from recent location is way too old: ${formattedTimestamp}`}
        }
        return {success: true, data: 'Location updates include correct timestamps.'}
    }
}

/**
 * Tests the API contract against a custom server.
 *
 * Returns an observable of test results. The observable completes on no issues.
 */
export function testContract(serverUrl: string): Observable<string> {
    const contract = new Contract(serverUrl);

    return new Observable(async sub => {
        for (const check of contract.allChecks) {
            const result = await check();
            if (!isOk(result)) {
                return sub.error(result.error);
            }
            sub.next(result.data);
        }

        sub.complete();
    })
}