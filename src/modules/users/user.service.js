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
        attributes: ['id', 'name', 'email', 'role', 'status', 'created_at', 'profile_pic_url', 'phone', 'last_login_at']
    });
    users.map(user => {
        if (!user.profile_pic_url) {
            user.profile_pic_url = 'N/A';
        }
        if (!user.phone) {
            user.phone = 'N/A';
        }
        if (!user.last_login_at) {
            user.last_login_at = 'N/A';
        }
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
        const folder = s3Service.UPLOAD_FOLDERS.USER_DOCS || 'users/docs';
        profilePicUrl = s3Service.generateKey(file.originalname, folder);
        s3Service.uploadFile(file.buffer, file.originalname, file.mimetype, '', profilePicUrl)
            .catch(err => console.error('Background S3 upload error (updateProfilePic):', err));
    }

    if (!profilePicUrl) {
        throw { statusCode: 400, message: 'Profile picture file or key is required.' };
    }

    await user.update({ profile_pic_url: profilePicUrl });
    return await fileAccessService.resolveEntity(user);
};

export const updateSelfProfile = async (id, role, data) => {
    const user = await User.findByPk(id);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    // Update basic user fields
    const userUpdates = {};
    if (data.name) userUpdates.name = data.name;
    if (data.phone) userUpdates.phone = data.phone;

    if (Object.keys(userUpdates).length > 0) {
        await user.update(userUpdates);
    }

    // Handle Client specific profile update
    if (role === 'CLIENT' && user.client_id) {
        const client = await db.Client.findByPk(user.client_id);
        if (client) {
            const clientUpdates = {};
            if (data.contact_person_name) clientUpdates.contact_person_name = data.contact_person_name;
            if (data.contact_person_email) clientUpdates.contact_person_email = data.contact_person_email;
            if (data.address) clientUpdates.address = data.address;
            if (data.phone) clientUpdates.phone = data.phone;

            if (Object.keys(clientUpdates).length > 0) {
                await client.update(clientUpdates);
            }
        }
    }
    // Handle Surveyor specific profile update
    else if (role === 'SURVEYOR') {
        const profile = await db.SurveyorProfile.findOne({ where: { user_id: id } });
        if (profile) {
            const profileUpdates = {};
            if (data.nationality) profileUpdates.nationality = data.nationality;
            if (data.qualification) profileUpdates.qualification = data.qualification;
            if (data.years_of_experience) profileUpdates.years_of_experience = data.years_of_experience;

            if (Object.keys(profileUpdates).length > 0) {
                await profile.update(profileUpdates);
            }
        }
    }

    return await getProfile(id, role);
};
