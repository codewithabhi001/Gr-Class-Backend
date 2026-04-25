import 'dotenv/config';
import db from '../src/models/index.js';

const main = async () => {
    const types = await db.CertificateType.findAll({
        attributes: ['name', 'short_code']
    });
    console.log(JSON.stringify(types, null, 2));
};

main()
    .catch(console.error)
    .finally(async () => {
        await db.sequelize.close().catch(() => {});
    });
