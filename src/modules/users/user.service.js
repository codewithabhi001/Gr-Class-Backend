import db from '../../models/index.js';
import * as authService from '../auth/auth.service.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import * as s3Service from '../../services/s3.service.js';

const User = db.User;

export const getUsers = async (query, excludeId) => {
    const { role } = query;
    const where = {};

    if (excludeId) {
        where.id = { [db.Sequelize.Op.ne]: excludeId };
    }

    if (role) {
        where.role = role;
    }

    const users = await User.findAll({
        where,
        attributes: { exclude: ['password_hash'] }
    });

    return await fileAccessService.resolveEntity(users);
};

export const getProfile = async (id, role) => {
    const include = [];
    if (role === 'CLIENT') {
        include.push({ model: db.Client });
    } else if (role === 'SURVEYOR') {
        include.push({ model: db.SurveyorProfile });
    }
    const user = await User.findByPk(id, {
        include,
        attributes: { exclude: ['password_hash'] }
    });

    if (!user) return null;
    return await fileAccessService.resolveEntity(user);
};

export const createUser = async (data) => {
    return await authService.register(data);
};

export const updateUser = async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    if (data.email && data.email !== user.email) {
        const existing = await User.findOne({ where: { email: data.email } });
        if (existing) {
            throw { statusCode: 400, message: 'Another user with this email already exists' };
        }
    }

    await user.update(data);
    return user;
};

export const updateStatus = async (id, status) => {
    const user = await User.findByPk(id);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    await user.update({ status });
    return user;
};

export const deleteUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    await user.update({ status: 'DELETED' }); // Soft delete
    return { message: 'User deleted' };
};

export const updateFcmToken = async (id, fcmToken) => {
    const user = await User.findByPk(id);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    await user.update({ fcm_token: fcmToken });
    return { success: true };
};

export const updateProfilePic = async (userId, file, data = {}) => {
    const user = await User.findByPk(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    let profilePicUrl = data.profilePicKey || null;
    if (file) {
        profilePicUrl = await s3Service.uploadFile(file.buffer, file.originalname, file.mimetype, s3Service.UPLOAD_FOLDERS.USER_DOCS || 'users/docs');
    }

    if (!profilePicUrl) {
        throw { statusCode: 400, message: 'Profile picture file or key is required.' };
    }

    await user.update({ profile_pic_url: profilePicUrl });
    return await fileAccessService.resolveEntity(user);
};
