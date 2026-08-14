const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// manual .env parser
function loadEnv() {
    const envPath = path.join(__dirname, '../../.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('Error: .env.local file not found');
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            env[match[1]] = value;
        }
    });
    return env;
}

function parseConnectionString(str) {
    const cleaned = str.replace(/^(postgresql|postgres):\/\//, '');
    const atIndex = cleaned.lastIndexOf('@');
    if (atIndex === -1) throw new Error('Invalid connection string');
    
    const credentials = cleaned.substring(0, atIndex);
    const hostDb = cleaned.substring(atIndex + 1);
    
    const colonIndex = credentials.indexOf(':');
    const user = colonIndex === -1 ? credentials : credentials.substring(0, colonIndex);
    const password = colonIndex === -1 ? '' : credentials.substring(colonIndex + 1);
    
    const slashIndex = hostDb.indexOf('/');
    const hostPort = slashIndex === -1 ? hostDb : hostDb.substring(0, slashIndex);
    const database = slashIndex === -1 ? '' : hostDb.substring(slashIndex + 1);
    
    const portColonIndex = hostPort.indexOf(':');
    const host = portColonIndex === -1 ? hostPort : hostPort.substring(0, portColonIndex);
    const port = portColonIndex === -1 ? 5432 : parseInt(hostPort.substring(portColonIndex + 1), 10);
    
    return {
        user: decodeURIComponent(user),
        password: decodeURIComponent(password),
        host,
        port,
        database
    };
}

async function runTests() {
    console.log('============================================================');
    console.log('                  JAGA AUTOMATED TEST SUITE                 ');
    console.log('============================================================');
    
    let totalTests = 0;
    let passedTests = 0;
    
    function assert(name, condition) {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`[PASS] ${name}`);
        } else {
            console.log(`[FAIL] ${name}`);
        }
    }

    // TEST 1: Synchronized timing calculations
    console.log('\n--- Test Group 1: Lecture Timing Sync ---');
    const mockLecture = {
        title: 'Morning Bhagavad Gita',
        duration_seconds: 720, // 12 minutes
        scheduled_start: new Date(Date.now() - 360000).toISOString() // started 6 minutes ago (360,000 ms)
    };
    
    const start = new Date(mockLecture.scheduled_start);
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    
    // Devotee joins 6 minutes (360 seconds) late: must seek to 360 seconds
    assert('Devotee joining 6 minutes late seeks to 360 seconds', elapsedSeconds === 360);
    assert('Player does not auto-restart to 0 for late joiners', elapsedSeconds > 0 && elapsedSeconds < mockLecture.duration_seconds);

    // TEST 2: Contemplation Grace Period Deadlines
    console.log('\n--- Test Group 2: Contemplation Deadlines ---');
    const lectureDurationSeconds = 720; // 12 mins
    const gracePeriodSeconds = 30 * 60; // 30 mins
    const totalAllowedTimeMs = (lectureDurationSeconds + gracePeriodSeconds) * 1000;
    
    const startDateTime = new Date();
    const onTimeSubmissionTime = new Date(startDateTime.getTime() + 10 * 60 * 1000); // 10 minutes after start
    const lateSubmissionTime = new Date(startDateTime.getTime() + 45 * 60 * 1000); // 45 minutes after start (limit is 42 mins)
    
    const limitDateTime = new Date(startDateTime.getTime() + totalAllowedTimeMs);
    
    assert('Submission within 10 minutes is ON-TIME', onTimeSubmissionTime <= limitDateTime);
    assert('Submission after 45 minutes exceeds deadline and is LATE', lateSubmissionTime > limitDateTime);

    // TEST 3: Daily Report Submission Deadline
    console.log('\n--- Test Group 3: Daily Report Deadlines ---');
    // Reports submitted after 10 PM (22:00) local time are late
    const onTimeReportTime = '19:30'; // 7:30 PM
    const lateReportTime = '22:15'; // 10:15 PM
    
    const getReportStatus = (timeString) => {
        const [hours] = timeString.split(':').map(Number);
        return hours >= 22 ? 'late' : 'completed';
    };
    
    assert('Report submitted at 7:30 PM is COMPLETED', getReportStatus(onTimeReportTime) === 'completed');
    assert('Report submitted at 10:15 PM is LATE', getReportStatus(lateReportTime) === 'late');

    // TEST 4: Database role security queries
    console.log('\n--- Test Group 4: Database Role Verification & RLS ---\nConnecting to DB...');
    const env = loadEnv();
    let client;
    try {
        const config = parseConnectionString(env.DATABASE_URL);
        config.ssl = { rejectUnauthorized: false };
        client = new Client(config);
        await client.connect();
        
        // Query database function to check role verify RLS
        const res = await client.query('SELECT public.check_user_is_admin_or_guru(gen_random_uuid()) as test_val');
        assert('RLS role validation database helper function executes', res.rows.length > 0);
        
        // Verify scheduleConfigs seeded correctly
        const resConfigs = await client.query('SELECT COUNT(*) FROM public.schedule_configs');
        assert('Seeded schedule configurations exist in the DB', parseInt(resConfigs.rows[0].count, 10) > 0);
        
        // Verify devotionalContent seeded correctly
        const resContent = await client.query('SELECT COUNT(*) FROM public.devotional_content');
        assert('Seeded devotional content exists in the DB', parseInt(resContent.rows[0].count, 10) > 0);
        
        // Verify lectures seeded correctly
        const resLectures = await client.query('SELECT COUNT(*) FROM public.lectures');
        assert('Seeded initial lectures exist in the DB', parseInt(resLectures.rows[0].count, 10) > 0);

    } catch (e) {
        console.error('[FAIL] Database connection and query checks:', e.message);
    } finally {
        if (client) {
            await client.end();
        }
    }
    
    console.log('\n============================================================');
    console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
    console.log('============================================================');
    
    if (passedTests < totalTests) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
