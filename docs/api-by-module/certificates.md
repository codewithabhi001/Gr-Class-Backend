# Certificates Module API (Actual)

Source YAML: `src/docs/paths/certificates.yaml`

## Routes

### 1. GET /api/v1/certificates/verify/{number}
- Summary: Verify certificate (public)
- Operation ID: `verifyCertificate`
- Access Roles: PUBLIC
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `number` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[number], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Certificate verified (application/json => object)
- `404`: Certificate not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:14`
- Controller: `src/modules/certificates/certificate.controller.js:312`
- Service: `src/modules/certificates/certificate.service.js:1011` (`certService.verifyCertificate`)
- Models touched: Certificate.findOne
- Service returns (detected): {
        valid: ['VALID', 'ISSUED'].includes(cert.status) && new Date(cert.expiry_date) >= new Date().setHours(0, 0, 0, 0),
        certificate: {
            certificate_number: cert.certificate_number,
            status: cert.status,
            issue_date: cert.issue_date,
            expiry_date: cert.expiry_date,
            vessel_name: cert.Vessel?.vessel_name,
            imo_number: cert.Vessel?.imo_number,
            certificate_type: cert.CertificateType?.name,
            issuing_authority: cert.Authority?.name,
            flag_state: cert.FlagState?.flag_state_name,
            issued_by: cert.issuer ? `${cert.issuer.first_name} ${cert.issuer.last_name}` : 'GR CLASS'
        },
        pdf_url: pdfUrl
    }

### 2. GET /api/v1/certificates
- Summary: List certificates
- Operation ID: `getCertificates`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of certificates (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificates fetched successfully',
            data: certs
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:31`
- Controller: `src/modules/certificates/certificate.controller.js:14`
- Service: `src/modules/certificates/certificate.service.js:549` (`certService.getCertificates`)
- Models touched: Certificate.findAndCountAll
- Service returns (detected): await Certificate.findAndCountAll({
        where,
        attributes: ['id', 'vessel_id', 'certificate_type_id', 'certificate_number', 'issue_date', 'expiry_date', 'status', 'createdAt'],
        limit: Math.min(parseInt(limit, 10) || 10, 100),
        offset: (Math.max(1, parseInt(page, 10)) - 1) * (parseInt(limit, 10) || 10),
        include: [{ model: db.Vessel, attributes: ['id', 'vessel_name', 'imo_number'] }, { model: db.CertificateType, attributes: ['id', 'name'] }],
    })

