import {testContract} from "../src/contract";

const serverUrl = process.argv[2];

const observable = testContract(serverUrl)

observable.subscribe({
    next(successResponse) {
        console.log(`✅ ${successResponse}`)
    },
    error(failureReason) {
        console.error(`❌ ${failureReason}`)
        process.exit(1);
    },
    complete() {
        console.log('🎯 Complete!')
    }
})