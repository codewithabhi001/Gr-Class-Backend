/** Flatten Sequelize list rows — no nested association objects in list payloads. */

export const toPlain = (row) => (row?.get ? row.get({ plain: true }) : row ?? {});

export const flatCertificateListRow = (row) => {
    const c = toPlain(row);
    return {
        id: c.id,
        vessel_id: c.vessel_id,
        certificate_type_id: c.certificate_type_id,
        certificate_number: c.certificate_number,
        issue_date: c.issue_date,
        expiry_date: c.expiry_date,
        status: c.status,
        createdAt: c.createdAt,
        vessel_name: c.Vessel?.vessel_name ?? null,
        imo_number: c.Vessel?.imo_number ?? null,
        client_id: c.Vessel?.client_id ?? null,
        company_name: c.Vessel?.Client?.company_name ?? null,
        certificate_type: c.CertificateType?.name ?? null,
    };
};

export const flatIncidentListRow = (row) => {
    const i = toPlain(row);
    return {
        id: i.id,
        vessel_id: i.vessel_id,
        reported_by: i.reported_by,
        title: i.title,
        status: i.status,
        created_at: i.created_at,
        vessel_name: i.Vessel?.vessel_name ?? null,
        imo_number: i.Vessel?.imo_number ?? null,
    };
};

export const flatSurveyReportListRow = (row) => {
    const s = toPlain(row);
    return {
        id: s.id,
        job_id: s.job_id,
        surveyor_id: s.surveyor_id,
        survey_status: s.survey_status,
        submission_count: s.submission_count,
        started_at: s.started_at,
        submitted_at: s.submitted_at,
        finalized_at: s.finalized_at,
        survey_statement_status: s.survey_statement_status,
        survey_statement_pdf_url: s.survey_statement_pdf_url,
        job_status: s.JobRequest?.job_status ?? null,
        vessel_name: s.JobRequest?.Vessel?.vessel_name ?? null,
        imo_number: s.JobRequest?.Vessel?.imo_number ?? null,
        surveyor_name: s.User?.name ?? null,
        surveyor_email: s.User?.email ?? null,
    };
};

export const flatPaymentListRow = (row) => {
    const p = toPlain(row);
    return {
        id: p.id,
        job_id: p.job_id,
        invoice_number: p.invoice_number,
        amount: p.amount,
        currency: p.currency,
        payment_status: p.payment_status,
        payment_date: p.payment_date,
        receipt_url: p.receipt_url,
        verified_by_user_id: p.verified_by_user_id,
        created_at: p.created_at,
        updated_at: p.updated_at,
        amount_collected: p.amount_collected,
        amount_paid: p.amount_paid,
        remaining: p.remaining,
        net_amount: p.net_amount,
        refunded_amount: p.refunded_amount,
        vessel_name: p.JobRequest?.Vessel?.vessel_name ?? null,
        job_status: p.JobRequest?.job_status ?? null,
    };
};

export const flatSupportTicketListRow = (row) => {
    const t = toPlain(row);
    return {
        id: t.id,
        ticket_number: t.ticket_number,
        subject: t.subject,
        priority: t.priority,
        status: t.status,
        category: t.category,
        user_id: t.user_id,
        created_at: t.created_at,
        creator_name: t.Creator?.name ?? null,
        creator_email: t.Creator?.email ?? null,
    };
};

export const flatContactEnquiryListRow = (row) => {
    const e = toPlain(row);
    return {
        id: e.id,
        full_name: e.full_name,
        company: e.company,
        corporate_email: e.corporate_email,
        phone: e.phone,
        subject: e.subject,
        source_page: e.source_page,
        status: e.status,
        internal_note: e.internal_note,
        replied_by: e.replied_by,
        replied_at: e.replied_at,
        created_at: e.created_at,
        responder_name: e.Responder?.name ?? null,
        responder_email: e.Responder?.email ?? null,
    };
};