### 3. POST /api/v1/certificates
- Summary: Generate certificate
- Operation ID: `generateCertificate`
- Access Roles: GM, TM
- Change Access: GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/GenerateCertificateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Certificate generated (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate generated successfully',
            data: cert
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:48`
- Controller: `src/modules/certificates/certificate.controller.js:3`
- Service: `src/modules/certificates/certificate.service.js:244` (`certService.generateCertificate`)
- Models touched: JobRequest.findByPk, Payment.findOne, Survey.findOne, Certificate.findOne, NonConformity.count, Certificate.create, AuditLog.create, CertificateTemplate.findOne, CertificateAuthority.findByPk, FlagAdministration.findByPk, Certificate.findByPk, Vessel.findByPk, User.findAll, User.findByPk
- Service returns (detected): finalCert

### 4. GET /api/v1/certificates/upload-url
- Summary: Get presigned URL for certificate upload
- Operation ID: `getCertificateUploadUrl`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Presigned URL generated (application/json => object)
- Controller response envelope(s):
```js
{ success: false, message: 'fileName and contentType are required' }
```
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:36`
- Controller: `src/modules/certificates/certificate.controller.js:158`
- Service: `src/modules/certificates/certificate.service.js:854` (`certService.getCertificateUploadUrl`)
- Models touched: N/A
- Service returns (detected): { uploadUrl, key }

### 5. POST /api/v1/certificates/vessel/{vesselId}/external
- Summary: Upload external certificate
- Operation ID: `uploadExternalCertificate`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `vesselId` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/UploadExternalCertificateRequest
- Req usage in controller: params=[vesselId], query=[], body=[], user=[id], files=[]
- Validation schema key: `uploadExternalCertificate`
- Joi schema source: `src/middlewares/validate.middleware.js:522`
```js
Joi.object({
        certificate_type_id: Joi.string().guid().required(),
        certificate_authority_id: Joi.string().guid().optional().allow(null),
        certificate_number: Joi.string().required(),
        issue_date: Joi.date().iso().required(),
        expiry_date: Joi.date().iso().required(),
        s3_key: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `201`: External certificate uploaded (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'External certificate uploaded successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:39`
- Controller: `src/modules/certificates/certificate.controller.js:169`
- Service: `src/modules/certificates/certificate.service.js:860` (`certService.uploadExternalCertificate`)
- Models touched: Certificate.create, CertificateHistory.create
- Service returns (detected): cert

### 6. GET /api/v1/certificates/types
- Summary: List certificate types (minimal)
- Operation ID: `getCertificateTypes`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `include_inactive` (query, optional, boolean)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[include_inactive], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Minimal list of certificate types (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: types }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:19`
- Controller: `src/modules/certificates/certificate.controller.js:248`
- Service: `src/modules/certificates/certificate.service.js:49` (`certService.getCertificateTypes`)
- Models touched: CertificateType.findAll
- Service returns (detected): await CertificateType.findAll({
        where,
        attributes: ['id', 'name', 'issuing_authority', 'validity_years', 'status', 'requires_survey'],
        order: [['name', 'ASC']],
    })

### 7. POST /api/v1/certificates/types
- Summary: Create certificate type
- Operation ID: `createCertificateType`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/CertificateTypeCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `createCertificateType`
- Joi schema source: `src/middlewares/validate.middleware.js:237`
```js
Joi.object({
        name: Joi.string().required().trim(),
        issuing_authority: Joi.string().valid('CLASS', 'FLAG').required(),
        validity_years: Joi.number().integer().min(1).max(10).required(),
        status: Joi.string().valid('ACTIVE', 'INACTIVE').optional().default('ACTIVE'),
        description: Joi.string().allow('', null).optional(),
        requires_survey: Joi.boolean().optional().default(true),
        required_documents: Joi.array().items(Joi.object({
            document_name: Joi.string().required(),
            is_mandatory: Joi.boolean().optional().default(true)
        })).optional()
    })
```

Response (Actual)
- YAML response map:
- `201`: Certificate type created (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `409`: A certificate type with this name already exists (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Certificate type created', data: type }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:20`
- Controller: `src/modules/certificates/certificate.controller.js:263`
- Service: `src/modules/certificates/certificate.service.js:73` (`certService.createCertificateType`)
- Models touched: CertificateType.findOne, CertificateType.create, CertificateRequiredDocument.bulkCreate, CertificateType.findByPk
- Service returns (detected): await CertificateType.findByPk(type.id, {
            include: [{ model: db.CertificateRequiredDocument, attributes: ['id', 'document_name', 'is_mandatory'] }]
        })

### 8. GET /api/v1/certificates/types/{id}
- Summary: Get certificate type detail (with required documents)
- Operation ID: `getCertificateTypeById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Certificate type detail with required documents (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: type }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:21`
- Controller: `src/modules/certificates/certificate.controller.js:256`
- Service: `src/modules/certificates/certificate.service.js:59` (`certService.getCertificateTypeById`)
- Models touched: CertificateType.findByPk
- Service returns (detected): type

### 9. PUT /api/v1/certificates/types/{id}
- Summary: Update certificate type
- Operation ID: `updateCertificateType`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertificateTypeUpdateRequest
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `updateCertificateType`
- Joi schema source: `src/middlewares/validate.middleware.js:249`
```js
Joi.object({
        name: Joi.string().optional().trim(),
        issuing_authority: Joi.string().valid('CLASS', 'FLAG').optional(),
        validity_years: Joi.number().integer().min(1).max(10).optional(),
        status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
        description: Joi.string().allow('', null).optional(),
        requires_survey: Joi.boolean().optional(),
        required_documents: Joi.array().items(Joi.object({
            document_name: Joi.string().required(),
            is_mandatory: Joi.boolean().optional().default(true)
        })).optional()
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate type updated (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Certificate type updated', data: type }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:22`
- Controller: `src/modules/certificates/certificate.controller.js:270`
- Service: `src/modules/certificates/certificate.service.js:109` (`certService.updateCertificateType`)
- Models touched: CertificateType.findByPk, CertificateType.findOne, CertificateRequiredDocument.destroy, CertificateRequiredDocument.bulkCreate
- Service returns (detected): await CertificateType.findByPk(id, {
            include: [{ model: db.CertificateRequiredDocument, attributes: ['id', 'document_name', 'is_mandatory'] }]
        })

### 10. GET /api/v1/certificates/types/{id}/required-documents
- Summary: List required documents for a certificate type
- Operation ID: `getCertificateTypeRequiredDocuments`
- Access Roles: ADMIN, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Required documents list (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: docs }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:25`
- Controller: `src/modules/certificates/certificate.controller.js:277`
- Service: `src/modules/certificates/certificate.service.js:147` (`certService.getCertificateTypeRequiredDocuments`)
- Models touched: CertificateType.findByPk, CertificateRequiredDocument.findAll
- Service returns (detected): await db.CertificateRequiredDocument.findAll({
        where: { certificate_type_id: certificateTypeId },
        attributes: ['id', 'certificate_type_id', 'document_name', 'is_mandatory', 'createdAt', 'updatedAt'],
        order: [['document_name', 'ASC']],
    })

### 11. POST /api/v1/certificates/types/{id}/required-documents
- Summary: Add required document for a certificate type
- Operation ID: `addCertificateTypeRequiredDocument`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertificateRequiredDocumentCreateRequest
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `addCertificateTypeRequiredDocument`
- Joi schema source: `src/middlewares/validate.middleware.js:261`
```js
Joi.object({
        document_name: Joi.string().required().trim(),
        is_mandatory: Joi.boolean().optional().default(true),
    })
```

Response (Actual)
- YAML response map:
- `201`: Required document created (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Required document already exists (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Required document added', data: doc }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:26`
- Controller: `src/modules/certificates/certificate.controller.js:284`
- Service: `src/modules/certificates/certificate.service.js:161` (`certService.addCertificateTypeRequiredDocument`)
- Models touched: CertificateType.findByPk, CertificateRequiredDocument.findOne, CertificateRequiredDocument.create
- Service returns (detected): await db.CertificateRequiredDocument.create({
        certificate_type_id: certificateTypeId,
        document_name: name,
        is_mandatory: data.is_mandatory ?? true,
    })

### 12. PUT /api/v1/certificates/types/{id}/required-documents/{docId}
- Summary: Update required document for a certificate type
- Operation ID: `updateCertificateTypeRequiredDocument`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- `docId` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertificateRequiredDocumentUpdateRequest
- Req usage in controller: params=[id, docId], query=[], body=[], user=[], files=[]
- Validation schema key: `updateCertificateTypeRequiredDocument`
- Joi schema source: `src/middlewares/validate.middleware.js:265`
```js
Joi.object({
        document_name: Joi.string().optional().trim(),
        is_mandatory: Joi.boolean().optional(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Required document updated (application/json => object)
- `400`: Validation error / wrong type mapping (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Document not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Duplicate document name (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Required document updated', data: doc }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:27`
- Controller: `src/modules/certificates/certificate.controller.js:291`
- Service: `src/modules/certificates/certificate.service.js:179` (`certService.updateCertificateTypeRequiredDocument`)
- Models touched: CertificateRequiredDocument.findByPk, CertificateRequiredDocument.findOne
- Service returns (detected): doc

### 13. DELETE /api/v1/certificates/types/{id}/required-documents/{docId}
- Summary: Delete required document for a certificate type
- Operation ID: `deleteCertificateTypeRequiredDocument`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- `docId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id, docId], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Deleted (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Document not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Cannot delete (document already used in jobs) (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Required document deleted', data: result }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:28`
- Controller: `src/modules/certificates/certificate.controller.js:298`
- Service: `src/modules/certificates/certificate.service.js:206` (`certService.deleteCertificateTypeRequiredDocument`)
- Models touched: CertificateRequiredDocument.findByPk, JobDocument.count
- Service returns (detected): { deleted: true }

### 14. POST /api/v1/certificates/bulk-renew
- Summary: Bulk renew certificates
- Operation ID: `bulkRenewCertificates`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Bulk renewal completed
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 15. GET /api/v1/certificates (expiring filter)
- Use list endpoint with query `expiring_within_days=30` (and optional `status`, `vessel_id`, etc.).
- Defaults to `VALID` certificates when `expiring_within_days` is set and `status` is omitted.

### 16. GET /api/v1/certificates/job/{jobId}
- Summary: Get certificate by job ID
- Operation ID: `getCertificateByJobId`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Certificate details (application/json => object)
- `404`: Job not found or certificate not yet generated (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate for job fetched successfully',
            data: cert
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:45`
- Controller: `src/modules/certificates/certificate.controller.js:36`
- Service: `src/modules/certificates/certificate.service.js:593` (`certService.getCertificateByJobId`)
- Models touched: JobRequest.findByPk
- Service returns (detected): await getCertificateById(job.generated_certificate_id, user)

### 17. GET /api/v1/certificates/vessel/{vesselId}
- Summary: Get certificates by vessel
- Operation ID: `getCertificatesByVessel`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `vesselId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[vesselId], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Vessel certificates (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Vessel certificates fetched successfully',
            data: certs
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:42`
- Controller: `src/modules/certificates/certificate.controller.js:25`
- Service: `src/modules/certificates/certificate.service.js:568` (`certService.getCertificatesByVessel`)
- Models touched: Certificate.findAll
- Service returns (detected): await Certificate.findAll({
        where,
        attributes: ['id', 'vessel_id', 'certificate_type_id', 'certificate_number', 'issue_date', 'expiry_date', 'status', 'createdAt'],
        include: [{ model: db.CertificateType, attributes: ['name'] }],
        order: [['expiry_date', 'ASC']]
    })

### 18. GET /api/v1/certificates/{id}
- Summary: Get certificate by ID
- Operation ID: `getCertificateById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Certificate details (application/json => object)
- `403`: Forbidden - certificate exists but user has no access (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate details fetched successfully',
            data: cert
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:57`
- Controller: `src/modules/certificates/certificate.controller.js:47`
- Service: `src/modules/certificates/certificate.service.js:607` (`certService.getCertificateById`)
- Models touched: Certificate.findOne, Certificate.findByPk
- Service returns (detected): cert

### 19. GET /api/v1/certificates/{id}/download
- Summary: Download certificate PDF
- Operation ID: `downloadCertificate`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Successful download (in case of direct file stream rather than redirect) (application/pdf => string)
- `302`: Redirect to certificate PDF URL
- `404`: Certificate not found or PDF not available (application/json => object)
- Controller response envelope(s):
```js
{
            success: false,
            message: 'Certificate PDF is not available for download yet.'
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:60`
- Controller: `src/modules/certificates/certificate.controller.js:60`
- Service: `src/modules/certificates/certificate.service.js:607` (`certService.getCertificateById`)
- Models touched: Certificate.findOne, Certificate.findByPk
- Service returns (detected): cert
- Service: `src/services/fileAccess.service.js:246` (`fileAccessService.processFileAccess`)
- Models touched: N/A
- Service returns (detected): {
        fileName: key.split('/').pop(), // Simple filename extraction
        contentType: fileRecord.file_type || 'application/octet-stream',
        expiresAt: expiresAt, // Null for public CDN
        signedUrl: signedUrl
    }

### 20. PUT /api/v1/certificates/{id}/suspend
- Summary: Suspend certificate
- Operation ID: `suspendCertificate`
- Access Roles: TM
- Change Access: TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertActionRequest
- Req usage in controller: params=[id], query=[], body=[reason], user=[id], files=[]
- Validation schema key: `certAction`
- Joi schema source: `src/middlewares/validate.middleware.js:230`
```js
Joi.object({
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate suspended (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate suspended successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:63`
- Controller: `src/modules/certificates/certificate.controller.js:77`
- Service: `src/modules/certificates/certificate.service.js:641` (`certService.updateStatus`)
- Models touched: Certificate.findByPk, CertificateHistory.create
- Service returns (detected): cert

### 21. PUT /api/v1/certificates/{id}/revoke
- Summary: Revoke certificate
- Operation ID: `revokeCertificate`
- Access Roles: TM
- Change Access: TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertActionRequest
- Req usage in controller: params=[id], query=[], body=[reason], user=[id], files=[]
- Validation schema key: `certAction`
- Joi schema source: `src/middlewares/validate.middleware.js:230`
```js
Joi.object({
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate revoked (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate revoked successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:64`
- Controller: `src/modules/certificates/certificate.controller.js:88`
- Service: `src/modules/certificates/certificate.service.js:641` (`certService.updateStatus`)
- Models touched: Certificate.findByPk, CertificateHistory.create
- Service returns (detected): cert

### 22. PUT /api/v1/certificates/{id}/restore
- Summary: Restore certificate
- Operation ID: `restoreCertificate`
- Access Roles: TM
- Change Access: TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertActionRequest
- Req usage in controller: params=[id], query=[], body=[reason], user=[id], files=[]
- Validation schema key: `certAction`
- Joi schema source: `src/middlewares/validate.middleware.js:230`
```js
Joi.object({
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate restored (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate restored successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:65`
- Controller: `src/modules/certificates/certificate.controller.js:99`
- Service: `src/modules/certificates/certificate.service.js:641` (`certService.updateStatus`)
- Models touched: Certificate.findByPk, CertificateHistory.create
- Service returns (detected): cert

### 23. PUT /api/v1/certificates/{id}/renew
- Summary: Renew certificate
- Operation ID: `renewCertificate`
- Access Roles: TM, GM
- Change Access: TM, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/RenewCertRequest
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `renewCert`
- Joi schema source: `src/middlewares/validate.middleware.js:233`
```js
Joi.object({
        validity_years: Joi.number().integer().min(1).max(5).required(),
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate renewed (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate renewed successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:68`
- Controller: `src/modules/certificates/certificate.controller.js:110`
- Service: `src/modules/certificates/certificate.service.js:663` (`certService.renewCertificate`)
- Models touched: Certificate.findByPk, Certificate.create, CertificateHistory.create
- Service returns (detected): newCert

### 24. POST /api/v1/certificates/{id}/reissue
- Summary: Reissue certificate
- Operation ID: `reissueCertificate`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertActionRequest
- Req usage in controller: params=[id], query=[], body=[reason], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Certificate reissued (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate reissued. New draft created.',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:72`
- Controller: `src/modules/certificates/certificate.controller.js:147`
- Service: `src/modules/certificates/certificate.service.js:813` (`certService.reissueCertificate`)
- Models touched: Certificate.findByPk, Certificate.create, CertificateHistory.create
- Service returns (detected): newCert

### 25. POST /api/v1/certificates/{id}/transfer
- Summary: Transfer certificate
- Operation ID: `transferCertificate`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertActionRequest
- Req usage in controller: params=[id], query=[], body=[newOwnerId, reason], user=[id], files=[]
- Validation schema key: `certAction`
- Joi schema source: `src/middlewares/validate.middleware.js:230`
```js
Joi.object({
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate transferred
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate transferred successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:81`
- Controller: `src/modules/certificates/certificate.controller.js:203`
- Service: `src/modules/certificates/certificate.service.js:902` (`certService.transferCertificate`)
- Models touched: Certificate.findByPk, Certificate.create, CertificateHistory.create
- Service returns (detected): newCert

### 26. POST /api/v1/certificates/{id}/extend
- Summary: Extend certificate
- Operation ID: `extendCertificate`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertActionRequest
- Req usage in controller: params=[id], query=[], body=[extensionMonths, reason], user=[id], files=[]
- Validation schema key: `certAction`
- Joi schema source: `src/middlewares/validate.middleware.js:230`
```js
Joi.object({
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate extended
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate extension applied successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:82`
- Controller: `src/modules/certificates/certificate.controller.js:214`
- Service: `src/modules/certificates/certificate.service.js:929` (`certService.extendCertificate`)
- Models touched: Certificate.findByPk, CertificateHistory.create
- Service returns (detected): cert

### 27. PUT /api/v1/certificates/{id}/downgrade
- Summary: Downgrade certificate
- Operation ID: `downgradeCertificate`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertActionRequest
- Req usage in controller: params=[id], query=[], body=[newTypeId, reason], user=[id], files=[]
- Validation schema key: `certAction`
- Joi schema source: `src/middlewares/validate.middleware.js:230`
```js
Joi.object({
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate downgraded
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate downgraded successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:83`
- Controller: `src/modules/certificates/certificate.controller.js:225`
- Service: `src/modules/certificates/certificate.service.js:949` (`certService.downgradeCertificate`)
- Models touched: Certificate.findByPk, CertificateType.findByPk, Certificate.create, CertificateHistory.create
- Service returns (detected): newCert

### 28. GET /api/v1/certificates/{id}/preview
- Summary: Preview certificate
- Operation ID: `previewCertificate`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Certificate preview (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate preview data fetched',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:75`
- Controller: `src/modules/certificates/certificate.controller.js:180`
- Service: `src/modules/certificates/certificate.service.js:889` (`certService.previewCertificate`)
- Models touched: N/A
- Service returns (detected): await getCertificateById(id, user)

### 29. GET /api/v1/certificates/{id}/history
- Summary: Get certificate history
- Operation ID: `getCertificateHistory`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Certificate history (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 30. POST /api/v1/certificates/{id}/issue
- Summary: Issue certificate
- Operation ID: `issueCertificate`
- Access Roles: GM
- Change Access: GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/UpdateCertificateDraftRequest
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `updateCertificateDraft`
- Joi schema source: `src/middlewares/validate.middleware.js:513`
```js
Joi.object({
        flag_administration_id: Joi.string().guid().optional(),
        certificate_authority_id: Joi.string().guid().optional(),
        certificate_term: Joi.string().valid('FULL_TERM', 'SHORT_TERM').optional(),
        manual_text: Joi.alternatives().try(Joi.object(), Joi.string()).optional(),
        remarks: Joi.string().allow('', null).optional(),
        issue_date: Joi.date().iso().optional(),
        expiry_date: Joi.date().iso().optional(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Certificate issued (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Certificate issued successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/certificates/certificate.routes.js:54`
- Controller: `src/modules/certificates/certificate.controller.js:133`
- Service: `src/modules/certificates/certificate.service.js:698` (`certService.updateDraft`)
- Models touched: Certificate.findByPk, CertificateHistory.create
- Service returns (detected): cert
- Service: `src/modules/certificates/certificate.service.js:726` (`certService.issueCertificate`)
- Models touched: Certificate.findByPk, CertificateHistory.create
- Service returns (detected): cert

### 31. GET /api/v1/certificates/authorities
- Summary: List certificate authorities
- Operation ID: `getCertificateAuthorities`
- Access Roles: ADMIN, GM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of authorities (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 32. POST /api/v1/certificates/authorities
- Summary: Create certificate authority
- Operation ID: `createCertificateAuthority`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/CreateCertificateAuthorityRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Authority created
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 33. GET /api/v1/certificates/authorities/upload-logo
- Summary: Get logo upload URL
- Operation ID: `getAuthorityLogoUploadUrl`
- Access Roles: ADMIN
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Presigned URL generated (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 34. GET /api/v1/certificates/authorities/{id}
- Summary: Get authority by ID
- Operation ID: `getCertificateAuthorityById`
- Access Roles: ADMIN, GM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Authority details (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 35. PUT /api/v1/certificates/authorities/{id}
- Summary: Update authority
- Operation ID: `updateCertificateAuthority`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/UpdateCertificateAuthorityRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Authority updated
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 36. DELETE /api/v1/certificates/authorities/{id}
- Summary: Delete authority
- Operation ID: `deleteCertificateAuthority`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Authority deleted
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A