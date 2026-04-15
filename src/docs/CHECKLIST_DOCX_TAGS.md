# Checklist DOCX auto-fill tags

Checklist templates (`.docx`) me Word **Content Controls** (grey boxes) ka **Tag** set karke backend job-wise auto-fill karta hai.

## How to set tags (Word)
- Word → **Developer** tab enable (Options → Customize Ribbon → Developer)
- Grey box select karo → **Properties**
- **Tag** field me niche wale exact values set karo

## Supported tags (recommended)
- **Vessel**
  - `vessel_name`
  - `imo_number`
  - `call_sign`
  - `mmsi_number`
  - `port_of_registry`
  - `year_built`
  - `ship_type`
  - `gross_tonnage`
  - `net_tonnage`
  - `deadweight`
- **Owner/Operator**
  - `owner_operators` (defaults to Client company name)
- **Survey / Job**
  - `survey_commenced_date`
  - `survey_completed_date`
  - `place_of_survey`
  - `job_id`
  - `certificate_type`
- **Surveyor**
  - `surveyor_name`

## Notes
- Tag names **case-sensitive** hain; exactly same use karein.
- Aap additional tags add karna chaho to backend mapping extend ki ja sakti hai.

