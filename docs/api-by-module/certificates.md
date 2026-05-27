# Certificates Module API

Source: `src/docs/paths/certificates.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, PUBLIC, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, PUBLIC, SURVEYOR, TM, TO
- Roles with change access: ADMIN, GM, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/certificates` -> GM, TM
2. `POST /api/v1/certificates/vessel/{vesselId}/external` -> ADMIN, GM, TM
3. `POST /api/v1/certificates/types` -> ADMIN
4. `PUT /api/v1/certificates/types/{id}` -> ADMIN, TM
5. `DELETE /api/v1/certificates/types/{id}` -> ADMIN
6. `POST /api/v1/certificates/types/{id}/required-documents` -> ADMIN, TM
7. `PUT /api/v1/certificates/types/{id}/required-documents/{docId}` -> ADMIN, TM
8. `DELETE /api/v1/certificates/types/{id}/required-documents/{docId}` -> ADMIN, TM
9. `POST /api/v1/certificates/bulk-renew` -> ADMIN, TM
10. `PUT /api/v1/certificates/{id}` -> TM, GM
11. `PUT /api/v1/certificates/{id}/suspend` -> TM
12. `PUT /api/v1/certificates/{id}/revoke` -> TM
13. `PUT /api/v1/certificates/{id}/restore` -> TM
14. `PUT /api/v1/certificates/{id}/renew` -> TM, GM
15. `POST /api/v1/certificates/{id}/reissue` -> ADMIN, TM
16. `POST /api/v1/certificates/{id}/transfer` -> ADMIN, GM
17. `POST /api/v1/certificates/{id}/extend` -> ADMIN, GM
18. `PUT /api/v1/certificates/{id}/downgrade` -> ADMIN, GM
19. `POST /api/v1/certificates/{id}/issue` -> GM
20. `POST /api/v1/certificates/{id}/override` -> GM

## Routes

