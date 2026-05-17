import db from '../../models/index.js';
import { resolveEntity } from '../../services/fileAccess.service.js';

const FlagAdministration = db.FlagAdministration;

export const createFlag = async (data) => {
    const flag = await FlagAdministration.create(data);
    return await resolveEntity(flag);
};

export const getFlags = async () => {
    const list = await FlagAdministration.findAll({
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
    return await resolveEntity(list);
};

export const getFlag = async (id) => {
    const flag = await FlagAdministration.findByPk(id);
    return await resolveEntity(flag);
};  

export const updateFlag = async (id, data) => {
    const flag = await FlagAdministration.findByPk(id);
    if (!flag) throw { statusCode: 404, message: 'Flag not found' };
    const updated = await flag.update(data);
    return await resolveEntity(updated);
};

