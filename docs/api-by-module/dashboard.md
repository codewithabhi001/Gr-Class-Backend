# Dashboard Module API (Actual)

Source YAML: `src/docs/paths/dashboard.yaml`

## Routes

### 1. GET /api/v1/dashboard
- Summary: Get dashboard
- Operation ID: `getDashboard`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
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
- `200`: Dashboard data (application/json => #/components/schemas/DashboardResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data }
```

Implementation Trace
- Route file: `src/modules/dashboard/dashboard.routes.js:9`
- Controller: `src/modules/dashboard/dashboard.controller.js:3`
- Service: `src/modules/dashboard/dashboard.service.js:8` (`dashboardService.getAdminDashboard`)
- Models touched: User.findAll
- Service returns (detected): acc | {
        role: 'ADMIN',
        summary: {
            ...stats.summary,
            users: {
                total: roleCountsRaw.reduce((sum, r) => sum + parseInt(r.count, 10), 0),
                by_role: roleCounts,
                admin: roleCounts.ADMIN || 0,
                gm: roleCounts.GM || 0,
                tm: roleCounts.TM || 0,
                to: roleCounts.TO || 0,
                surveyors: stats.surveyorCount,
                clients: roleCounts.CLIENT || 0,
            },
        },
        client_with_vessels: stats.client_with_vessels,
        recent_activities: stats.recent_activities
    }
- Service: `src/modules/dashboard/dashboard.service.js:290` (`dashboardService.getGMDashboard`)
- Models touched: JobRequest.findAll
- Service returns (detected): {
        role: 'GM',
        summary: stats.summary,
        actionable_items: {
            pending_issuance: pendingIssuanceJobs.map(j => ({
                id: j.id,
                certificate_id: j.generated_certificate_id,
                vessel: j.Vessel?.vessel_name,
                type: j.CertificateType?.name,
                finalized_at: j.updatedAt
            }))
        },
        client_with_vessels: stats.client_with_vessels,
        recent_activities: stats.recent_activities
    }
- Service: `src/modules/dashboard/dashboard.service.js:325` (`dashboardService.getTMDashboard`)
- Models touched: JobRequest.findAll
- Service returns (detected): acc | {
        role: 'TM',
        summary: {
            assignment_needed: jobsByStatus['DOCUMENT_VERIFIED'] || 0,
            authorization_needed: jobsByStatus['ASSIGNED'] || 0,
            finalization_needed: (jobsByStatus['REVIEWED'] || 0) + (jobsByStatus['PAYMENT_DONE'] || 0)
        },
        actionable_items: {
            pending_assignments: pendingAssignmentJobs.map(formatJob),
            pending_authorizations: pendingAuthorizationJobs.map(formatJob),
            pending_finalizations: pendingFinalizationJobs.map(formatJob)
        }
    }
- Service: `src/modules/dashboard/dashboard.service.js:398` (`dashboardService.getTODashboard`)
- Models touched: JobRequest.findAll, NonConformity.findAll, NonConformity.count
- Service returns (detected): acc | {
        role: 'TO',
        summary: {
            verification_needed: jobsByStatus['CREATED'] || 0,
            review_needed: jobsByStatus['SURVEY_DONE'] || 0,
            rework_requested: jobsByStatus['REWORK_REQUESTED'] || 0,
            open_non_conformities: ncCountsRaw
        },
        actionable_items: {
            pending_verifications: pendingVerificationJobs.map(formatJob),
            pending_reviews: pendingReviewJobs.map(formatJob),
            rework_items: reworkJobs.map(formatJob),
            open_non_conformities: openNCs.map(n => ({
                id: n.id,
                job_id: n.job_id,
                job_request_number: n.JobRequest?.job_request_number,
                vessel_name: n.JobRequest?.Vessel?.vessel_name,
                vessel: n.JobRequest?.Vessel?.vessel_name,
                description: n.description,
                severity: n.severity,
                created_at: n.createdAt
            }))
        }
    }
- Service: `src/modules/dashboard/dashboard.service.js` (`dashboardService.getSurveyorDashboard`)
- Models touched: N/A
- Service returns (detected): N/A
- Service: `src/modules/dashboard/dashboard.service.js:614` (`dashboardService.getClientDashboard`)
- Models touched: Vessel.findAll, JobRequest.findAll, Certificate.findAll, Payment.findAll, Survey.findAll, NonConformity.findAll
- Service returns (detected): {
            role: 'CLIENT',
            stats: { total_vessels: 0, active_jobs: 0, expiring_soon: 0, pending_payments: 0 },
            recent_jobs: [],
            expiring_certificates: [],
            recent_vessels: [],
            recent_certificates: [],
            recent_payments: []
        } | acc | daysToExpiry <= 30 && daysToExpiry >= 0 | {
        role: 'CLIENT',
        stats,
        recent_jobs: jobs.slice(0, 5).map(j => ({
            id: j.id,
            vessel_name: j.Vessel?.vessel_name,
            type: j.CertificateType?.name,
            status: j.job_status,
            surveyor: j.surveyor?.name,
            date: j.createdAt
        })),
        recent_vessels: vessels.slice(0, 5).map(v => ({
            id: v.id,
            vessel_name: v.vessel_name,
            imo_number: v.imo_number,
            date_added: v.createdAt
        })),
        recent_certificates: certificates.slice(0, 5).map(c => ({
            id: c.id,
            name: c.certificate_name,
            vessel: c.Vessel?.vessel_name,
            expiry_date: c.expiry_date,
            issued_date: c.issued_date || c.createdAt
        })),
        recent_surveys: surveys.slice(0, 5).map(s => ({
            id: s.id,
            vessel: s.JobRequest?.Vessel?.vessel_name,
            surveyor: s.User?.name,
            status: s.survey_status,
            date: s.submitted_at || s.updatedAt
        })),
        recent_payments: payments.slice(0, 5).map(p => ({
            id: p.id,
            invoice_number: p.invoice_number,
            amount: p.amount,
            currency: p.currency,
            status: p.payment_status,
            vessel_name: p.JobRequest?.Vessel?.vessel_name,
            date: p.payment_date || p.createdAt
        })),
        open_non_conformities_list: ncs.filter(n => n.status === 'OPEN').slice(0, 5).map(n => ({
            id: n.id,
            job_id: n.job_id,
            job_request_number: n.JobRequest?.job_request_number,
            vessel_name: n.JobRequest?.Vessel?.vessel_name,
            vessel: n.JobRequest?.Vessel?.vessel_name,
            description: n.description,
            severity: n.severity,
            date: n.createdAt
        })),
        pending_payments: payments.filter(p => ['UNPAID', 'PARTIALLY_PAID'].includes(p.payment_status)).map(p => ({
            id: p.id,
            invoice_number: p.invoice_number,
            amount: p.amount,
            currency: p.currency,
            vessel_name: p.JobRequest?.Vessel?.vessel_name
        })),
        expiring_certificates: certificates
            .filter(c => {
                const expiry = new Date(c.expiry_date)
- Service: `src/modules/dashboard/dashboard.service.js:790` (`dashboardService.getDefaultDashboard`)
- Models touched: N/A
- Service returns (detected): {
        role: user.role,
        user: { id: user.id, name: user.name, email: user.email },
        summary: {},
    }