import db from '../src/models/index.js';
const { JobRequest, Vessel, JobCertificate, CertificateType } = db;

(async () => {
  try {
    const res = await JobRequest.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
          { model: Vessel, attributes: ['vessel_name'] },
          { model: JobCertificate, as: 'certificates', include: [{ model: CertificateType, attributes: ['name'] }] }
      ]
    });
    console.log("Success! Fetched jobs:", res.length);
  } catch (err) {
    console.error("Error running query:", err);
    if (err.parent) {
      console.error("Parent SQL:", err.parent.sql);
    }
  } finally {
    process.exit(0);
  }
})();
