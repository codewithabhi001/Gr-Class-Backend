import db from '../src/models/index.js';

const verify = async () => {
    const user = await db.User.findOne({ where: { email: 'ops@pacific.com' } });
    if (user) {
        console.log('User found:', user.email, 'Role:', user.role);
    } else {
        console.log('User NOT found');
    }
    process.exit(0);
};

verify();
