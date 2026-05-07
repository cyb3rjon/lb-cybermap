// Theme-aware content library used by the deterministic mock generator.
// Each "Finding" bundles an observation with its paired risk and recommendation
// so the three artefacts are fully aligned by design.

import type { FrameworkId, Severity, Priority, Effort, CostBand, Horizon } from '@/types';

export type Theme =
  | 'Governance' | 'Risk Management' | 'Asset Management' | 'Supply Chain'
  | 'Identity' | 'Awareness' | 'Data Security' | 'Platform Security'
  | 'Infrastructure Resilience' | 'Vulnerability Management'
  | 'Detection' | 'Response' | 'Recovery' | 'Application Security'
  | 'Penetration Testing';

export const THEME_TO_CAPABILITY: Record<Theme, string> = {
  'Governance': 'Governance & Risk',
  'Risk Management': 'Governance & Risk',
  'Asset Management': 'Asset Management',
  'Supply Chain': 'Third-Party Risk',
  'Identity': 'Identity & Access',
  'Awareness': 'People & Culture',
  'Data Security': 'Data Protection',
  'Platform Security': 'Secure Engineering',
  'Infrastructure Resilience': 'Resilience',
  'Vulnerability Management': 'Vulnerability Management',
  'Detection': 'Detection & Response',
  'Response': 'Detection & Response',
  'Recovery': 'Resilience',
  'Application Security': 'Secure Engineering',
  'Penetration Testing': 'Assurance',
};

export function themeForItem(itemId: string, framework: FrameworkId): Theme {
  if (framework === 'NIST_CSF_2_0') {
    if (itemId.startsWith('GV.SC')) return 'Supply Chain';
    if (itemId.startsWith('GV.RM')) return 'Risk Management';
    if (itemId.startsWith('GV')) return 'Governance';
    if (itemId.startsWith('ID.AM')) return 'Asset Management';
    if (itemId.startsWith('ID.RA')) return 'Risk Management';
    if (itemId.startsWith('ID.IM')) return 'Governance';
    if (itemId.startsWith('PR.AA')) return 'Identity';
    if (itemId.startsWith('PR.AT')) return 'Awareness';
    if (itemId.startsWith('PR.DS')) return 'Data Security';
    if (itemId.startsWith('PR.PS')) return 'Platform Security';
    if (itemId.startsWith('PR.IR')) return 'Infrastructure Resilience';
    if (itemId.startsWith('DE')) return 'Detection';
    if (itemId.startsWith('RS')) return 'Response';
    if (itemId.startsWith('RC')) return 'Recovery';
  }
  if (framework === 'CIS_V8_1_2') {
    if (itemId.startsWith('CIS-1.') || itemId.startsWith('CIS-2.')) return 'Asset Management';
    if (itemId.startsWith('CIS-3.')) return 'Data Security';
    if (itemId.startsWith('CIS-4.')) return 'Platform Security';
    if (itemId.startsWith('CIS-5.') || itemId.startsWith('CIS-6.')) return 'Identity';
    if (itemId.startsWith('CIS-7.')) return 'Vulnerability Management';
    if (itemId.startsWith('CIS-8.') || itemId.startsWith('CIS-13.')) return 'Detection';
    if (itemId.startsWith('CIS-9.') || itemId.startsWith('CIS-10.')) return 'Platform Security';
    if (itemId.startsWith('CIS-11.')) return 'Recovery';
    if (itemId.startsWith('CIS-12.')) return 'Infrastructure Resilience';
    if (itemId.startsWith('CIS-14.')) return 'Awareness';
    if (itemId.startsWith('CIS-15.')) return 'Supply Chain';
    if (itemId.startsWith('CIS-16.')) return 'Application Security';
    if (itemId.startsWith('CIS-17.')) return 'Response';
    if (itemId.startsWith('CIS-18.')) return 'Penetration Testing';
  }
  if (framework === 'NCSC_CAF_4_0') {
    if (itemId.startsWith('A1') || itemId.startsWith('A2')) return 'Governance';
    if (itemId.startsWith('A3')) return 'Asset Management';
    if (itemId.startsWith('A4')) return 'Supply Chain';
    if (itemId.startsWith('B1')) return 'Governance';
    if (itemId.startsWith('B2')) return 'Identity';
    if (itemId.startsWith('B3')) return 'Data Security';
    if (itemId.startsWith('B4')) return 'Platform Security';
    if (itemId.startsWith('B5')) return 'Infrastructure Resilience';
    if (itemId.startsWith('B6')) return 'Awareness';
    if (itemId.startsWith('C')) return 'Detection';
    if (itemId.startsWith('D1')) return 'Response';
    if (itemId.startsWith('D2')) return 'Governance';
  }
  return 'Governance';
}

export interface Finding {
  observation: {
    title: string;
    body: string;
    severity: Severity;
    evidenceRefs?: string[];
  };
  risk: {
    title: string;
    description: string;
    impact: 1 | 2 | 3 | 4 | 5;
    likelihood: 1 | 2 | 3 | 4 | 5;
    treatment: 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';
    rationale?: string;
  };
  recommendation: {
    title: string;
    description: string;
    priority: Priority;
    effort: Effort;
    costBand: CostBand;
    horizon: Horizon;
    benefits?: string;
    successCriteria?: string[];
  };
}

