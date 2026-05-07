import db from './src/models/index.js';

const authorities = [
    {
        name: 'GR Class',
        code: 'GRC',
        country: 'India',
        status: 'ACTIVE'
    },
    {
        name: 'American Bureau of Shipping',
        code: 'ABS',
        country: 'USA',
        status: 'ACTIVE'
    },
    {
        name: 'Lloyd\'s Register',
        code: 'LR',
        country: 'UK',
        status: 'ACTIVE'
    },
    {
        name: 'Bureau Veritas',
        code: 'BV',
        country: 'France',
        status: 'ACTIVE'
    },
    {
        name: 'DNV',
        code: 'DNV',
        country: 'Norway',
        status: 'ACTIVE'
    },
    {
        name: 'Indian Register of Shipping',
        code: 'IRS',
        country: 'India',
        status: 'ACTIVE'
    },
    {
        name: 'Panama Maritime Authority',
        code: 'PMA',
        country: 'Panama',
        status: 'ACTIVE'
    }
];

const seed = async () => {
    try {
        console.log('Seeding Certificate Authorities...');
        for (const auth of authorities) {
            const [instance, created] = await db.CertificateAuthority.findOrCreate({
                where: { code: auth.code },
                defaults: auth
            });
            if (created) {
                console.log(`Created: ${auth.name}`);
            } else {
                console.log(`Already exists: ${auth.name}`);
            }
        }
        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding authorities:', error);
        process.exit(1);
    }
};

seed();
