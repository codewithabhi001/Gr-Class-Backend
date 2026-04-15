import 'dotenv/config';
import db from '../src/models/index.js';

const ensureClient = async () => {
  const [client] = await db.Client.findOrCreate({
    where: { company_name: 'Pacific Shipping Ltd' },
    defaults: {
      company_code: 'PACIFIC',
      email: 'ops@pacific.com',
      status: 'ACTIVE',
    },
  });
  return client;
};

const ensureFlagAdministration = async () => {
  const [flag] = await db.FlagAdministration.findOrCreate({
    where: { flag_state_name: 'Panama' },
    defaults: {
      country: 'Panama',
      authority_name: 'Panama Maritime Authority',
      contact_email: 'info@pma.pa',
      authorization_scope: 'Auto-seeded for local development',
      status: 'ACTIVE',
    },
  });
  return flag;
};

const main = async () => {
  const client = await ensureClient();
  const flag = await ensureFlagAdministration();

  // Use a deterministic IMO so re-running is safe.
  const IMO = '1234567';

  const [vessel, created] = await db.Vessel.findOrCreate({
    where: { imo_number: IMO },
    defaults: {
      vessel_name: 'MV GR-Workshop',
      client_id: client.id,
      flag_administration_id: flag.id,
      call_sign: 'GRWK',
      mmsi_number: '123456789',
      port_of_registry: 'Panama',
      year_built: 2010,
      ship_type: 'Cargo',
      class_status: 'ACTIVE',
      current_class_society: 'GR-Class',
    },
  });

  if (!created) {
    await vessel.update({
      client_id: client.id,
      flag_administration_id: flag.id,
    });
  }

  console.log(
    JSON.stringify(
      {
        created,
        vessel: vessel.get({ plain: true }),
        client: { id: client.id, company_name: client.company_name },
        flag: { id: flag.id, flag_state_name: flag.flag_state_name },
      },
      null,
      2,
    ),
  );
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close().catch(() => {});
  });

