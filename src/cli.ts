#!/usr/bin/env node

import {testContract} from "./contract";

const command = process.argv[2];

if (command !== 'testServer') {
    console.log("Only one command currently supported: testServer <server-url>")
    process.exit(1);
}

const serverUrl = process.argv[3];

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