import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique random ID with a prefix by checking against a Sequelize model.
 * @param {string} prefix - The prefix (e.g., 'GRJ', 'CERT')
 * @param {Object} Model - The Sequelize model to check for uniqueness
 * @param {string} fieldName - The field name to check for uniqueness
 * @param {number} length - Random part length (default 8)
 * @returns {Promise<string>}
 */
export const generateUniqueRandomId = async (prefix, Model, fieldName, length = 6) => {

    if (!Model) throw new Error('Model is required for unique ID generation');

    let isUnique = false;
    let generatedId;

    while (!isUnique) {
        // Use part of UUID for randomness
        const randomStr = uuidv4().replace(/-/g, '').substring(0, length).toUpperCase();
        generatedId = prefix ? `${prefix}-${randomStr}` : randomStr;
        const existing = await Model.findOne({ where: { [fieldName]: generatedId } });

        if (!existing) {
            isUnique = true;
        }
    }

    return generatedId;
};