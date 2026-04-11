import 'dotenv/config';
import db from '../src/models/index.js';
import * as lifecycleService from '../src/services/lifecycle.service.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FRESH SEED – purge everything except Users & Clients, then re-populate
   using the REAL lifecycle flow (updateJobStatus / updateSurveyStatus)
   ═══════════════════════════════════════════════════════════════════════════ */

async function freshSeed() {
    try {
        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║        🚀  FRESH SEED – Starting …               ║');
        console.log('╚══════════════════════════════════════════════════╝\n');

        // ─────────────────────── PHASE 1: PURGE ───────────────────────
        console.log('🗑️  Phase 1 — Purging all data (keeping Users & Clients) …');

        // Order matters — delete children first to avoid FK violations
        const purgeOrder = [
            'SurveyStatusHistory',
            'JobStatusHistory',
            'JobDocument',
            'ActivityPlanning',
            'NonConformity',
            'Payment',
            'JobReschedule',
            'JobNote',
            'Survey',
            'CertificateHistory',
            'Certificate',
            'JobRequest',
            'VesselDocument',
            'GpsTracking',
            'Vessel',
            'CertificateRequiredDocument',
            'CertificateTemplate',
            'ChecklistTemplate',
            'CertificateType',
            'FlagAdministration',
            'SurveyorProfile',
        ];

        for (const modelName of purgeOrder) {
            if (db[modelName]) {
                const count = await db[modelName].destroy({ where: {}, truncate: false });
                console.log(`   ✓ ${modelName}: ${count} rows deleted`);
            }
        }
        console.log('   ✅ Purge complete!\n');

        // ─────────────────────── PHASE 2: REFERENCE DATA ───────────────────────
        console.log('🏗️  Phase 2 — Creating reference data …');

        // -- Flag Administrations --
        const flagData = [
            { flag_state_name: 'Panama Maritime Authority', country: 'Panama', authority_name: 'AMP', contact_email: 'info@amp.gob.pa', authorization_scope: 'Full classification and statutory services', status: 'ACTIVE' },
            { flag_state_name: 'Marshall Islands Maritime Administrator', country: 'Marshall Islands', authority_name: 'MI-RMI', contact_email: 'maritime@register-iri.com', authorization_scope: 'Full classification and statutory services', status: 'ACTIVE' },
            { flag_state_name: 'Liberia Maritime Authority', country: 'Liberia', authority_name: 'LISCR', contact_email: 'info@liscr.com', authorization_scope: 'Full classification and statutory services', status: 'ACTIVE' },
            { flag_state_name: 'Singapore Maritime & Port Authority', country: 'Singapore', authority_name: 'MPA', contact_email: 'registry@mpa.gov.sg', authorization_scope: 'Full classification and statutory services', status: 'ACTIVE' },
            { flag_state_name: 'Hong Kong Marine Department', country: 'Hong Kong', authority_name: 'HKMD', contact_email: 'mdenquiry@mardep.gov.hk', authorization_scope: 'Full classification and statutory services', status: 'ACTIVE' },
        ];
        const flags = [];
        for (const f of flagData) {
            flags.push(await db.FlagAdministration.create(f));
        }
        console.log(`   ✓ ${flags.length} Flag Administrations created`);

        // -- Fetch existing users --
        const admin = await db.User.findOne({ where: { role: 'ADMIN' } });
        const tm = await db.User.findOne({ where: { role: 'TM' } });
        const surveyor = await db.User.findOne({ where: { role: 'SURVEYOR' } });
        const clientUser = await db.User.findOne({ where: { role: 'CLIENT' } });

        if (!admin || !tm || !surveyor || !clientUser) {
            throw new Error('Missing required users (ADMIN / TM / SURVEYOR / CLIENT). Make sure users exist before running this script.');
        }
        console.log(`   ✓ Found users → Admin: ${admin.name}, TM: ${tm.name}, Surveyor: ${surveyor.name}, Client: ${clientUser.name}`);

        // Recreate surveyor profile
        await db.SurveyorProfile.create({
            user_id: surveyor.id,
            license_number: 'LIC-SRV-2024-0001',
            authorized_ship_types: ['Bulk Carrier', 'Oil Tanker', 'Container Ship', 'Chemical Tanker', 'LPG Carrier'],
            authorized_certificates: ['Safety Equipment Certificate', 'Load Line Certificate', 'IOPP Certificate', 'Safety Construction Certificate'],
            valid_from: '2024-01-01',
            valid_to: '2029-12-31',
            status: 'ACTIVE',
            is_available: true,
        });
        console.log(`   ✓ SurveyorProfile created`);

        // -- Fetch existing client --
        const client = await db.Client.findOne({ where: { id: clientUser.client_id } });
        if (!client) throw new Error('No client found linked to CLIENT user.');
        console.log(`   ✓ Found Client: ${client.company_name}`);

        // ─────────────────────── PHASE 3: CERTIFICATE TYPES + TEMPLATES + CHECKLISTS ───────────────────────
        console.log('\n📋 Phase 3 — Certificate Types, Templates & Checklists …');

        const certTypeData = [
            {
                name: 'Safety Equipment Certificate',
                issuing_authority: 'CLASS', validity_years: 5,
                description: 'Certifies that the ship complies with SOLAS regarding life-saving appliances, fire safety systems, and navigational equipment.',
                requires_survey: true,
                sections: [
                    {
                        title: 'Life-Saving Appliances', items: [
                            { code: 'LSA-01', text: 'Lifeboats condition and davit operation', type: 'PASS_FAIL' },
                            { code: 'LSA-02', text: 'Liferafts hydrostatic release units', type: 'PASS_FAIL' },
                            { code: 'LSA-03', text: 'Lifebuoys quantity and condition', type: 'YES_NO' },
                            { code: 'LSA-04', text: 'Immersion suits available for each crew member', type: 'YES_NO' },
                            { code: 'LSA-05', text: 'EPIRB registration and battery validity', type: 'PASS_FAIL' },
                        ]
                    },
                    {
                        title: 'Fire Safety Systems', items: [
                            { code: 'FSS-01', text: 'Fixed fire extinguishing systems tested', type: 'PASS_FAIL' },
                            { code: 'FSS-02', text: 'Fire detection and alarm system operational', type: 'PASS_FAIL' },
                            { code: 'FSS-03', text: 'Portable fire extinguishers serviced', type: 'YES_NO' },
                            { code: 'FSS-04', text: 'Fire hoses and nozzles in good condition', type: 'YES_NO' },
                        ]
                    },
                    {
                        title: 'Navigation Equipment', items: [
                            { code: 'NAV-01', text: 'Radar systems X-band and S-band operational', type: 'PASS_FAIL' },
                            { code: 'NAV-02', text: 'AIS transponder functioning correctly', type: 'PASS_FAIL' },
                            { code: 'NAV-03', text: 'GMDSS equipment tested', type: 'PASS_FAIL' },
                        ]
                    }
                ],
                requiredDocs: ['REGISTRY_CERTIFICATE', 'PREVIOUS_SEC', 'CLASS_CERTIFICATE', 'CREW_LIST'],
                templateHtml: '<div style="font-family:serif;padding:40px"><h1 style="text-align:center">SAFETY EQUIPMENT CERTIFICATE</h1><p style="text-align:center">Issued under SOLAS 1974</p><hr/><table style="width:100%"><tr><td><strong>Vessel:</strong></td><td>{{vessel_name}}</td></tr><tr><td><strong>IMO:</strong></td><td>{{imo_number}}</td></tr><tr><td><strong>Certificate No:</strong></td><td>{{certificate_number}}</td></tr><tr><td><strong>Issue Date:</strong></td><td>{{issue_date}}</td></tr><tr><td><strong>Expiry Date:</strong></td><td>{{expiry_date}}</td></tr></table></div>',
                variables: ['vessel_name', 'imo_number', 'certificate_number', 'issue_date', 'expiry_date'],
            },
            {
                name: 'International Load Line Certificate',
                issuing_authority: 'CLASS', validity_years: 5,
                description: 'Certifies the freeboards assigned to the ship per the International Convention on Load Lines, 1966.',
                requires_survey: true,
                sections: [
                    {
                        title: 'Hull & Structural Integrity', items: [
                            { code: 'HUL-01', text: 'Condition of shell plating', type: 'PASS_FAIL' },
                            { code: 'HUL-02', text: 'Deck plating integrity around openings', type: 'PASS_FAIL' },
                            { code: 'HUL-03', text: 'Load line marks clearly visible', type: 'YES_NO' },
                            { code: 'HUL-04', text: 'Draft marks legible on all sides', type: 'YES_NO' },
                        ]
                    },
                    {
                        title: 'Watertight Closures', items: [
                            { code: 'WTC-01', text: 'Hatch covers weathertight and operational', type: 'PASS_FAIL' },
                            { code: 'WTC-02', text: 'Ventilators and air pipes closures', type: 'PASS_FAIL' },
                            { code: 'WTC-03', text: 'Scuppers and freeing ports condition', type: 'PASS_FAIL' },
                            { code: 'WTC-04', text: 'Watertight doors operational test', type: 'PASS_FAIL' },
                        ]
                    },
                    {
                        title: 'Guard Rails & Walkways', items: [
                            { code: 'GRW-01', text: 'Guard rails and stanchions secured', type: 'YES_NO' },
                            { code: 'GRW-02', text: 'Gangway and walkway condition', type: 'YES_NO' },
                        ]
                    }
                ],
                requiredDocs: ['REGISTRY_CERTIFICATE', 'STABILITY_BOOKLET', 'PREVIOUS_LOADLINE_CERT'],
                templateHtml: '<div style="font-family:serif;padding:40px"><h1 style="text-align:center">INTERNATIONAL LOAD LINE CERTIFICATE</h1><p style="text-align:center">Issued under Load Lines Convention 1966</p><hr/><table style="width:100%"><tr><td><strong>Vessel:</strong></td><td>{{vessel_name}}</td></tr><tr><td><strong>IMO:</strong></td><td>{{imo_number}}</td></tr><tr><td><strong>Certificate No:</strong></td><td>{{certificate_number}}</td></tr><tr><td><strong>Issue Date:</strong></td><td>{{issue_date}}</td></tr><tr><td><strong>Expiry Date:</strong></td><td>{{expiry_date}}</td></tr></table></div>',
                variables: ['vessel_name', 'imo_number', 'certificate_number', 'issue_date', 'expiry_date'],
            },
            {
                name: 'IOPP Certificate',
                issuing_authority: 'FLAG', validity_years: 5,
                description: 'International Oil Pollution Prevention Certificate — MARPOL Annex I compliance.',
                requires_survey: true,
                sections: [
                    {
                        title: 'Oil Discharge Monitoring', items: [
                            { code: 'ODM-01', text: 'Oil discharge monitoring equipment calibrated', type: 'PASS_FAIL' },
                            { code: 'ODM-02', text: 'Oil-water separator operational and tested', type: 'PASS_FAIL' },
                            { code: 'ODM-03', text: '15 ppm bilge alarm functional', type: 'PASS_FAIL' },
                        ]
                    },
                    {
                        title: 'Fuel Oil Tank Protection', items: [
                            { code: 'FOT-01', text: 'Double hull / double bottom arrangement compliant', type: 'YES_NO' },
                            { code: 'FOT-02', text: 'Fuel oil tank overflow prevention', type: 'PASS_FAIL' },
                            { code: 'FOT-03', text: 'Oil residue (sludge) tank capacity adequate', type: 'YES_NO' },
                        ]
                    },
                    {
                        title: 'Ship Operations & Documentation', items: [
                            { code: 'SOD-01', text: 'Oil Record Book Part I maintained', type: 'YES_NO' },
                            { code: 'SOD-02', text: 'SOPEP onboard and current', type: 'YES_NO' },
                            { code: 'SOD-03', text: 'Crew drilled on oil spill procedures', type: 'YES_NO' },
                        ]
                    }
                ],
                requiredDocs: ['REGISTRY_CERTIFICATE', 'MARPOL_CERTIFICATE', 'OIL_RECORD_BOOK', 'SOPEP_PLAN'],
                templateHtml: '<div style="font-family:serif;padding:40px"><h1 style="text-align:center">IOPP CERTIFICATE</h1><p style="text-align:center">Issued under MARPOL 73/78 Annex I</p><hr/><table style="width:100%"><tr><td><strong>Vessel:</strong></td><td>{{vessel_name}}</td></tr><tr><td><strong>IMO:</strong></td><td>{{imo_number}}</td></tr><tr><td><strong>Certificate No:</strong></td><td>{{certificate_number}}</td></tr><tr><td><strong>Issue Date:</strong></td><td>{{issue_date}}</td></tr><tr><td><strong>Expiry Date:</strong></td><td>{{expiry_date}}</td></tr></table></div>',
                variables: ['vessel_name', 'imo_number', 'certificate_number', 'issue_date', 'expiry_date'],
            },
            {
                name: 'Safety Construction Certificate',
                issuing_authority: 'CLASS', validity_years: 5,
                description: 'Certifies structural strength, subdivision, stability, machinery comply with SOLAS.',
                requires_survey: true,
                sections: [
                    {
                        title: 'Structural Strength', items: [
                            { code: 'STR-01', text: 'Hull girder strength assessment', type: 'PASS_FAIL' },
                            { code: 'STR-02', text: 'Frame and bracket condition', type: 'PASS_FAIL' },
                            { code: 'STR-03', text: 'Bulkhead watertight integrity', type: 'PASS_FAIL' },
                        ]
                    },
                    {
                        title: 'Machinery & Electrical', items: [
                            { code: 'MCH-01', text: 'Main engine condition and performance', type: 'PASS_FAIL' },
                            { code: 'MCH-02', text: 'Auxiliary engines operational', type: 'PASS_FAIL' },
                            { code: 'MCH-03', text: 'Emergency generator tested', type: 'PASS_FAIL' },
                            { code: 'MCH-04', text: 'Steering gear test (including emergency)', type: 'PASS_FAIL' },
                        ]
                    },
                    {
                        title: 'Stability & Subdivision', items: [
                            { code: 'STB-01', text: 'Stability information booklet onboard', type: 'YES_NO' },
                            { code: 'STB-02', text: 'Loading computer operational (if applicable)', type: 'YES_NO' },
                        ]
                    }
                ],
                requiredDocs: ['REGISTRY_CERTIFICATE', 'CLASS_SURVEY_REPORT', 'STABILITY_BOOKLET', 'ENGINE_LOG'],
                templateHtml: '<div style="font-family:serif;padding:40px"><h1 style="text-align:center">SAFETY CONSTRUCTION CERTIFICATE</h1><p style="text-align:center">Issued under SOLAS 1974</p><hr/><table style="width:100%"><tr><td><strong>Vessel:</strong></td><td>{{vessel_name}}</td></tr><tr><td><strong>IMO:</strong></td><td>{{imo_number}}</td></tr><tr><td><strong>Certificate No:</strong></td><td>{{certificate_number}}</td></tr><tr><td><strong>Issue Date:</strong></td><td>{{issue_date}}</td></tr><tr><td><strong>Expiry Date:</strong></td><td>{{expiry_date}}</td></tr></table></div>',
                variables: ['vessel_name', 'imo_number', 'certificate_number', 'issue_date', 'expiry_date'],
            },
        ];

        const certTypes = [];
        for (const ctd of certTypeData) {
            const ct = await db.CertificateType.create({
                name: ctd.name, issuing_authority: ctd.issuing_authority, validity_years: ctd.validity_years,
                status: 'ACTIVE', description: ctd.description, requires_survey: ctd.requires_survey,
            });
            await db.CertificateTemplate.create({
                certificate_type_id: ct.id,
                template_name: ctd.name + ' – Official Template v1',
                template_content: ctd.templateHtml,
                variables: ctd.variables, is_active: true,
            });
            await db.ChecklistTemplate.create({
                name: ctd.name + ' Survey Checklist',
                code: 'CHK-' + ctd.name.split(' ').map(w => w[0]).join('').toUpperCase() + '-001',
                description: `Comprehensive inspection checklist for ${ctd.name}.`,
                certificate_type_id: ct.id, sections: ctd.sections, status: 'ACTIVE',
                metadata: { version: '1.0', applicable_vessel_types: ['Bulk Carrier', 'Oil Tanker', 'Container Ship', 'Chemical Tanker', 'LPG Carrier', 'General Cargo'] },
                created_by: admin.id,
            });
            for (const docName of ctd.requiredDocs) {
                await db.CertificateRequiredDocument.create({
                    certificate_type_id: ct.id, document_name: docName,
                    is_mandatory: docName === 'REGISTRY_CERTIFICATE',
                });
            }
            certTypes.push(ct);
            console.log(`   ✓ "${ctd.name}" + Template + Checklist + ${ctd.requiredDocs.length} required docs`);
        }

        // ─────────────────────── PHASE 4: VESSELS ───────────────────────
        console.log('\n🚢 Phase 4 — Creating vessels …');

        const vesselData = [
            { vessel_name: 'MV Pacific Guardian', imo_number: '9876501', call_sign: 'V7AB1', mmsi_number: '538007101', port_of_registry: 'Singapore', year_built: 2018, ship_type: 'Bulk Carrier', gross_tonnage: 43250.00, net_tonnage: 25670.00, deadweight: 82150.00, class_status: 'ACTIVE', current_class_society: 'DNV', engine_type: 'MAN B&W 6S50MC-C', builder_name: 'Hyundai Heavy Industries', flag_idx: 0 },
            { vessel_name: 'MT Ocean Voyager', imo_number: '9876502', call_sign: 'H3BC2', mmsi_number: '538007102', port_of_registry: 'Majuro', year_built: 2015, ship_type: 'Oil Tanker', gross_tonnage: 61800.50, net_tonnage: 34200.00, deadweight: 115000.00, class_status: 'ACTIVE', current_class_society: 'Lloyd\'s Register', engine_type: 'Wartsila 7RT-flex68D', builder_name: 'Daewoo Shipbuilding', flag_idx: 1 },
            { vessel_name: 'MV Emerald Star', imo_number: '9876503', call_sign: 'A8CD3', mmsi_number: '538007103', port_of_registry: 'Monrovia', year_built: 2020, ship_type: 'Container Ship', gross_tonnage: 95400.00, net_tonnage: 55120.00, deadweight: 101500.00, class_status: 'ACTIVE', current_class_society: 'Bureau Veritas', engine_type: 'MAN B&W 11G95ME-C', builder_name: 'Samsung Heavy Industries', flag_idx: 2 },
            { vessel_name: 'MT Coral Breeze', imo_number: '9876504', call_sign: '9VEF4', mmsi_number: '538007104', port_of_registry: 'Singapore', year_built: 2019, ship_type: 'Chemical Tanker', gross_tonnage: 29750.75, net_tonnage: 15800.00, deadweight: 49500.00, class_status: 'ACTIVE', current_class_society: 'ABS', engine_type: 'MAN B&W 6G50ME-B', builder_name: 'Imabari Shipbuilding', flag_idx: 3 },
            { vessel_name: 'MV Northern Pioneer', imo_number: '9876505', call_sign: 'VRGH5', mmsi_number: '538007105', port_of_registry: 'Hong Kong', year_built: 2016, ship_type: 'Bulk Carrier', gross_tonnage: 38900.00, net_tonnage: 22450.00, deadweight: 75200.00, class_status: 'ACTIVE', current_class_society: 'ClassNK', engine_type: 'Wartsila 6RT-flex58T-D', builder_name: 'Oshima Shipbuilding', flag_idx: 4 },
            { vessel_name: 'MT Blue Horizon', imo_number: '9876506', call_sign: 'D5IJ6', mmsi_number: '538007106', port_of_registry: 'Majuro', year_built: 2021, ship_type: 'Oil Tanker', gross_tonnage: 82300.25, net_tonnage: 44100.00, deadweight: 158000.00, class_status: 'ACTIVE', current_class_society: 'DNV', engine_type: 'MAN B&W 7G80ME-C', builder_name: 'Hyundai Samho Heavy Industries', flag_idx: 1 },
            { vessel_name: 'MV Golden Carrier', imo_number: '9876507', call_sign: 'A8KL7', mmsi_number: '538007107', port_of_registry: 'Monrovia', year_built: 2017, ship_type: 'General Cargo', gross_tonnage: 18500.00, net_tonnage: 10200.00, deadweight: 28500.00, class_status: 'ACTIVE', current_class_society: 'RINA', engine_type: 'Wartsila 6L46F', builder_name: 'Tsuneishi Shipbuilding', flag_idx: 2 },
            { vessel_name: 'MV Atlantic Trader', imo_number: '9876508', call_sign: '9VMN8', mmsi_number: '538007108', port_of_registry: 'Singapore', year_built: 2022, ship_type: 'Container Ship', gross_tonnage: 141500.00, net_tonnage: 72850.00, deadweight: 143000.00, class_status: 'ACTIVE', current_class_society: 'Lloyd\'s Register', engine_type: 'Wartsila-Sulzer 12RT-flex96C', builder_name: 'Samsung Heavy Industries', flag_idx: 0 },
            { vessel_name: 'MT Ruby Belle', imo_number: '9876509', call_sign: 'VROP9', mmsi_number: '538007109', port_of_registry: 'Hong Kong', year_built: 2014, ship_type: 'Chemical Tanker', gross_tonnage: 23100.50, net_tonnage: 12600.00, deadweight: 37800.00, class_status: 'ACTIVE', current_class_society: 'ABS', engine_type: 'MAN B&W 6S46MC-C', builder_name: 'Shanghai Waigaoqiao Shipbuilding', flag_idx: 4 },
            { vessel_name: 'MV Jade Fortune', imo_number: '9876510', call_sign: 'H3QR0', mmsi_number: '538007110', port_of_registry: 'Majuro', year_built: 2023, ship_type: 'Bulk Carrier', gross_tonnage: 55800.00, net_tonnage: 31200.00, deadweight: 96300.00, class_status: 'ACTIVE', current_class_society: 'Bureau Veritas', engine_type: 'MAN B&W 6S60ME-C', builder_name: 'Japan Marine United', flag_idx: 1 },
            { vessel_name: 'MT Silver Wave', imo_number: '9876511', call_sign: 'D5ST1', mmsi_number: '538007111', port_of_registry: 'Monrovia', year_built: 2019, ship_type: 'LPG Carrier', gross_tonnage: 47200.75, net_tonnage: 24800.00, deadweight: 54100.00, class_status: 'ACTIVE', current_class_society: 'DNV', engine_type: 'MAN B&W 6G60ME-C', builder_name: 'Mitsubishi Heavy Industries', flag_idx: 2 },
            { vessel_name: 'MV Iron Monarch', imo_number: '9876512', call_sign: '9VUV2', mmsi_number: '538007112', port_of_registry: 'Singapore', year_built: 2013, ship_type: 'Bulk Carrier', gross_tonnage: 92600.00, net_tonnage: 53400.00, deadweight: 181000.00, class_status: 'ACTIVE', current_class_society: 'ClassNK', engine_type: 'MAN B&W 7S80ME-C', builder_name: 'Namura Shipbuilding', flag_idx: 3 },
        ];

        const vessels = [];
        for (const vd of vesselData) {
            const { flag_idx, ...vesselFields } = vd;
            vessels.push(await db.Vessel.create({ ...vesselFields, client_id: client.id, flag_administration_id: flags[flag_idx].id }));
        }
        console.log(`   ✓ ${vessels.length} vessels created (all fields populated)`);

        // ─────────────────────── PHASE 5: JOBS with REAL LIFECYCLE FLOW ───────────────────────
        console.log('\n📝 Phase 5 — Creating jobs using REAL lifecycle transitions …\n');

        const ports = ['Port of Singapore', 'Port of Busan', 'Port of Shanghai', 'Port of Rotterdam', 'Port of Piraeus', 'Port of Houston', 'Port of Fujairah', 'Port of Mumbai'];
        const reasons = ['Annual Survey', 'Periodic Renewal', 'Intermediate Survey', 'Initial Certification', 'Special Survey', 'Post-Incident Survey'];

        // Target statuses — each job will walk through the ENTIRE chain via lifecycle service
        const jobPlan = [
            { targetStatus: 'CREATED', count: 3 },
            { targetStatus: 'DOCUMENT_VERIFIED', count: 2 },
            { targetStatus: 'APPROVED', count: 2 },
            { targetStatus: 'ASSIGNED', count: 3 },
            { targetStatus: 'SURVEY_AUTHORIZED', count: 2 },
            { targetStatus: 'IN_PROGRESS', count: 3 },
            { targetStatus: 'SURVEY_DONE', count: 2 },
            { targetStatus: 'REVIEWED', count: 2 },
            { targetStatus: 'FINALIZED', count: 3 },
            { targetStatus: 'REWORK_REQUESTED', count: 2 },
            { targetStatus: 'PAYMENT_DONE', count: 2 },
            { targetStatus: 'CERTIFIED', count: 3 },
            { targetStatus: 'REJECTED', count: 1 },
        ];

        let jobIdx = 0;
        let certSeq = 1000;

        for (const plan of jobPlan) {
            for (let i = 0; i < plan.count; i++) {
                const vessel = vessels[jobIdx % vessels.length];
                const certType = certTypes[jobIdx % certTypes.length];
                const port = ports[jobIdx % ports.length];
                const reason = reasons[jobIdx % reasons.length];

                await runJobThroughFlow({
                    vessel, certType, port, reason,
                    targetStatus: plan.targetStatus,
                    clientUser, admin, tm, surveyor,
                    certSeq: ++certSeq,
                    jobIdx,
                });

                jobIdx++;
            }
            console.log(`   ✅ ${plan.count} jobs created → target: ${plan.targetStatus}`);
        }

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║     ✅  FRESH SEED COMPLETED SUCCESSFULLY!           ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log(`║  Flag Administrations : ${flags.length}                          ║`);
        console.log(`║  Certificate Types    : ${certTypes.length}                          ║`);
        console.log(`║  Vessels              : ${vessels.length}                         ║`);
        console.log(`║  Total Jobs           : ${jobIdx}                         ║`);
        console.log('╚══════════════════════════════════════════════════════╝\n');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ FRESH SEED FAILED:', err);
        process.exit(1);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Run a single job through the REAL lifecycle flow up to the targetStatus
   ═══════════════════════════════════════════════════════════════════════════ */

async function runJobThroughFlow({ vessel, certType, port, reason, targetStatus, clientUser, admin, tm, surveyor, certSeq, jobIdx }) {

    // ──────── STEP 1: Create job (always starts at CREATED) ────────
    const job = await db.JobRequest.create({
        vessel_id: vessel.id,
        requested_by_user_id: clientUser.id,
        certificate_type_id: certType.id,
        reason,
        target_port: port,
        target_date: new Date(Date.now() + (15 + jobIdx * 5) * 24 * 60 * 60 * 1000),
        job_status: 'CREATED',
        is_survey_required: true,
        priority: ['NORMAL', 'NORMAL', 'HIGH', 'URGENT', 'LOW'][jobIdx % 5],
    });

    // Initial history for CREATED
    await db.JobStatusHistory.create({
        job_id: job.id,
        previous_status: null,
        new_status: 'CREATED',
        changed_by: clientUser.id,
        reason: 'Job request submitted by client',
    });

    if (targetStatus === 'CREATED') return;

    // ──────── SPECIAL: REJECTED (from CREATED) ────────
    if (targetStatus === 'REJECTED') {
        await lifecycleService.updateJobStatus(job.id, 'REJECTED', admin.id, 'Admin rejected — insufficient documentation');
        return;
    }

    // ──────── STEP 2: CREATED → DOCUMENT_VERIFIED ────────
    await lifecycleService.updateJobStatus(job.id, 'DOCUMENT_VERIFIED', admin.id, 'Technical Officer verified all documents');
    if (targetStatus === 'DOCUMENT_VERIFIED') return;

    // ──────── STEP 3: DOCUMENT_VERIFIED → APPROVED ────────
    await lifecycleService.updateJobStatus(job.id, 'APPROVED', admin.id, 'Admin approved the job request');
    await job.update({ approved_by_user_id: admin.id });
    if (targetStatus === 'APPROVED') return;

    // ──────── STEP 4: APPROVED → ASSIGNED (set surveyor first, then transition) ────────
    await job.update({ assigned_surveyor_id: surveyor.id, assigned_by_user_id: admin.id });
    await lifecycleService.updateJobStatus(job.id, 'ASSIGNED', admin.id, `Surveyor ${surveyor.name} assigned`);
    if (targetStatus === 'ASSIGNED') return;

    // ──────── STEP 5: ASSIGNED → SURVEY_AUTHORIZED ────────
    await lifecycleService.updateJobStatus(job.id, 'SURVEY_AUTHORIZED', tm.id, 'TM authorized the survey');
    if (targetStatus === 'SURVEY_AUTHORIZED') return;

    // ──────── From here, SURVEY drives the job status ────────

    // Find the survey that was auto-provisioned by lifecycle
    const survey = await db.Survey.findOne({ where: { job_id: job.id } });
    if (!survey) throw new Error(`Survey not created for job ${job.id} — lifecycle issue`);

    // ──────── STEP 6: Survey NOT_STARTED → STARTED (auto-syncs job → IN_PROGRESS) ────────
    await lifecycleService.updateSurveyStatus(survey.id, 'STARTED', surveyor.id, 'Surveyor commenced on-site inspection');
    if (targetStatus === 'IN_PROGRESS') return;

    // ──────── STEP 7: Survey STARTED → CHECKLIST_SUBMITTED ────────
    await lifecycleService.updateSurveyStatus(survey.id, 'CHECKLIST_SUBMITTED', surveyor.id, 'All checklist items completed');

    // ──────── STEP 8: Survey CHECKLIST_SUBMITTED → PROOF_UPLOADED ────────
    await lifecycleService.updateSurveyStatus(survey.id, 'PROOF_UPLOADED', surveyor.id, 'Evidence files uploaded');

    // ──────── STEP 9: Populate survey fields required for SUBMITTED guard ────────
    await survey.update({
        attendance_photo_url: `surveys/attendance_${job.id}.jpg`,
        signature_url: `surveys/signature_${job.id}.png`,
        evidence_proof_url: `surveys/evidence_${job.id}.pdf`,
        survey_statement: 'I hereby declare that the above survey has been conducted in accordance with all applicable international conventions and class society requirements.',
        submit_latitude: 1.2644 + (Math.random() * 0.05),
        submit_longitude: 103.8200 + (Math.random() * 0.05),
    });

    // ──────── STEP 10: Survey PROOF_UPLOADED → SUBMITTED (auto-syncs job → SURVEY_DONE) ────────
    await lifecycleService.updateSurveyStatus(survey.id, 'SUBMITTED', surveyor.id, 'Survey report submitted for review');
    if (targetStatus === 'SURVEY_DONE') return;

    // ──────── REWORK PATH: SURVEY_DONE → REWORK_REQUESTED (auto-syncs survey → REWORK_REQUIRED) ────────
    if (targetStatus === 'REWORK_REQUESTED') {
        await lifecycleService.updateJobStatus(job.id, 'REWORK_REQUESTED', tm.id, 'TM requested corrections in survey findings');
        return;
    }

    // ──────── STEP 11: Job SURVEY_DONE → REVIEWED ────────
    await lifecycleService.updateJobStatus(job.id, 'REVIEWED', admin.id, 'TO reviewed the survey report');
    if (targetStatus === 'REVIEWED') return;

    // ──────── STEP 12: Survey SUBMITTED → FINALIZED (auto-syncs job → FINALIZED) ────────
    // Re-fetch survey to get latest status
    await survey.reload();
    await lifecycleService.updateSurveyStatus(survey.id, 'FINALIZED', tm.id, 'TM approved and finalized survey report');

    // ──────── STEP 13: Generate Certificate for finalized jobs ────────
    const certNumber = `GIRIK-${certType.name.split(' ').map(w => w[0]).join('').toUpperCase()}-${new Date().getFullYear()}-${String(certSeq).padStart(5, '0')}`;
    const issueDate = new Date();
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + certType.validity_years);

        const cert = await db.Certificate.create({
            vessel_id: vessel.id,
            certificate_type_id: certType.id,
            certificate_number: certNumber,
            issue_date: issueDate.toISOString().split('T')[0],
            expiry_date: expiryDate.toISOString().split('T')[0],
            status: 'VALID',
            issued_by_user_id: tm.id,
            qr_code_url: `certificates/qr_${certNumber}.png`,
            pdf_file_url: `certificates/${certNumber}.pdf`,
        });

    await job.update({ generated_certificate_id: cert.id });

    await db.CertificateHistory.create({
        certificate_id: cert.id,
        status: 'VALID',
        changed_by_user_id: tm.id,
        change_reason: 'Certificate issued upon survey finalization',
        changed_at: issueDate,
    });

    if (targetStatus === 'FINALIZED') return;

    // ──────── STEP 14: FINALIZED → PAYMENT_DONE ────────
    await db.Payment.create({
        job_id: job.id,
        invoice_number: `INV-${new Date().getFullYear()}-${String(certSeq).padStart(5, '0')}`,
        amount: 2500.00 + (Math.random() * 5000),
        currency: 'USD',
        payment_status: 'PAID',
        payment_date: new Date(),
        receipt_url: `payments/receipt_${job.id}.pdf`,
        verified_by_user_id: admin.id,
    });

    await lifecycleService.updateJobStatus(job.id, 'PAYMENT_DONE', admin.id, 'Payment received and verified');
    if (targetStatus === 'PAYMENT_DONE') return;

    // ──────── STEP 15: PAYMENT_DONE → CERTIFIED ────────
    await lifecycleService.updateJobStatus(job.id, 'CERTIFIED', admin.id, 'Certificate issued and job closed');
}

freshSeed();
