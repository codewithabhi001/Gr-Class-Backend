import db from '../../models/index.js';
const FlagAdministration = db.FlagAdministration;

export const createFlag = async (data) => {
    return await FlagAdministration.create(data);
};

export const getFlags = async () => {
    return await FlagAdministration.findAll({
        attributes: [
            'id',
            'flag_state_name',
            'country',
            'authority_name',
            'contact_email',
            'logo_url',
            'status'
        ]
    });
};
export const getFlag = async (id) => {
    return await FlagAdministration.findByPk(id);
};  

export const updateFlag = async (id, data) => {
    const flag = await FlagAdministration.findByPk(id);
    if (!flag) throw { statusCode: 404, message: 'Flag not found' };
    return await flag.update(data);
};