export const FINDINGS_BY_THEME: Record<Theme, Finding[]> = {
  Governance: [
    {
      observation: {
        title: 'Inconsistent policy review cadence across the security policy framework',
        severity: 'Medium',
        body: `The Information Security Policy is documented and approved at Group level, but workshop participants from GRC, Legal and Risk independently confirmed that periodic review has slipped beyond the stated 12-month cadence. The last formal review was completed approximately 18 months ago, during a period of leadership transition in the GRC function.\n\nWe sampled six related policies (Acceptable Use, Data Classification, Identity, Vulnerability Management, Incident Response, Third-Party Risk) and four are similarly out of date by between 9 and 24 months. Recent organisational changes — establishment of the Wealth Management division and adoption of two new cloud platforms — are not reflected in the current text, leading to ambiguity for control owners and weakening the audit trail of intent.`,
        evidenceRefs: ['Information Security Policy v3.2', 'GRC Committee minutes Q2 2025'],
      },
      risk: {
        title: 'Regulatory finding from inconsistent policy currency and ambiguous control direction',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Out-of-date policies and ambiguous control direction create plausible regulatory findings under FCA / PRA inspection or Internal Audit, with reputational and capital implications. The risk crystallises during scheduled inspections — already known to focus on policy review trails — or following a notable incident where regulatory engagement examines the governance posture in retrospect.\n\nMaterial consequences include: published findings, enhanced supervision, and management actions diverting senior leadership capacity from delivery for an extended period. Where downstream operational standards inherit the same drift, follow-on findings can compound across multiple control families.`,
        rationale: 'Inherent likelihood reflects regulators’ published focus on operational resilience and governance; impact reflects the leverage that public findings exert on franchise reputation.',
      },
      recommendation: {
        title: 'Establish a single accountable Policy Framework Owner with quarterly review cadence',
        priority: 'P3', effort: 'S', costBand: '<£25k', horizon: '0–3m',
        description: `Appoint a Policy Framework Owner accountable to the CISO for the operating health of the policy estate, with the following design:\n\n(1) A documented policy register listing every Group-level policy and standard, owner, last review date, next review due, and current operating status.\n(2) Quarterly review sessions chaired by the Policy Framework Owner with named policy owners, producing minuted outcomes and tracked actions.\n(3) Integration with the GRC committee reporting pack so review status is visible at executive level.\n(4) A defined sunset rule: any policy more than 18 months from last review is automatically flagged for executive escalation.\n\nInitial focus over the first 90 days should be the policies most overdue (Information Security Policy, Identity Policy, Data Classification Standard).`,
        benefits: 'Restores defensible policy currency; reduces audit and regulatory finding likelihood; gives downstream standards a clear ownership signal.',
        successCriteria: ['Zero Group policies more than 18 months from last review by Q+2', 'Quarterly minuted reviews evidenced for four consecutive quarters', 'Policy ownership visible in the central control register'],
      },
    },
    {
      observation: {
        title: 'Cybersecurity outcomes not consistently visible at the Board',
        severity: 'High',
        body: `Cybersecurity is included on the Board agenda quarterly, but the materials presented are heavily activity-oriented (project status, headcount, audit closures) rather than outcome-oriented (residual risk versus appetite, key control effectiveness, scenario readiness). Executives we interviewed stated that they are not consistently able to articulate the organisation’s residual cyber risk position, and that there is no shared definition of risk appetite for cyber that is operationalised through control thresholds.\n\nThis is a maturity gap rather than a governance failure: the structures exist, but the information flowing through them does not yet support steering. The CISO function has begun work on a quantitative risk reporting model, but it is in early prototype and not yet calibrated to the organisation’s tolerance statements.`,
      },
      risk: {
        title: 'Cyber risks above appetite escape executive visibility and corrective action',
        impact: 4, likelihood: 4, treatment: 'Mitigate',
        description: `Without a converged taxonomy and quantitative thresholds, exposures that breach implicit appetite remain invisible to the executive committees that would otherwise direct corrective action. The risk is that material exposure persists, evidenced after the fact by an incident or audit finding, and the post-event question "who knew" returns an unsatisfactory answer.\n\nIn financial services this carries direct regulatory weight under the Senior Managers Regime — accountable executives are expected to evidence informed decision-making over cyber risk.`,
        rationale: 'Likelihood is elevated by the absence of quantitative reporting; impact is shaped by SMR and operational resilience expectations.',
      },
      recommendation: {
        title: 'Implement quantitative cyber risk reporting aligned to the enterprise risk taxonomy',
        priority: 'P2', effort: 'L', costBand: '£100–500k', horizon: '6–12m',
        description: `Operationalise the cyber risk reporting model in collaboration with Group Risk to produce a converged executive view, with the following components:\n\n(1) Reconciled risk taxonomy mapping cyber risks to enterprise principal risk categories.\n(2) Quantitative thresholds defined per principal risk (frequency × impact bands) with explicit appetite statements approved by the Risk Committee.\n(3) Monthly dashboard showing residual position vs appetite per principal risk, with movement and explanatory commentary.\n(4) Quarterly stress-and-scenario reporting drawing on cyber-specific scenarios from the operational resilience framework.\n(5) Bi-annual independent challenge from Internal Audit on the integrity of the model and its inputs.`,
        benefits: 'Cyber risk becomes a comparable line item alongside other principal risks, supporting prioritisation in capital and headcount allocation, and giving the Board a defensible articulation of residual posture.',
        successCriteria: ['Risk Committee approves converged taxonomy', 'Monthly executive dashboard live for two consecutive quarters', 'Internal Audit issues a green opinion on model integrity'],
      },
    },
  ],
  'Risk Management': [
    {
      observation: {
        title: 'Cyber risk register not reconciled to the enterprise risk taxonomy',
        severity: 'Medium',
        body: `Cybersecurity maintains a working risk register at the operational level, but its taxonomy and scoring scale do not align with the enterprise risk register maintained by Group Risk. As a result, the same underlying exposure can appear as "High" in the cyber view and "Medium" in the enterprise view, or vice versa, depending on which scale is applied.\n\nThis creates two practical issues: (i) board-level reporting is unable to show cyber as a comparable line item alongside other principal risks, weakening prioritisation in capital and headcount allocation; and (ii) the enterprise risk function cannot confirm that all cyber risks above appetite are visible to the appropriate committee.`,
      },
      risk: {
        title: 'Misclassified cyber risks lead to inconsistent prioritisation',
        impact: 3, likelihood: 4, treatment: 'Mitigate',
        description: `Misalignment between cyber and enterprise taxonomies leads to inconsistent prioritisation across the firm, with realistic exposure that material cyber risks are deprioritised in capital allocation reviews because they appear less severe in the enterprise view than in the cyber view, or vice versa.`,
      },
      recommendation: {
        title: 'Converge cyber and enterprise risk taxonomies with a shared scoring methodology',
        priority: 'P3', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Run a focused programme jointly with Group Risk to:\n(1) Map every cyber risk to an enterprise principal risk category.\n(2) Adopt a single I × L scale with documented anchor descriptions.\n(3) Re-baseline the cyber register against the converged scale.\n(4) Embed the converged taxonomy into the GRC tooling.`,
        successCriteria: ['Group Risk and CISO sign off the converged taxonomy', 'GRC tooling reflects the converged scale within one quarter'],
      },
    },
  ],
  'Asset Management': [
    {
      observation: {
        title: 'Operational technology and branch assets absent from the central CMDB',
        severity: 'High',
        body: `Workstation and server inventory in ServiceNow CMDB is broadly reliable for IT-managed estate, with reconciliation to Microsoft Defender for Endpoint and the Active Directory inventory showing approximately 96% coverage. However, the operational technology (OT) estate — including branch ATM controllers, building management systems, and the small set of bespoke trading-floor appliances — is not represented in the CMDB and is instead tracked in a Facilities-managed spreadsheet that has not been reconciled against physical assets in 14 months.\n\nA walkthrough of two pilot branches identified four assets present on the network that did not appear on the spreadsheet, and three records on the spreadsheet that referenced assets which had been decommissioned. This creates direct impact on vulnerability management, patching coverage reporting, and incident response.`,
        evidenceRefs: ['ServiceNow CMDB extract 2025-10', 'Branch OT register Excel'],
      },
      risk: {
        title: 'Operational disruption from undiscovered or poorly-managed assets',
        impact: 5, likelihood: 3, treatment: 'Mitigate',
        description: `Assets outside the central inventory are not subject to vulnerability management, lifecycle management or incident response runbooks. In the OT and branch estate, this materially raises the chance that an exploitable vulnerability persists, and that recovery from a destructive incident is delayed because asset ownership and dependencies are uncertain.\n\nThe most material scenario is a compromise propagating through a poorly-managed branch device into customer-facing services — where the recovery time would be extended by the time required to discover and reconstruct asset ownership.`,
        rationale: 'Impact reflects the customer-facing nature of branch operations; likelihood is shaped by the elapsed time since last reconciliation.',
      },
      recommendation: {
        title: 'Onboard operational technology and branch estate to the central CMDB with lifecycle ownership',
        priority: 'P2', effort: 'L', costBand: '£100–500k', horizon: '6–12m',
        description: `Extend ServiceNow CMDB coverage to the OT and branch estate with the following design:\n\n(1) Discovery using a network discovery tool capable of operating safely in OT environments (e.g. Claroty xDome, Nozomi).\n(2) Manual reconciliation in the first wave for legacy controllers that cannot be discovered passively.\n(3) Lifecycle metadata mandatory for OT assets: business owner, technical owner, dependent process, end-of-support date, supported firmware versions.\n(4) Reconciliation cadence: monthly automated, quarterly physical sample.\n(5) Integration with vulnerability management so OT assets are included in scanner targeting (where safe) or compensating monitoring (where not).\n(6) Decommissioning workflow that removes records from the CMDB only after physical disposal certification.\n\nA pilot covering two regional branch clusters should run in the first 60 days, followed by phased rollout.`,
        benefits: 'Closes the most material asset-management gap; removes downstream blind spots in vulnerability and incident response coverage.',
        successCriteria: ['100% of OT assets in CMDB within 9 months of programme start', 'Monthly reconciliation report shows ≤2% drift', 'Vulnerability scanner targeting confirmed for safe-to-scan OT segments'],
      },
    },
    {
      observation: {
        title: 'Software inventory does not reliably distinguish authorised from tolerated software',
        severity: 'Medium',
        body: `Microsoft Intune produces an aggregated software inventory across managed endpoints, but the catalogue does not classify entries against an authorised baseline. A 5% sample of installed software showed approximately 11% of entries were either unsupported versions, end-of-life products, or tools introduced for short-term project use that were not removed. There is no documented exception process for permitting tolerated-but-not-authorised software with a sunset date.`,
      },
      risk: {
        title: 'Unmanaged software footprint expands attack surface and licensing risk',
        impact: 3, likelihood: 4, treatment: 'Mitigate',
        description: `Unmanaged software present in the estate carries vulnerabilities that escape the patching workflow, expanding the attack surface available to commodity malware. End-of-life software in particular is a known initial-access vector. Beyond security, undocumented commercial software creates licensing exposure on audit.`,
      },
      recommendation: {
        title: 'Establish an authorised software baseline with sunsetted-tolerated exception process',
        priority: 'P3', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Define an authorised software list curated by Architecture, with a documented exception process for tolerated-but-not-authorised software. Every exception carries an explicit sunset date, an owner, and a tracked migration plan. Automate enforcement through Intune deployment rings.`,
        benefits: 'Reduces unmanaged-software risk and supports cleaner vulnerability and licence reporting.',
        successCriteria: ['Authorised baseline ratified by Architecture', 'Exception register with sunset dates live', 'Tolerated software inventory shrinks by 30% over 6 months'],
      },
    },
  ],
  'Supply Chain': [
    {
      observation: {
        title: 'Third-party risk tiering not refreshed since most recent acquisitions',
        severity: 'High',
        body: `The third-party risk programme tiers suppliers into four bands based on data sensitivity and operational criticality, with a refresh cadence of every 24 months. The most recent refresh predates the acquisition of two business lines, neither of which has had its inherited supplier portfolio re-tiered against the parent group's standard.\n\nSample testing of 30 active suppliers identified 7 with material data access whose contracts were inherited at acquisition and have not been revisited. Of those, 3 have not been subject to any security due diligence in the last 36 months, despite handling categories of data subject to GDPR Article 9.`,
      },
      risk: {
        title: 'Onward compromise via inherited supplier relationships',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Suppliers with material data access whose security posture has not been re-tiered or re-assessed pose a credible vector for attacker entry. Recent threat reporting shows attackers prioritising mid-tier suppliers as a path into financial services targets; absent due diligence and continuous monitoring, the realistic exposure is a confirmed supplier compromise resulting in customer data loss attributable to the firm.`,
      },
      recommendation: {
        title: 'Re-tier and re-assess the inherited supplier portfolio from the recent acquisitions',
        priority: 'P1', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Run a focused programme to re-tier all inherited suppliers against the parent group's classification scheme, then perform fresh due diligence on tier-1 and tier-2 inherited suppliers, prioritising those with material data access. Update contractual security terms where the inherited contract does not meet the parent group's minimum bar.`,
        benefits: 'Closes the most material third-party gap; restores defensible posture under regulatory inspection.',
        successCriteria: ['All inherited suppliers re-tiered within 4 months', '100% of tier-1 inherited suppliers re-assessed within 6 months'],
      },
    },
  ],
  Identity: [
    {
      observation: {
        title: 'Service accounts excluded from MFA controls without compensating controls documented',
        severity: 'Critical',
        body: `Conditional Access policies in Microsoft Entra ID enforce MFA for human user accounts including administrative accounts. However, a material number of service accounts (approximately 280, of which around 60 are privileged) are exempted from MFA via a "service-account-bypass" Conditional Access exclusion group, without documented compensating controls (such as IP restrictions, certificate-based authentication, or Privileged Access Management hardening).\n\nThe approval and renewal lifecycle for membership of that exclusion group is not formalised and we observed accounts in the group whose original justification could not be reproduced in the change management record. Modern identity practice expects service identities to use managed identities, workload identities or certificate-based authentication; the current pattern is a known attack path for credential-based intrusion.`,
        evidenceRefs: ['Conditional Access policy export', 'Service Account Inventory.xlsx'],
      },
      risk: {
        title: 'Credential compromise of an exempt service account leads to material lateral movement',
        impact: 5, likelihood: 4, treatment: 'Mitigate',
        description: `Service accounts exempted from MFA, particularly the privileged subset, are well-known attack targets. Compromise of a single exempt privileged service account is sufficient to enable lateral movement across the estate before detection, given the SOC's known coverage gaps in cloud telemetry.\n\nThe most material scenario is multi-day adversary dwell time leading to a destructive or extortion event. Recent threat-actor reporting consistently shows service-account abuse as the pivot point in successful intrusions targeting financial services.`,
        rationale: 'Likelihood reflects the observed prevalence of this attack pattern; impact reflects the privileged blast radius and the reduced detection probability.',
      },
      recommendation: {
        title: 'Eliminate service-account MFA bypass through managed identities and certificate-based authentication',
        priority: 'P1', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Migrate exempt service accounts to modern, MFA-equivalent authentication patterns with the following sequence:\n\n(1) Inventory all members of the service-account-bypass exclusion group with current owner and use-case attestation.\n(2) For Microsoft cloud workloads: migrate to managed identities or workload identities; remove service principal secrets in favour of certificate-based authentication or federated credentials.\n(3) For on-premise services: migrate to gMSA (group managed service accounts) where supported; for legacy services, broker through a privileged access management workflow with hardened compensating controls.\n(4) Tighten the exclusion group lifecycle: every remaining member requires named owner, justification, compensating controls (IP restriction, certificate authentication) and a renewal date no further than six months out.\n(5) Build a Conditional Access analytics report flagging any service account authenticating from an unexpected source IP or geography.`,
        benefits: 'Closes the single most material identity attack path; reduces likelihood and impact of credential-based intrusion across the estate.',
        successCriteria: ['Exclusion group reduced by ≥80% within 6 months', 'All remaining members have renewal dates ≤6 months out', 'Conditional Access analytics report live and reviewed monthly'],
      },
    },
    {
      observation: {
        title: 'Privileged access not consistently brokered through the PAM solution',
        severity: 'High',
        body: `CyberArk is in place and brokers approximately 70% of privileged Windows server access. Coverage gaps remain across the Linux estate, the legacy mainframe environment, and around 40 servers that retain locally-managed administrator accounts. A quarterly recertification process is documented but the most recent run had a 22% override rate (approvers signing off on access without dialogue with the requester), suggesting fatigue.`,
      },
      risk: {
        title: 'Standing privileged access on un-brokered systems enables attacker lateral movement',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Locally-managed administrator accounts and un-brokered Linux access bypass the audit, just-in-time, and credential-rotation controls provided by the PAM solution. An attacker with initial access to any of these systems retains standing privilege, increasing dwell value and extending the realistic blast radius of an incident.`,
      },
      recommendation: {
        title: 'Extend PAM coverage to the Linux estate, mainframe, and remaining locally-managed administrator accounts',
        priority: 'P2', effort: 'L', costBand: '£100–500k', horizon: '6–12m',
        description: `Phase the rollout of CyberArk to the remaining Linux estate, the legacy mainframe, and the residual locally-managed administrator accounts. Reduce the recertification override rate by introducing a structured re-justification step for any access not used in the prior 60 days.`,
        benefits: 'Brings the long tail of privileged access into the same hardened broker pattern, reducing both standing risk and attacker dwell value.',
        successCriteria: ['100% of privileged Linux access brokered through PAM', 'Recertification override rate <5% for two consecutive cycles'],
      },
    },
  ],
  Awareness: [
    {
      observation: {
        title: 'Awareness programme is broadly delivered but not measurably effective',
        severity: 'Medium',
        body: `Mandatory cyber awareness training is delivered annually with 96% completion. Phishing simulations are run monthly with a click-through rate trending downward (currently 7.4%). However, role-based content for higher-risk populations — privileged administrators, finance approvers, executive assistants handling sensitive comms — is not differentiated, and we identified no metrics being tracked for behavioural change beyond click-through.\n\nThe programme does not yet measure reporting rates (a leading indicator of culture) and no reward / recognition is in place for users who report genuine phishing.`,
      },
      risk: {
        title: 'High-risk role population fall victim to targeted social engineering',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Generic awareness leaves high-risk populations (privileged admins, finance approvers, executive assistants) without role-tailored training. Realistic exposure includes business email compromise driving payment fraud or, in the privileged-admin case, credential capture leading to lateral movement.`,
      },
      recommendation: {
        title: 'Implement role-based awareness for high-risk populations with behavioural metrics',
        priority: 'P3', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Deploy differentiated content for privileged administrators, finance approvers and executive assistants, including scenario-based modules and quarterly bite-sized refreshers. Track behavioural metrics — phishing reporting rate, privileged action anomaly rate, secure email usage — alongside the existing click-through metrics. Introduce a recognition scheme for users who consistently report genuine phishing attempts.`,
        benefits: 'Targets the populations where social engineering carries disproportionate impact; introduces leading indicators of culture beyond click-through.',
        successCriteria: ['Role-based content live for three populations', 'Reporting rate metric established and improving for two consecutive quarters'],
      },
    },
  ],
  'Data Security': [
    {
      observation: {
        title: 'Encryption at rest applied inconsistently across analytics platforms',
        severity: 'High',
        body: `Encryption at rest is enforced by default on the principal customer-facing systems through cloud platform-level encryption (AWS KMS / Azure Storage SSE). However, three analytics workloads (a Snowflake account inherited from acquisition, a Databricks workspace used by the Marketing data science team, and an on-premise Hadoop cluster scheduled for retirement) were found to be running without customer-managed keys and, in one case, without encryption at rest at all.\n\nCustomer data flows through these platforms; whilst access controls are applied at the application layer, the absence of CMK or transparent data encryption increases exposure in the event of a snapshot leak or a misconfigured backup.`,
      },
      risk: {
        title: 'Customer data exposed via unencrypted analytics platforms',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Analytics platforms operating without customer-managed keys or, in one observed case, without encryption at rest, present a residual exposure in the event of snapshot leak, misconfigured backup, or platform-level configuration drift. Realistic exposure includes a regulatory-notifiable data exposure event with associated notification costs and reputational impact.`,
      },
      recommendation: {
        title: 'Bring analytics platforms into the customer-managed key encryption baseline',
        priority: 'P2', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Migrate the inherited Snowflake account, the Marketing Databricks workspace, and any other analytics platforms not currently encrypted with customer-managed keys onto the standard pattern. Decommission the on-premise Hadoop cluster on its scheduled timeline. Add an architecture review gate so new analytics workloads cannot enter production without CMK encryption.`,
        benefits: 'Closes the residual encryption gap; aligns analytics platforms to the principal-system standard.',
        successCriteria: ['CMK encryption confirmed across all analytics platforms', 'Architecture review gate enforced for new workloads'],
      },
    },
    {
      observation: {
        title: 'Data loss prevention coverage limited to email egress',
        severity: 'Medium',
        body: `DLP policies are deployed in Microsoft Purview for email and Teams egress, with reasonable accuracy. There is no DLP coverage on web egress (no SASE/SSE solution in production), no endpoint DLP, and no monitoring of upload activity to consumer-grade SaaS such as personal cloud storage. The risk of inadvertent or deliberate exfiltration outside email is therefore not detectable using current tooling.`,
      },
      risk: {
        title: 'Material data exfiltration outside the email channel goes undetected',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Without DLP coverage on web egress, endpoint DLP, or SaaS upload monitoring, deliberate or inadvertent exfiltration through non-email paths is not detectable. The realistic exposure is undetected loss of customer or commercially-sensitive data over a sustained period before discovery through external means (regulator notification, threat intelligence).`,
      },
      recommendation: {
        title: 'Deploy DLP coverage on web egress and high-risk SaaS uploads',
        priority: 'P2', effort: 'L', costBand: '£100–500k', horizon: '6–12m',
        description: `Procure and deploy a SASE/SSE solution providing DLP coverage on web egress, integrate it with the existing Microsoft Purview policies for consistency, and onboard the principal SaaS applications for upload visibility. Define a 'high-risk SaaS' inventory and prioritise those for monitoring first.`,
        benefits: 'Closes the principal blind spot in inadvertent or deliberate exfiltration outside email.',
        successCriteria: ['SASE/SSE in production for 100% of managed endpoints', 'High-risk SaaS upload monitoring producing actionable alerts within 6 months'],
      },
    },
  ],
  'Platform Security': [
    {
      observation: {
        title: 'Hardening baselines defined but not consistently enforced through configuration management',
        severity: 'Medium',
        body: `Hardening baselines exist for Windows Server (CIS Level 1), Windows 10/11, and the Ubuntu Linux estate, and are loaded into Microsoft Defender for Cloud and AWS Config. Drift is detected — Defender for Cloud currently reports an average compliance of 87% across the Windows fleet and 82% across the Linux fleet. However, drift remediation is not pulled into a tracked workflow: Engineering teams remediate at their own cadence and there is no SLA. Some baselines (databases, container hosts) are not yet defined.`,
      },
      risk: {
        title: 'Drift from hardening baselines leaves systems exploitable to commodity attacks',
        impact: 3, likelihood: 4, treatment: 'Mitigate',
        description: `Configuration drift on Windows and Linux fleets erodes the protective effect of hardening. The realistic exposure is exploitation by commodity malware leveraging configurations that were intended to be disabled.`,
      },
      recommendation: {
        title: 'Establish a hardening drift remediation SLA with automated tracking',
        priority: 'P3', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Define and ratify SLAs for hardening drift remediation by severity (e.g. 30 days for high-severity drift, 90 days for medium). Automate ticket creation in ITSM from Defender for Cloud / AWS Config findings and report SLA performance to engineering leadership monthly. Extend baselines to databases and container hosts.`,
        benefits: 'Restores the protective effect of hardening; introduces accountability for drift.',
        successCriteria: ['SLA performance ≥90% for two consecutive quarters', 'Database and container host baselines ratified and deployed'],
      },
    },
    {
      observation: {
        title: 'Patching SLAs defined but not consistently met for medium-severity vulnerabilities',
        severity: 'Medium',
        body: `OS-level patching is largely reliable for critical and high-severity findings, with a 95% within-SLA rate. Medium-severity findings drop to 71% within-SLA and there is no escalation path for ageing findings beyond a monthly report to platform owners. Application-level patching (third-party software, container base images) lags further, particularly for line-of-business applications managed by individual teams without central oversight.`,
      },
      risk: {
        title: 'Medium-severity vulnerability backlog enables targeted exploitation',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Long-tail medium-severity vulnerabilities, particularly when chained, present a credible path for a targeted attacker. Recent intrusion reporting shows medium-severity findings being chained to gain initial access more frequently than single-CVE 'critical' exploitation.`,
      },
      recommendation: {
        title: 'Tighten medium-severity vulnerability SLA performance with escalation path',
        priority: 'P3', effort: 'S', costBand: '<£25k', horizon: '0–3m',
        description: `Refresh the SLA definition for medium-severity findings (e.g. 60 days for internet-facing systems, 90 days for internal). Build an automated escalation pathway for findings ageing beyond SLA: monthly to platform owner, quarterly to engineering director, half-yearly to Risk Committee. Integrate with the central vulnerability dashboard.`,
        benefits: 'Closes the long tail of medium-severity findings that today carry disproportionate exploitation risk.',
        successCriteria: ['Within-SLA rate for medium ≥85% within two quarters', 'Aged findings register reviewed at Risk Committee'],
      },
    },
  ],
  'Infrastructure Resilience': [
    {
      observation: {
        title: 'Resilience design assumptions not validated by exercise',
        severity: 'High',
        body: `The architecture documentation states that tier-1 platforms can fail over within their published RTO/RPO, but full end-to-end recovery has not been exercised in the last 18 months for the core banking platform, and never for the post-merger configuration of the trading platform. Recovery time objectives published in the BIA are largely based on design assumptions rather than measured performance.\n\nComponent-level failover tests are run quarterly, with good outcomes, but these do not validate the orchestrated dependencies (DNS, identity, certificate authorities, secrets) that historically cause the longest recovery delays in destructive scenarios.`,
      },
      risk: {
        title: 'Tier-1 platform recovery exceeds RTO under destructive scenario',
        impact: 5, likelihood: 3, treatment: 'Mitigate',
        description: `Unverified RTO assumptions and unrehearsed orchestrated dependencies create a realistic exposure that recovery from a destructive incident exceeds published tolerance. Material consequences include extended customer impact, regulatory engagement under PS21/3 expectations, and amplified financial loss.`,
        rationale: 'Likelihood reflects the elapsed period since last full-scope exercise; impact is shaped by the customer-facing nature of tier-1 platforms.',
      },
      recommendation: {
        title: 'Establish a quarterly recovery exercise programme for tier-1 platforms with verified RTOs',
        priority: 'P1', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Implement a structured programme of recovery exercises with the following design:\n\n(1) Quarterly tabletop exercises of varying scenarios — single application failure, regional cloud outage, destructive ransomware event with backup tampering.\n(2) Two annual full-scope live recovery exercises performed against an isolated environment, validating end-to-end RTO/RPO for each tier-1 platform.\n(3) A 'recovery control owner' role established within Infrastructure Engineering, accountable to the Resilience Steering Committee, whose remit includes documentation, exercise plans and remediation tracking.\n(4) Integration with the operational resilience scenario library so recovery exercise outputs feed Important Business Service impact tolerances.\n(5) Public dashboarding of last-exercise dates and remediation status to the Executive Risk Committee.\n\nInitial focus over the first 90 days should be the immutable backup chain assumption (object-lock policy, integrity verification, and the privileged path that could shorten retention).`,
        benefits: 'Verifies RTO/RPO assumptions; closes the most material resilience gap; supports defensible posture under PS21/3.',
        successCriteria: ['Two full-scope live exercises completed in year one', 'Verified RTO recorded for every tier-1 platform', 'Immutable backup chain assumption validated and documented'],
      },
    },
  ],
  'Vulnerability Management': [
    {
      observation: {
        title: 'Vulnerability management coverage incomplete across the cloud estate',
        severity: 'High',
        body: `Internal vulnerability scanning runs weekly using Qualys against on-premise infrastructure, with reasonable coverage and remediation reporting against documented SLAs. Cloud-native vulnerability scanning (AWS Inspector, Microsoft Defender for Cloud) is enabled but the findings are not aggregated into the central vulnerability dashboard maintained by the Security Operations team.\n\nIn practice this means that container image vulnerabilities, serverless dependency findings, and IaC misconfigurations are surfaced in cloud consoles only, and are remediated on the cadence of the owning engineering team rather than against the formal SLA.`,
      },
      risk: {
        title: 'Cloud-native vulnerabilities exploited before remediation',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Container image vulnerabilities and IaC misconfigurations not flowing into the central backlog escape SLA enforcement. Realistic exposure is exploitation of a known vulnerability with publicly available exploitation prior to remediation.`,
      },
      recommendation: {
        title: 'Aggregate cloud-native vulnerability findings into the central backlog with formal SLAs',
        priority: 'P2', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Aggregate AWS Inspector, Microsoft Defender for Cloud, container image scanners and IaC scanners into the central vulnerability dashboard. Apply formal SLAs equal to those for on-premise findings. Add quarterly Internal Audit verification of completeness.`,
        benefits: 'Establishes a defensible single view of vulnerability backlog across hybrid environments.',
        successCriteria: ['100% of cloud sources aggregated', 'Internal Audit issues green opinion on completeness'],
      },
    },
  ],
  Detection: [
    {
      observation: {
        title: 'SIEM coverage strong for on-premise estate but inconsistent for cloud workloads',
        severity: 'Critical',
        body: `Splunk receives logs from the on-premise estate (network, Windows, Linux, AD, key applications) with broadly reliable parsing and a curated set of detections. Cloud telemetry is partially onboarded: AWS CloudTrail, GuardDuty findings, and Azure activity logs are flowing, but resource-level logs (Lambda, container audit logs, Kubernetes API audit, S3 data events) are inconsistently configured.\n\nA walkthrough of recent detections showed that around 70% of triggered alerts originated from on-premise sources, whilst around 80% of business-critical workloads now reside in cloud environments. This produces a measurable detection blind spot.`,
      },
      risk: {
        title: 'Cloud-native intrusion proceeds undetected for an extended period',
        impact: 5, likelihood: 4, treatment: 'Mitigate',
        description: `Inconsistent telemetry from cloud workloads creates a realistic scenario where an adversary establishes persistence in cloud environments and avoids detection by the SOC, leading to extended dwell time and a more material outcome.\n\nRecent threat-actor reporting shows cloud-targeting activity rising sharply, with attackers specifically optimised to evade detections that lack resource-level telemetry.`,
        rationale: 'Likelihood reflects observed cloud-targeting trend; impact reflects the criticality of cloud-resident workloads.',
      },
      recommendation: {
        title: 'Onboard cloud-native telemetry to the SIEM and stand up cloud-focused detection content',
        priority: 'P1', effort: 'L', costBand: '£100–500k', horizon: '6–12m',
        description: `Onboard the missing cloud telemetry (Lambda, container audit logs, Kubernetes API audit, S3 data events) into Splunk and develop a curated set of cloud-focused detections aligned to MITRE ATT&CK Cloud TTPs. Engage a third-party detection content provider to accelerate. Stand up a quarterly purple team programme that exercises the detection coverage.`,
        benefits: 'Closes the detection blind spot on the workloads that now carry most business value.',
        successCriteria: ['100% of in-scope cloud telemetry sources onboarded', 'MITRE Cloud TTP coverage ≥70% within 9 months', 'Purple team programme delivering quarterly exercise reports'],
      },
    },
    {
      observation: {
        title: 'Alert prioritisation generates measurable analyst fatigue',
        severity: 'Medium',
        body: `Analysts handle approximately 1,200 alerts per week with a true-positive rate of 6%. Alert tuning is performed reactively rather than as part of a structured detection engineering programme. Mean time to triage has increased over the last two quarters and analyst dwell time on routine alerts has measurably grown. Detection-as-code, with version-controlled detection logic and analyst feedback loops, is not yet in production.`,
      },
      risk: {
        title: 'Alert fatigue causes a true positive to be deprioritised at first triage',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Persistently high alert volumes with low true-positive rates are a known precondition for analyst error. Realistic exposure includes a true-positive incident being closed as false positive at first triage, materially extending dwell time before the next signal triggers a re-investigation.`,
      },
      recommendation: {
        title: 'Adopt detection-as-code with structured analyst feedback loops',
        priority: 'P3', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Migrate detections to a version-controlled repository (e.g. Sigma in Git). Implement a CI pipeline that runs detection unit tests against historical telemetry. Establish a weekly detection engineering review where analyst feedback closes the loop into rule tuning. Adopt true-positive and false-positive rate as named SLAs.`,
        benefits: 'Reduces alert fatigue and increases detection quality through measurable feedback.',
        successCriteria: ['100% of production detections in version control', 'Mean true-positive rate ≥15% within 9 months'],
      },
    },
  ],
  Response: [
    {
      observation: {
        title: 'Incident response playbooks present but not exercised against current architecture',
        severity: 'High',
        body: `Documented playbooks exist for the dozen most common scenarios (phishing, malware, data exfiltration, ransomware, BEC). They are appropriately structured and include decision trees and communication templates. However, they have not been exercised against the post-merger architecture: the most recent live exercise of a destructive ransomware scenario predates the cloud migration of the core banking platform.\n\nCommunication trees include the right named roles but two named individuals have left the organisation since the playbooks were last reviewed.`,
      },
      risk: {
        title: 'Response capability inadequate to manage a multi-pressure scenario',
        impact: 5, likelihood: 3, treatment: 'Mitigate',
        description: `Unrehearsed playbooks against the current architecture, combined with stale named contacts, create realistic exposure that an active scenario tests the limits of response capability for the first time during the live event. Material consequences include extended impact, fragmented communications, and amplified regulatory and reputational impact.`,
      },
      recommendation: {
        title: 'Refresh and exercise tier-1 incident response playbooks against the current architecture',
        priority: 'P1', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Refresh the response playbooks for the current cloud-resident architecture. Validate every named contact and update the cyber crisis bridge contact tree. Run a 4-hour live exercise of a destructive ransomware scenario with concurrent regulatory and customer pressures. Capture lessons through the lessons-learned process.`,
        benefits: 'Restores defensible response posture; verifies that the response capability can manage a multi-pressure scenario.',
        successCriteria: ['Live exercise executed within 6 months', 'Action register from exercise closed within 90 days post-exercise'],
      },
    },
  ],
  Recovery: [
    {
      observation: {
        title: 'Backup recovery exercises not performed end-to-end since prior architecture',
        severity: 'High',
        body: `Backups are operationally healthy: Veeam reports 99.4% job success across the last 90 days, integrity verification jobs run weekly, and a small subset of data has been restored on demand without issue. However, an end-to-end exercise of a full tier-1 platform recovery (including identity, DNS, secrets and downstream dependencies) has not been performed since the cloud migration.\n\nThe immutable copy is configured with object-lock, but workshop participants could not confirm whether the lock policy is currently enforced for the most recent generations of backup data, or whether a privileged user with elevated cloud rights could shorten the lock duration.`,
      },
      risk: {
        title: 'Recovery from a destructive incident exceeds business tolerance',
        impact: 5, likelihood: 3, treatment: 'Mitigate',
        description: `Unrehearsed end-to-end recovery, including the immutable backup chain assumption, creates realistic exposure that recovery from a destructive incident exceeds business-defined tolerance, with the most material consequences accruing to customer-impacting platforms.`,
      },
      recommendation: {
        title: 'Validate the immutable backup chain through a controlled adversary simulation',
        priority: 'P1', effort: 'S', costBand: '<£25k', horizon: '0–3m',
        description: `Run a controlled adversary simulation testing whether a privileged user could shorten object-lock retention or otherwise compromise the immutable backup chain. Use the outcome to harden the lock policy and the privileged path. Repeat annually as a named control test. Pair with an end-to-end tier-1 recovery exercise within the same fiscal year.`,
        benefits: 'Removes the single highest residual uncertainty in the recovery posture.',
        successCriteria: ['Simulation completed with documented outcomes', 'Hardening actions closed within 60 days', 'Tier-1 end-to-end recovery exercise completed within 12 months'],
      },
    },
  ],
  'Application Security': [
    {
      observation: {
        title: 'Secure SDLC controls inconsistently applied across product teams',
        severity: 'Medium',
        body: `A documented Secure Development Lifecycle exists with control gates at design, build and release. Adoption is strong in the central platform engineering teams but inconsistent in product teams, particularly those who have integrated through acquisition. SAST is enabled on around 60% of repositories; SCA runs against published dependency manifests but not on internal libraries; threat modelling is performed for major releases but is rarely revisited.`,
      },
      risk: {
        title: 'Vulnerability introduced via inconsistent SDLC adoption reaches production',
        impact: 4, likelihood: 3, treatment: 'Mitigate',
        description: `Inconsistent SDLC adoption — particularly across acquired product teams — creates realistic exposure that a software vulnerability reaches production and is exploitable. The most material example is an authentication or authorisation flaw in a customer-facing API.`,
      },
      recommendation: {
        title: 'Standardise SDLC adoption across product teams with measurable gate compliance',
        priority: 'P2', effort: 'L', costBand: '£100–500k', horizon: '6–12m',
        description: `Drive consistent adoption of SAST, SCA, and threat modelling across product teams, particularly those integrated through acquisition. Introduce gate compliance metrics in the engineering leadership review. Provide a champion network and platform team support for the long-tail teams.`,
        benefits: 'Reduces realistic exposure of vulnerabilities reaching production via inconsistent SDLC practice.',
        successCriteria: ['SAST coverage ≥95% of repositories', 'SCA coverage ≥95% of releases', 'Threat modelling refreshed for major releases on schedule'],
      },
    },
  ],
  'Penetration Testing': [
    {
      observation: {
        title: 'External penetration testing programme defined; internal testing limited',
        severity: 'Medium',
        body: `External penetration testing is performed annually against the principal internet-facing services with consistent quality and timely remediation tracking. Internal penetration testing is performed only on a triggered basis (significant change), rather than on a scheduled programme. There is no purple team activity and no scenario-driven testing aligned to the threat model.`,
      },
      risk: {
        title: 'Latent vulnerabilities persist between annual external tests',
        impact: 3, likelihood: 3, treatment: 'Mitigate',
        description: `An exclusively annual external testing cadence with limited internal testing creates realistic exposure that a vulnerability persists in production between tests, particularly for systems that have changed materially since last test.`,
      },
      recommendation: {
        title: 'Establish a structured internal penetration testing programme with retest verification',
        priority: 'P3', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
        description: `Establish a quarterly internal penetration testing programme prioritised against the threat model. Add purple team exercises twice per year. Mandate retest verification before remediation closure.`,
        benefits: 'Closes the assurance gap between annual external tests; improves confidence in remediation.',
        successCriteria: ['Quarterly programme delivering published reports', 'Retest verification rate 100% before closure'],
      },
    },
  ],
};

// Severity ordering — used by sort callers everywhere
export const SEVERITY_RANK: Record<Severity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
export const PRIORITY_RANK: Record<Priority, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
