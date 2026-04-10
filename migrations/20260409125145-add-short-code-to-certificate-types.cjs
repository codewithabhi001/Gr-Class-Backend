'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column already exists to avoid errors on retry
    const tableInfo = await queryInterface.describeTable('certificate_types');
    if (!tableInfo.short_code) {
      await queryInterface.addColumn('certificate_types', 'short_code', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'name'
      });
    }

    // Populate some default short codes for common types individually
    const mappings = {
      'SC': '%Safety Construction%',
      'SE': '%Safety Equipment%',
      'SR': '%Safety Radio%',
      'LL': '%Load Line%',
      'IOPP': '%Pollution%',
      'TM': '%Tonnage%',
      'DOC': '%Document of Compliance%',
      'SMC': '%Safety Management%',
      'ISSC': '%Security%'
    };

    for (const [code, pattern] of Object.entries(mappings)) {
      await queryInterface.sequelize.query(
        `UPDATE certificate_types SET short_code = :code WHERE name LIKE :pattern AND short_code IS NULL`,
        { replacements: { code, pattern }, type: Sequelize.QueryTypes.UPDATE }
      );
    }
    
    // Fallback for others - use first 3 chars of name
    await queryInterface.sequelize.query(`
      UPDATE certificate_types SET short_code = UPPER(SUBSTRING(name, 1, 3)) WHERE short_code IS NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('certificate_types', 'short_code');
  }
};
