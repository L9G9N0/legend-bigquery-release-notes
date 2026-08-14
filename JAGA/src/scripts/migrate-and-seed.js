const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Parse .env.local manually
function loadEnv() {
    const envPath = path.join(__dirname, '../../.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('Error: .env.local file not found at', envPath);
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            // Remove leading/trailing quotes if present
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
    if (atIndex === -1) throw new Error('Invalid connection string: no @ separator');
    
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

async function run() {
    const env = loadEnv();
    const dbUrl = env.DATABASE_URL;
    if (!dbUrl) {
        console.error('Error: DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    console.log('Connecting to database...');
    let clientConfig;
    try {
        clientConfig = parseConnectionString(dbUrl);
        clientConfig.ssl = { rejectUnauthorized: false };
    } catch (e) {
        console.error('Error parsing DATABASE_URL:', e.message);
        process.exit(1);
    }
    const client = new Client(clientConfig);

    try {
        await client.connect();
        console.log('Connected successfully!');

        // 2. Read and run schema migrations
        const migrationPath = path.join(__dirname, '../../supabase/migrations/00001_create_schema.sql');
        console.log('Reading migration file...');
        const sqlSchema = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing schema migrations (tables, triggers, policies)...');
        await client.query(sqlSchema);
        console.log('Schema created successfully!');

        // 3. Seed Schedule Configurations
        console.log('Seeding schedule configurations...');
        const scheduleConfigs = [
            { title: 'Mangala Arati & Tulasi Puja', type: 'arati', start_time_local: '04:30:00', end_time_local: '05:00:00', is_mandatory: true },
            { title: 'Japa Session', type: 'japa', start_time_local: '05:00:00', end_time_local: '07:15:00', is_mandatory: true },
            { title: 'Darshan & Shringara Arati', type: 'darshan', start_time_local: '07:15:00', end_time_local: '07:30:00', is_mandatory: true },
            { title: 'Morning Lecture / scheduled lecture', type: 'lecture', start_time_local: '07:30:00', end_time_local: '08:30:00', is_mandatory: true },
            { title: 'Raja-Bhoga / Bhoga offering', type: 'bhoga', start_time_local: '12:30:00', end_time_local: '13:00:00', is_mandatory: true },
            { title: 'Rest period', type: 'rest', start_time_local: '13:00:00', end_time_local: '16:00:00', is_mandatory: false },
            { title: 'Afternoon Darshan & Dhoop Arati', type: 'darshan', start_time_local: '16:15:00', end_time_local: '16:45:00', is_mandatory: true },
            { title: 'Sandhya & Gaura Arati', type: 'arati', start_time_local: '19:00:00', end_time_local: '19:30:00', is_mandatory: true },
            { title: 'Evening Lecture (7:30 PM)', type: 'lecture', start_time_local: '19:30:00', end_time_local: '20:15:00', is_mandatory: false },
            { title: 'Evening Lecture (8:30 PM)', type: 'lecture', start_time_local: '20:30:00', end_time_local: '21:15:00', is_mandatory: false },
            { title: 'Shayana Arati', type: 'arati', start_time_local: '21:15:00', end_time_local: '21:30:00', is_mandatory: true }
        ];

        for (const config of scheduleConfigs) {
            await client.query(`
                INSERT INTO public.schedule_configs (title, type, start_time_local, end_time_local, is_mandatory)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING
            `, [config.title, config.type, config.start_time_local, config.end_time_local, config.is_mandatory]);
        }
        console.log('Seeded schedule configurations.');

        // 4. Seed Devotional Content (Aartis, Prayers, Bhoga)
        console.log('Seeding devotional content...');
        const devotionalContent = [
            {
                title: 'Sri Gurvastakam',
                transliteration: `(1) samsara-davanala-lidha-loka-tranaya karunya-ghanaghanatwam...`,
                original_text: `samsara-davanala-lidha-loka-tranaya karunya-ghanaghanatwam
praptasya kalyana-gunarnavasya vande guroh sri-charanaravindam...`,
                translation: `The spiritual master is receiving benediction from the ocean of mercy. Just as a cloud pours water on a forest fire to extinguish it, so the spiritual master delivers the materially afflicted world by extinguishing the blazing fire of material existence.`,
                display_order: 1,
                source_reference: 'Srila Vishvanatha Chakravarti Thakura'
            },
            {
                title: 'Gaura Arati',
                transliteration: `(1) (kiba) jaya jaya goracander aratiko sobha
jahnavi-tata-vane jaga-mana-lobha...`,
                original_text: `(kiba) jaya jaya goracander aratiko sobha
jahnavi-tata-vane jaga-mana-lobha...`,
                translation: `All glories, all glories to the beautiful arati ceremony of Lord Caitanya. This Gaura-arati is taking place in a grove on the banks of the Jahnavi [Ganges] and is attracting the minds of all living entities in the universe.`,
                display_order: 2,
                source_reference: 'Srila Bhaktivinoda Thakura (Gitavali)'
            },
            {
                title: 'Sri Nrsimha Pranama',
                transliteration: `namas te narasimhaya prahladahlada-dayine...`,
                original_text: `namas te narasimhaya
prahladahlada-dayine
hiranyakasipor vakshahsila-
tanka-nakhalaye...`,
                translation: `I offer my obeisances to Lord Narasimha who gives joy to Prahlada Maharaja and whose nails are like chisels on the stonelike chest of the demon Hiranyakasipu.`,
                display_order: 3,
                source_reference: 'Srimad-Bhagavatam / Vaishnava Songs'
            },
            {
                title: 'Prayer to Lord Nrsimha',
                transliteration: `tava kara-kamala-vare nakham adbhuta-sringam...`,
                original_text: `tava kara-kamala-vare nakham adbhuta-sringam
dalita-hiranyakasipu-tanu-bhringam
kesava dhrita-narahari-rupa jaya jagadisa hare`,
                translation: `O Kesava! O Lord of the universe! O Lord Hari, who have assumed the form of half-man, half-lion! All glories to You! Just as one can easily crush a wasp between one’s fingernails, so in the same way the body of the wasplike demon Hiranyakasipu has been ripped apart by the wonderful pointed nails on Your beautiful lotus hands.`,
                display_order: 4,
                source_reference: 'Sri Dasavatara Stotra by Jayadeva Gosvami'
            },
            {
                title: 'Vaishnave Vijnapti',
                transliteration: `(1) ei-baro karuna koro vaishnava gosai...`,
                original_text: `ei-baro karuna koro vaishnava gosai
patita-pavana toma bine keho nai...`,
                translation: `O Vaishnava Gosvami, please be merciful to me now. There is no one except you who can purify the fallen souls.`,
                display_order: 5,
                source_reference: 'Srila Narottama dasa Thakura (Prarthana)'
            },
            {
                title: 'Sri Tulasi-Aarti & Pranama',
                transliteration: `namo namah tulasi krishna-preyasi namo namah...`,
                original_text: `namo namah tulasi krishna-preyasi namo namah
radha-krishna-seva pabo ei abilashi...

vṛndāyai tulasī-devyai priyāyai keśavasya ca
viṣṇu-bhakti-prade devī satya vatyai namo namaḥ

yāni kāni ca pāpāni brahma-hatyādikāni ca
tāni tāni praṇaśyanti pradakṣiṇaḥ pade pade`,
                translation: `O Tulasi, beloved of Krishna, I bow before you again and again. My desire is to obtain the service of Sri Sri Radha and Krishna. I offer my repeated obeisances unto Vrinda, Srimati Tulasi Devi... By the circumambulation of Srimati Tulasi Devi all sins are destroyed.`,
                display_order: 6,
                source_reference: 'Traditional Gaudiya Vaishnava Prayers'
            },
            {
                title: 'Mandatory Aarti Closing (Jaya Sequence)',
                transliteration: `Jaya Paramahamsa Parivrajakacarya...`,
                original_text: `Jaya Paramahamsa Parivrajakacarya...
Bhaktivedanta Swami Maharaja ki jaya

Ananta koti vaisnava vrinda ki jaya
Namacarya Srila Haridasa Thakura ki jaya

Prem se kaho Sri Krsna Caitanya Prabhu Nityananda
Sri Advaita Gadadhara Srivasadi Gaura Bhakta Vrinda ki jaya

Sri Sri Radha Krsna Gopa Gopinatha
Syama Kunda Radha Kunda Giri Govardhana ki jaya

Vrindavana dhama ki jaya
Navadvipa dhama ki jaya
Ganga mayi ki jaya
Jamuna mayi ki jaya`,
                translation: `All glories to the assembled devotees. Thank you very much.`,
                display_order: 7,
                source_reference: 'JAGA Mandatory Closing standard'
            },
            {
                title: 'Bhoga Offering Procedure',
                transliteration: `1. Chant Srila Prabhupada Prayer 3x
2. Chant Lord Chaitanya Prayer 3x
3. Chant Lord Krishna Prayer 3x
4. Chant Panchatattva Mantra 3x
5. Chant Hare Krishna Mahamantra 3x`,
                original_text: `Srila Prabhupada Pranati:
nama om visnu-padaya krsna-presthaya bhu-tale
srimate bhaktivedanta-svamin iti namine
namas te sarasvate deve gaura-vani-pracarine
nirvisesa-sunyavadi-pascatya-desa-tarine

Sri Caitanya Pranati:
namo maha-vadanyaya krsna-prema-pradaya te
krsnaya krsna-caitanya-namne gaura-tvise namah

Sri Krishna Pranati:
he krsna karuna-sindho dina-bandho jagat-pate
gopesa gopika-kanta radha-kanta namo 'stu te

Pancha Tattva Mantra:
sri-krsna-caitanya prabhu-nityananda
sri-advaita gadadhara srivasadi-gaura-bhakta-vrinda

Hare Krishna Mahamantra:
hare krsna hare krsna krsna krsna hare hare
hare rama hare rama rama rama hare hare`,
                translation: `Perform the offering with love and devotion. Wave a flower or incense while chanting. Let the bhoga stand for 10-15 minutes before offering prayers of gratitude.`,
                display_order: 8,
                source_reference: 'ISKCON / Srila Prabhupada Authorized procedure'
            }
        ];

        for (const content of devotionalContent) {
            await client.query(`
                INSERT INTO public.devotional_content (title, transliteration, original_text, translation, display_order, source_reference)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT DO NOTHING
            `, [content.title, content.transliteration, content.original_text, content.translation, content.display_order, content.source_reference]);
        }
        console.log('Seeded devotional content successfully.');

        // 5. Seed Book References
        console.log('Seeding book references...');
        const bookReferences = [
            { book_title: 'Bhagavad-gita As It Is', chapter_section: 'Chapter 1 to 18', url: 'https://vedabase.io/en/library/bg/', description: 'The primary text of devotional science containing the direct conversation between Lord Krishna and Arjuna.' },
            { book_title: 'Srimad-Bhagavatam', chapter_section: 'Cantos 1 to 12', url: 'https://vedabase.io/en/library/sb/', description: 'The spotless purana describing the glories of the Supreme Lord and His devotees.' },
            { book_title: 'Sri Caitanya-caritamrta', chapter_section: 'Adi, Madhya, Antya Lila', url: 'https://vedabase.io/en/library/cc/', description: 'The biography and teachings of Lord Sri Chaitanya Mahaprabhu.' },
            { book_title: 'Krsna, the Supreme Personality of Godhead', chapter_section: 'Volume 1 & 2', url: 'https://vedabase.io/en/library/kb/', description: 'Summary study of Srimad-Bhagavatam Tenth Canto describing Lord Krishna\'s Vrindavan and Dwaraka pastimes.' }
        ];

        for (const book of bookReferences) {
            await client.query(`
                INSERT INTO public.book_references (book_title, chapter_section, url, description)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT DO NOTHING
            `, [book.book_title, book.chapter_section, book.url, book.description]);
        }
        console.log('Seeded book references successfully.');

        // 6. Seed Lectures
        console.log('Seeding initial library lectures...');
        const initialLectures = [
            {
                title: 'Introduction to Bhagavad Gita As It Is',
                description: 'Overview of the primary teachings of Bhagavad Gita, the difference between body and soul, and the path of loving service.',
                speaker: 'HG Goloka Vrindavan Das',
                youtube_video_id: '3SZG9lMv32c',
                duration_seconds: 2700, // 45 minutes
                category: 'Bhagavad Gita',
                language: 'Hindi',
                scheduled_start: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
                contemplation_required: true,
                active: true
            },
            {
                title: 'The Greatness of Harinam Japa',
                description: 'Focus on clearing mental distractions during Japa and establishing a deep personal connection with the holy name.',
                speaker: 'HG Goloka Vrindavan Das',
                youtube_video_id: 'yvP62XzM-4A',
                duration_seconds: 1800, // 30 minutes
                category: 'Japa / Harinama',
                language: 'Hindi',
                scheduled_start: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
                contemplation_required: true,
                active: true
            },
            {
                title: 'Understanding Vaishnava Etiquette',
                description: 'A study of traditional devotee relationships, respect, cleanliness, and humbleness in devotional service.',
                speaker: 'HG Goloka Vrindavan Das',
                youtube_video_id: '8Y6Y8v_p450',
                duration_seconds: 1500, // 25 minutes
                category: 'Vaishnava Etiquette',
                language: 'Hindi',
                scheduled_start: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), // 1 day ago
                contemplation_required: true,
                active: true
            }
        ];

        for (const lecture of initialLectures) {
            const exists = await client.query('SELECT 1 FROM public.lectures WHERE youtube_video_id = $1', [lecture.youtube_video_id]);
            if (exists.rowCount === 0) {
                await client.query(`
                    INSERT INTO public.lectures (title, description, speaker, youtube_video_id, duration_seconds, category, language, scheduled_start, contemplation_required, active)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [lecture.title, lecture.description, lecture.speaker, lecture.youtube_video_id, lecture.duration_seconds, lecture.category, lecture.language, lecture.scheduled_start, lecture.contemplation_required, lecture.active]);
            }
        }
        console.log('Seeded initial lectures successfully.');

    } catch (err) {
        console.error('Error during migration and seeding:', err);
        process.exit(1);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

run();