### 1. GET /api/v1/certificates/verify/{number}
- Summary: Verify certificate (public)
- Operation ID: `verifyCertificate`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- `number` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Certificate verified (application/json => object)
- `404`: Certificate not found (application/json => #/components/schemas/ErrorResponse)

### 2. GET /api/v1/certificates
- Summary: List certificates
- Operation ID: `getCertificates`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `vessel_id` (query, optional, string)
- `certificate_type_id` (query, optional, string)
- `status` (query, optional, string)
- `client_id` (query, optional, string)
- `expiring_within_days` (query, optional, integer)
- Request Body:
- None
- Responses:
- `200`: List of certificates (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 3. POST /api/v1/certificates
- Summary: Generate draft certificate (GM/TM)
- Operation ID: `generateCertificate`
- Access Roles: GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/GenerateCertificateRequest
- Responses:
- `201`: Certificate generated (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)

### 4. GET /api/v1/certificates/upload-url
- Summary: Get presigned URL for certificate upload
- Operation ID: `getCertificateUploadUrl`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body:
- None
- Responses:
- `200`: Presigned URL generated (application/json => object)

### 5. POST /api/v1/certificates/vessel/{vesselId}/external
- Summary: Upload external certificate
- Operation ID: `uploadExternalCertificate`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `vesselId` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/UploadExternalCertificateRequest
- Responses:
- `201`: External certificate uploaded (application/json => object)

### 6. GET /api/v1/certificates/type-names
- Summary: Get certificate type names (slim dropdown list)
- Operation ID: `getCertificateTypeNames`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `search` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Slim list of certificate type id+name pairs (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 7. GET /api/v1/certificates/types
- Summary: List certificate types (minimal)
- Operation ID: `getCertificateTypes`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `include_inactive` (query, optional, boolean)
- `search` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Minimal list of certificate types (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 8. POST /api/v1/certificates/types
- Summary: Create certificate type
- Operation ID: `createCertificateType`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/CertificateTypeCreateRequest
- Responses:
- `201`: Certificate type created (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `409`: A certificate type with this name already exists (application/json => #/components/schemas/ErrorResponse)

### 9. GET /api/v1/certificates/types/{id}
- Summary: Get certificate type detail (with required documents)
- Operation ID: `getCertificateTypeById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Certificate type detail with required documents (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)

### 10. PUT /api/v1/certificates/types/{id}
- Summary: Update certificate type
- Operation ID: `updateCertificateType`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertificateTypeUpdateRequest
- Responses:
- `200`: Certificate type updated (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)

### 11. DELETE /api/v1/certificates/types/{id}
- Summary: Deactivate certificate type
- Operation ID: `deactivateCertificateType`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Certificate type successfully deactivated (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — ADMIN role required (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Conflict — cannot deactivate because:
- Certificate type is already inactive
- Active certificates still reference this type
- Active jobs still reference this type
 (application/json => #/components/schemas/ErrorResponse)

### 12. GET /api/v1/certificates/types/{id}/required-documents
- Summary: List required documents for a certificate type
- Operation ID: `getCertificateTypeRequiredDocuments`
- Access Roles: ADMIN, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Required documents list (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)

### 13. POST /api/v1/certificates/types/{id}/required-documents
- Summary: Add required document for a certificate type
- Operation ID: `addCertificateTypeRequiredDocument`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertificateRequiredDocumentCreateRequest
- Responses:
- `201`: Required document created (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate type not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Required document already exists (application/json => #/components/schemas/ErrorResponse)

### 14. PUT /api/v1/certificates/types/{id}/required-documents/{docId}
- Summary: Update required document for a certificate type
- Operation ID: `updateCertificateTypeRequiredDocument`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- `docId` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertificateRequiredDocumentUpdateRequest
- Responses:
- `200`: Required document updated (application/json => object)
- `400`: Validation error / wrong type mapping (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Document not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Duplicate document name (application/json => #/components/schemas/ErrorResponse)

### 15. DELETE /api/v1/certificates/types/{id}/required-documents/{docId}
- Summary: Delete required document for a certificate type
- Operation ID: `deleteCertificateTypeRequiredDocument`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- `docId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Deleted (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Document not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Cannot delete (document already used in jobs) (application/json => #/components/schemas/ErrorResponse)

### 16. POST /api/v1/certificates/bulk-renew
- Summary: Bulk renew certificates
- Operation ID: `bulkRenewCertificates`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `200`: Bulk renewal completed
- `403`: Forbidden

### 17. GET /api/v1/certificates/job/{jobId}
- Summary: Get certificate by job ID
- Operation ID: `getCertificateByJobId`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Certificate details (application/json => object)
- `404`: Job not found or certificate not yet generated (application/json => #/components/schemas/ErrorResponse)

### 18. GET /api/v1/certificates/vessel/{vesselId}
- Summary: Get certificates by vessel
- Operation ID: `getCertificatesByVessel`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `vesselId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Vessel certificates (application/json => object)

### 19. GET /api/v1/certificates/{id}
- Summary: Get certificate by ID
- Operation ID: `getCertificateById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Certificate details (application/json => object)
- `403`: Forbidden - certificate exists but user has no access (application/json => #/components/schemas/ErrorResponse)
- `404`: Certificate not found (application/json => #/components/schemas/ErrorResponse)

### 20. PUT /api/v1/certificates/{id}
- Summary: Update certificate draft
- Operation ID: `updateCertificateDraft`
- Access Roles: TM, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/UpdateCertificateDraftRequest
- Responses:
- `200`: Draft updated (application/json => object)
- `400`: Validation error
- `403`: Forbidden
- `404`: Certificate not found

### 21. GET /api/v1/certificates/{id}/download
- Summary: Download certificate PDF
- Operation ID: `downloadCertificate`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Successful download (in case of direct file stream rather than redirect) (application/pdf => string)
- `302`: Redirect to certificate PDF URL
- `404`: Certificate not found or PDF not available (application/json => object)

### 22. PUT /api/v1/certificates/{id}/suspend
- Summary: Suspend certificate
- Operation ID: `suspendCertificate`
- Access Roles: TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertActionRequest
- Responses:
- `200`: Certificate suspended (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)

### 23. PUT /api/v1/certificates/{id}/revoke
- Summary: Revoke certificate
- Operation ID: `revokeCertificate`
- Access Roles: TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertActionRequest
- Responses:
- `200`: Certificate revoked (application/json => object)

### 24. PUT /api/v1/certificates/{id}/restore
- Summary: Restore certificate
- Operation ID: `restoreCertificate`
- Access Roles: TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertActionRequest
- Responses:
- `200`: Certificate restored (application/json => object)

### 25. PUT /api/v1/certificates/{id}/renew
- Summary: Renew certificate
- Operation ID: `renewCertificate`
- Access Roles: TM, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/RenewCertRequest
- Responses:
- `200`: Certificate renewed (application/json => object)

### 26. POST /api/v1/certificates/{id}/reissue
- Summary: Reissue certificate
- Operation ID: `reissueCertificate`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertActionRequest
- Responses:
- `200`: Certificate reissued (application/json => object)

### 27. POST /api/v1/certificates/{id}/transfer
- Summary: Transfer certificate
- Operation ID: `transferCertificate`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertActionRequest
- Responses:
- `200`: Certificate transferred
- `403`: Forbidden

### 28. POST /api/v1/certificates/{id}/extend
- Summary: Extend certificate
- Operation ID: `extendCertificate`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertActionRequest
- Responses:
- `200`: Certificate extended
- `403`: Forbidden

### 29. PUT /api/v1/certificates/{id}/downgrade
- Summary: Downgrade certificate
- Operation ID: `downgradeCertificate`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertActionRequest
- Responses:
- `200`: Certificate downgraded
- `403`: Forbidden

### 30. GET /api/v1/certificates/{id}/preview
- Summary: Preview certificate
- Operation ID: `previewCertificate`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Certificate preview (application/json => object)

### 31. GET /api/v1/certificates/{id}/history
- Summary: Get certificate history
- Operation ID: `getCertificateHistory`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Certificate history (application/json => object)

### 32. POST /api/v1/certificates/{id}/issue
- Summary: Issue certificate
- Operation ID: `issueCertificate`
- Access Roles: GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/UpdateCertificateDraftRequest
- Responses:
- `200`: Certificate issued (application/json => object)

### 33. POST /api/v1/certificates/{id}/override
- Summary: Override certificate
- Operation ID: `overrideCertificate`
- Access Roles: GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Certificate overridden successfully (application/json => object)
