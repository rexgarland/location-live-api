import {testContract} from "../src/contract";

(async () => {
    console.log('Testing a known-good server...')

    const knownWorkingServer = 'https://locationlive.rexgarland.dev';

    await testContract(knownWorkingServer).subscribe({
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

    console.log('\nTesting a known-bad server...')

    const knownFailingServer = 'https://locationlive.rexgarland.dev/some-non-existent-path';

    await testContract(knownFailingServer).subscribe({
        error() {
            console.log('🎯 Failed as expected!')
        },
        complete() {
            console.error(`❌ Expected to fail, but passed health check.`)
            process.exit(1);
        }
    })
})()