export const flatActivityRequestListRow = (row) => {
    const a = toPlain(row);
    return {
        id: a.id,
        request_number: a.request_number,
        activity_type: a.activity_type,
        requested_service: a.requested_service,
        proposed_date: a.proposed_date,
        status: a.status,
        vessel_id: a.vessel_id,
        created_at: a.created_at,
        vessel_name: a.Vessel?.vessel_name ?? null,
        imo_number: a.Vessel?.imo_number ?? null,
        linked_job_id: a.LinkedJob?.id ?? null,
        linked_job_status: a.LinkedJob?.job_status ?? null,
    };
};

export const flatChangeRequestListRow = (row) => {
    const cr = toPlain(row);
    return {
        id: cr.id,
        entity_type: cr.entity_type,
        entity_id: cr.entity_id,
        change_description: cr.change_description,
        status: cr.status,
        priority: cr.priority,
        requested_by: cr.requested_by,
        approved_by: cr.approved_by,
        approved_at: cr.approved_at,
        createdAt: cr.createdAt,
        requester_name: cr.requester?.name ?? null,
        requester_email: cr.requester?.email ?? null,
        approver_name: cr.approver?.name ?? null,
        approver_email: cr.approver?.email ?? null,
    };
};

export const flatSearchVesselRow = (row) => {
    const v = toPlain(row);
    return {
        id: v.id,
        vessel_name: v.vessel_name,
        imo_number: v.imo_number,
        client_id: v.client_id,
    };
};

export const flatSearchJobRow = (row) => {
    const j = toPlain(row);
    return {
        id: j.id,
        job_status: j.job_status,
        vessel_id: j.vessel_id,
        created_at: j.createdAt,
        vessel_name: j.Vessel?.vessel_name ?? null,
        imo_number: j.Vessel?.imo_number ?? null,
    };
};

export const flatSearchCertificateRow = (row) => {
    const c = toPlain(row);
    return {
        id: c.id,
        certificate_number: c.certificate_number,
        vessel_id: c.vessel_id,
        status: c.status,
        expiry_date: c.expiry_date,
    };
};

export const flatFeedbackListRow = (row) => {
    const f = toPlain(row);
    return {
        id: f.id,
        job_id: f.job_id,
        client_id: f.client_id,
        rating: f.rating,
        timeliness: f.timeliness,
        professionalism: f.professionalism,
        documentation: f.documentation,
        remarks: f.remarks,
        submitted_at: f.submitted_at,
        job_request_number: f.JobRequest?.job_request_number ?? null,
        client_name: f.Client?.name ?? null,
        client_email: f.Client?.email ?? null,
        company_name: f.Client?.Client?.company_name ?? null,
    };
};

export const flatAuditLogListRow = (row) => {
    const l = toPlain(row);
    return {
        id: l.id,
        user_id: l.user_id,
        action: l.action,
        entity_name: l.entity_name,
        entity_id: l.entity_id,
        created_at: l.created_at,
        user_name: l.User?.name ?? null,
        user_email: l.User?.email ?? null,
        user_role: l.User?.role ?? null,
    };
};

export const flatVesselListRow = (row) => {
    const v = toPlain(row);
    return {
        id: v.id,
        vessel_name: v.vessel_name ?? 'N/A',
        imo_number: v.imo_number ?? 'N/A',
        ship_type: v.ship_type ?? 'N/A',
        class_status: v.class_status ?? 'N/A',
        created_at: v.created_at ?? 'N/A',
        flag_state: v.FlagAdministration?.flag_state_name ?? 'N/A',
        company_name: v.Client?.company_name ?? 'N/A',
        company_code: v.Client?.company_code ?? 'N/A',
    };
};

export const flatClientListRow = (row) => {
    const c = toPlain(row);
    return {
        id: c.id,
        company_name: c.company_name,
        company_code: c.company_code,
        status: c.status,
        email: c.email,
        created_at: c.created_at,
        has_user: !!(c.Users && c.Users.length > 0),
    };
};

export const flatNcListRow = (row) => {
    const n = toPlain(row);
    return {
        id: n.id,
        job_id: n.job_id,
        severity: n.severity,
        status: n.status,
        created_at: n.created_at,
    };
};
