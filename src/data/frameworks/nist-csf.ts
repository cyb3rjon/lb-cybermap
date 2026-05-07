import type { Framework } from '@/types';

// NIST Cybersecurity Framework 2.0 — representative subcategory set.
// Functions: Govern (GV), Identify (ID), Protect (PR), Detect (DE), Respond (RS), Recover (RC)

export const NIST_CSF: Framework = {
  id: 'NIST_CSF_2_0',
  name: 'NIST Cybersecurity Framework',
  shortName: 'NIST CSF',
  version: '2.0',
  description:
    'Outcome-based framework organised across six Functions — Govern, Identify, Protect, Detect, Respond, Recover.',
  groups: [
    {
      id: 'GV',
      code: 'GV',
      name: 'Govern',
      description: 'Establish and monitor cybersecurity risk management strategy, expectations, and policy.',
      categories: [
        {
          id: 'GV.OC',
          code: 'GV.OC',
          name: 'Organisational Context',
          items: [
            { id: 'GV.OC-01', code: 'GV.OC-01', title: 'Mission understood', description: 'The organisational mission is understood and informs cybersecurity risk management.' },
            { id: 'GV.OC-02', code: 'GV.OC-02', title: 'Stakeholders understood', description: 'Internal and external stakeholders are understood and prioritised.' },
            { id: 'GV.OC-03', code: 'GV.OC-03', title: 'Legal and regulatory requirements', description: 'Legal, regulatory and contractual requirements are understood and managed.' },
            { id: 'GV.OC-04', code: 'GV.OC-04', title: 'Critical objectives and capabilities', description: 'Critical objectives, capabilities and services are understood and communicated.' },
            { id: 'GV.OC-05', code: 'GV.OC-05', title: 'Outcomes and dependencies', description: 'Outcomes, capabilities, and services that stakeholders depend on are understood.' },
          ],
        },
        {
          id: 'GV.RM',
          code: 'GV.RM',
          name: 'Risk Management Strategy',
          items: [
            { id: 'GV.RM-01', code: 'GV.RM-01', title: 'Risk management objectives', description: 'Risk management objectives are established and agreed by stakeholders.' },
            { id: 'GV.RM-02', code: 'GV.RM-02', title: 'Risk appetite', description: 'Risk appetite and tolerance statements are established and communicated.' },
            { id: 'GV.RM-03', code: 'GV.RM-03', title: 'Cybersecurity risk in ERM', description: 'Cybersecurity risk management activities are integrated with enterprise risk management.' },
            { id: 'GV.RM-06', code: 'GV.RM-06', title: 'Standardised method', description: 'A standardised method for calculating, documenting and prioritising cyber risk is established.' },
          ],
        },
        {
          id: 'GV.RR',
          code: 'GV.RR',
          name: 'Roles, Responsibilities, Authorities',
          items: [
            { id: 'GV.RR-01', code: 'GV.RR-01', title: 'Leadership accountability', description: 'Leadership is accountable and demonstrates commitment to cybersecurity risk management.' },
            { id: 'GV.RR-02', code: 'GV.RR-02', title: 'Roles and responsibilities', description: 'Roles, responsibilities and authorities for cybersecurity are established and communicated.' },
            { id: 'GV.RR-03', code: 'GV.RR-03', title: 'Resource allocation', description: 'Adequate resources are allocated commensurate with risk strategy.' },
            { id: 'GV.RR-04', code: 'GV.RR-04', title: 'Workforce inclusion', description: 'Cybersecurity is included in human resources practices.' },
          ],
        },
        {
          id: 'GV.PO',
          code: 'GV.PO',
          name: 'Policy',
          items: [
            { id: 'GV.PO-01', code: 'GV.PO-01', title: 'Policy established', description: 'Policy for managing cybersecurity risks is established and communicated.' },
            { id: 'GV.PO-02', code: 'GV.PO-02', title: 'Policy reviewed', description: 'Policy is reviewed, updated, communicated and enforced.' },
          ],
        },
        {
          id: 'GV.OV',
          code: 'GV.OV',
          name: 'Oversight',
          items: [
            { id: 'GV.OV-01', code: 'GV.OV-01', title: 'Strategy outcomes reviewed', description: 'Cybersecurity risk management strategy outcomes are reviewed.' },
            { id: 'GV.OV-02', code: 'GV.OV-02', title: 'Strategy reviewed and adjusted', description: 'Strategy is reviewed and adjusted to reflect coverage of requirements and risks.' },
            { id: 'GV.OV-03', code: 'GV.OV-03', title: 'Performance evaluated', description: 'Performance of risk management is evaluated and reviewed.' },
          ],
        },
        {
          id: 'GV.SC',
          code: 'GV.SC',
          name: 'Cybersecurity Supply Chain Risk Management',
          items: [
            { id: 'GV.SC-01', code: 'GV.SC-01', title: 'C-SCRM programme', description: 'A cybersecurity supply chain risk management programme is established.' },
            { id: 'GV.SC-02', code: 'GV.SC-02', title: 'Roles and responsibilities for suppliers', description: 'Roles for suppliers and customers are established, communicated and coordinated.' },
            { id: 'GV.SC-04', code: 'GV.SC-04', title: 'Suppliers known and prioritised', description: 'Suppliers are known and prioritised by criticality.' },
            { id: 'GV.SC-05', code: 'GV.SC-05', title: 'Requirements established', description: 'Requirements for suppliers are established, prioritised and integrated into contracts.' },
            { id: 'GV.SC-07', code: 'GV.SC-07', title: 'Risks of suppliers monitored', description: 'Risks posed by suppliers and their products and services are monitored over the relationship.' },
          ],
        },
      ],
    },
    {
      id: 'ID',
      code: 'ID',
      name: 'Identify',
      description: 'Understand the organisation’s assets, suppliers and related cybersecurity risks.',
      categories: [
        {
          id: 'ID.AM',
          code: 'ID.AM',
          name: 'Asset Management',
          items: [
            { id: 'ID.AM-01', code: 'ID.AM-01', title: 'Hardware inventoried', description: 'Inventories of hardware managed by the organisation are maintained.' },
            { id: 'ID.AM-02', code: 'ID.AM-02', title: 'Software inventoried', description: 'Inventories of software, services and systems are maintained.' },
            { id: 'ID.AM-03', code: 'ID.AM-03', title: 'Network communications mapped', description: 'Representations of authorised network communications and data flows are maintained.' },
            { id: 'ID.AM-04', code: 'ID.AM-04', title: 'External services inventoried', description: 'Inventories of services provided by suppliers are maintained.' },
            { id: 'ID.AM-05', code: 'ID.AM-05', title: 'Assets prioritised', description: 'Assets are prioritised based on classification, criticality, resources and impact.' },
            { id: 'ID.AM-07', code: 'ID.AM-07', title: 'Data inventoried', description: 'Inventories of data and corresponding metadata are maintained.' },
            { id: 'ID.AM-08', code: 'ID.AM-08', title: 'Lifecycle managed', description: 'Hardware, software, services and data are managed throughout their lifecycles.' },
          ],
        },
        {
          id: 'ID.RA',
          code: 'ID.RA',
          name: 'Risk Assessment',
          items: [
            { id: 'ID.RA-01', code: 'ID.RA-01', title: 'Vulnerabilities identified', description: 'Vulnerabilities in assets are identified, validated and recorded.' },
            { id: 'ID.RA-02', code: 'ID.RA-02', title: 'Threat intelligence', description: 'Cyber threat intelligence is received from information sharing forums and sources.' },
            { id: 'ID.RA-03', code: 'ID.RA-03', title: 'Threats identified', description: 'Internal and external threats are identified and recorded.' },
            { id: 'ID.RA-04', code: 'ID.RA-04', title: 'Impacts and likelihoods', description: 'Potential impacts and likelihoods are identified and recorded.' },
            { id: 'ID.RA-05', code: 'ID.RA-05', title: 'Risks prioritised', description: 'Threats, vulnerabilities, likelihoods and impacts are used to determine inherent risk.' },
            { id: 'ID.RA-06', code: 'ID.RA-06', title: 'Risk responses chosen', description: 'Risk responses are chosen, prioritised, planned, tracked and communicated.' },
          ],
        },
        {
          id: 'ID.IM',
          code: 'ID.IM',
          name: 'Improvement',
          items: [
            { id: 'ID.IM-01', code: 'ID.IM-01', title: 'Improvements from assessments', description: 'Improvements identified from assessments are documented and tracked.' },
            { id: 'ID.IM-02', code: 'ID.IM-02', title: 'Improvements from tests', description: 'Improvements identified from tests and exercises are documented and tracked.' },
            { id: 'ID.IM-03', code: 'ID.IM-03', title: 'Operational improvements', description: 'Improvements identified from operational processes and activities are documented.' },
          ],
        },
      ],
    },
    {
      id: 'PR',
      code: 'PR',
      name: 'Protect',
      description: 'Apply safeguards to manage cybersecurity risks.',
      categories: [
        {
          id: 'PR.AA',
          code: 'PR.AA',
          name: 'Identity Management, Authentication, Access Control',
          items: [
            { id: 'PR.AA-01', code: 'PR.AA-01', title: 'Identities and credentials issued', description: 'Identities and credentials for users, services and hardware are managed.' },
            { id: 'PR.AA-02', code: 'PR.AA-02', title: 'Identities proofed', description: 'Identities are proofed and bound to credentials based on context.' },
            { id: 'PR.AA-03', code: 'PR.AA-03', title: 'Users authenticated', description: 'Users, services and hardware are authenticated.' },
            { id: 'PR.AA-04', code: 'PR.AA-04', title: 'Identity assertions protected', description: 'Identity assertions are protected, conveyed and verified.' },
            { id: 'PR.AA-05', code: 'PR.AA-05', title: 'Access permissions defined', description: 'Access permissions, entitlements and authorisations are defined and managed.' },
            { id: 'PR.AA-06', code: 'PR.AA-06', title: 'Physical access managed', description: 'Physical access to assets is managed, monitored and enforced.' },
          ],
        },
        {
          id: 'PR.AT',
          code: 'PR.AT',
          name: 'Awareness and Training',
          items: [
            { id: 'PR.AT-01', code: 'PR.AT-01', title: 'Personnel awareness', description: 'Personnel receive awareness and training so they can perform cybersecurity-related duties.' },
            { id: 'PR.AT-02', code: 'PR.AT-02', title: 'Specialised roles training', description: 'Individuals in specialised roles receive specialised training.' },
          ],
        },
        {
          id: 'PR.DS',
          code: 'PR.DS',
          name: 'Data Security',
          items: [
            { id: 'PR.DS-01', code: 'PR.DS-01', title: 'Data-at-rest protected', description: 'Confidentiality, integrity and availability of data-at-rest are protected.' },
            { id: 'PR.DS-02', code: 'PR.DS-02', title: 'Data-in-transit protected', description: 'Confidentiality, integrity and availability of data-in-transit are protected.' },
            { id: 'PR.DS-10', code: 'PR.DS-10', title: 'Data-in-use protected', description: 'Confidentiality, integrity and availability of data-in-use are protected.' },
            { id: 'PR.DS-11', code: 'PR.DS-11', title: 'Data backups created', description: 'Backups of data are created, protected, maintained and tested.' },
          ],
        },
        {
          id: 'PR.PS',
          code: 'PR.PS',
          name: 'Platform Security',
          items: [
            { id: 'PR.PS-01', code: 'PR.PS-01', title: 'Configuration management', description: 'Configuration management practices are applied.' },
            { id: 'PR.PS-02', code: 'PR.PS-02', title: 'Software maintained', description: 'Software is maintained, replaced and removed commensurate with risk.' },
            { id: 'PR.PS-03', code: 'PR.PS-03', title: 'Hardware maintained', description: 'Hardware is maintained, replaced and removed commensurate with risk.' },
            { id: 'PR.PS-04', code: 'PR.PS-04', title: 'Logs generated', description: 'Log records are generated and made available for continuous monitoring.' },
            { id: 'PR.PS-05', code: 'PR.PS-05', title: 'Unauthorised software prevented', description: 'Installation and execution of unauthorised software are prevented.' },
            { id: 'PR.PS-06', code: 'PR.PS-06', title: 'Secure SDLC', description: 'Secure software development practices are integrated and performance monitored.' },
          ],
        },
        {
          id: 'PR.IR',
          code: 'PR.IR',
          name: 'Technology Infrastructure Resilience',
          items: [
            { id: 'PR.IR-01', code: 'PR.IR-01', title: 'Networks protected', description: 'Networks and environments are protected from unauthorised logical access and usage.' },
            { id: 'PR.IR-02', code: 'PR.IR-02', title: 'Environmental threats protected', description: 'Technology assets are protected from environmental threats.' },
            { id: 'PR.IR-03', code: 'PR.IR-03', title: 'Resilience mechanisms', description: 'Mechanisms are implemented to achieve resilience requirements in normal and adverse situations.' },
            { id: 'PR.IR-04', code: 'PR.IR-04', title: 'Capacity managed', description: 'Adequate resource capacity to ensure availability is maintained.' },
          ],
        },
      ],
    },
    {
      id: 'DE',
      code: 'DE',
      name: 'Detect',
      description: 'Identify and analyse possible cybersecurity attacks and compromises.',
      categories: [
        {
          id: 'DE.CM',
          code: 'DE.CM',
          name: 'Continuous Monitoring',
          items: [
            { id: 'DE.CM-01', code: 'DE.CM-01', title: 'Networks monitored', description: 'Networks and network services are monitored to find potentially adverse events.' },
            { id: 'DE.CM-02', code: 'DE.CM-02', title: 'Physical environment monitored', description: 'The physical environment is monitored to find potentially adverse events.' },
            { id: 'DE.CM-03', code: 'DE.CM-03', title: 'Personnel activity monitored', description: 'Personnel activity and technology usage are monitored.' },
            { id: 'DE.CM-06', code: 'DE.CM-06', title: 'External providers monitored', description: 'External service provider activities and services are monitored.' },
            { id: 'DE.CM-09', code: 'DE.CM-09', title: 'Computing hardware monitored', description: 'Computing hardware and software, runtime environments, and data are monitored.' },
          ],
        },
        {
          id: 'DE.AE',
          code: 'DE.AE',
          name: 'Adverse Event Analysis',
          items: [
            { id: 'DE.AE-02', code: 'DE.AE-02', title: 'Events analysed', description: 'Potentially adverse events are analysed to characterise the nature of the activity.' },
            { id: 'DE.AE-03', code: 'DE.AE-03', title: 'Information correlated', description: 'Information is correlated from multiple sources.' },
            { id: 'DE.AE-04', code: 'DE.AE-04', title: 'Impact estimated', description: 'The estimated impact and scope of adverse events are understood.' },
            { id: 'DE.AE-06', code: 'DE.AE-06', title: 'Information shared', description: 'Information on adverse events is provided to authorised staff and tools.' },
            { id: 'DE.AE-07', code: 'DE.AE-07', title: 'Threat intelligence integrated', description: 'Cyber threat intelligence and other contextual information are integrated into analysis.' },
            { id: 'DE.AE-08', code: 'DE.AE-08', title: 'Incidents declared', description: 'Incidents are declared when adverse events meet defined incident criteria.' },
          ],
        },
      ],
    },
    {
      id: 'RS',
      code: 'RS',
      name: 'Respond',
      description: 'Take action regarding a detected cybersecurity incident.',
      categories: [
        {
          id: 'RS.MA',
          code: 'RS.MA',
          name: 'Incident Management',
          items: [
            { id: 'RS.MA-01', code: 'RS.MA-01', title: 'Response plan executed', description: 'The incident response plan is executed once an incident is declared.' },
            { id: 'RS.MA-02', code: 'RS.MA-02', title: 'Incidents triaged', description: 'Incidents are triaged and validated.' },
            { id: 'RS.MA-03', code: 'RS.MA-03', title: 'Incidents categorised', description: 'Incidents are categorised and prioritised.' },
            { id: 'RS.MA-04', code: 'RS.MA-04', title: 'Incidents escalated', description: 'Incidents are escalated or elevated as needed.' },
            { id: 'RS.MA-05', code: 'RS.MA-05', title: 'Criteria for incident closure', description: 'Criteria for incident closure are applied.' },
          ],
        },
        {
          id: 'RS.AN',
          code: 'RS.AN',
          name: 'Incident Analysis',
          items: [
            { id: 'RS.AN-03', code: 'RS.AN-03', title: 'Incident analysis performed', description: 'Analysis is performed to establish what has taken place during an incident.' },
            { id: 'RS.AN-06', code: 'RS.AN-06', title: 'Actions logged', description: 'Actions performed during an investigation are recorded with their justification.' },
            { id: 'RS.AN-07', code: 'RS.AN-07', title: 'Incident data preserved', description: 'Incident data and metadata are collected and their integrity preserved.' },
          ],
        },
        {
          id: 'RS.CO',
          code: 'RS.CO',
          name: 'Incident Response Reporting and Communication',
          items: [
            { id: 'RS.CO-02', code: 'RS.CO-02', title: 'Stakeholders notified', description: 'Internal and external stakeholders are notified of incidents.' },
            { id: 'RS.CO-03', code: 'RS.CO-03', title: 'Information shared with designated parties', description: 'Information is shared with designated stakeholders.' },
          ],
        },
        {
          id: 'RS.MI',
          code: 'RS.MI',
          name: 'Incident Mitigation',
          items: [
            { id: 'RS.MI-01', code: 'RS.MI-01', title: 'Incidents contained', description: 'Incidents are contained.' },
            { id: 'RS.MI-02', code: 'RS.MI-02', title: 'Incidents eradicated', description: 'Incidents are eradicated.' },
          ],
        },
      ],
    },
    {
      id: 'RC',
      code: 'RC',
      name: 'Recover',
      description: 'Restore assets and operations affected by a cybersecurity incident.',
      categories: [
        {
          id: 'RC.RP',
          code: 'RC.RP',
          name: 'Incident Recovery Plan Execution',
          items: [
            { id: 'RC.RP-01', code: 'RC.RP-01', title: 'Recovery plan executed', description: 'The recovery portion of the incident response plan is executed.' },
            { id: 'RC.RP-02', code: 'RC.RP-02', title: 'Recovery actions selected', description: 'Recovery actions are selected, scoped, prioritised and performed.' },
            { id: 'RC.RP-03', code: 'RC.RP-03', title: 'Backups verified', description: 'The integrity of backups and other recovery assets is verified before use.' },
            { id: 'RC.RP-04', code: 'RC.RP-04', title: 'Critical mission functions resumed', description: 'Critical mission functions and risk management considered to establish post-incident posture.' },
            { id: 'RC.RP-05', code: 'RC.RP-05', title: 'Integrity verified', description: 'The integrity of restored assets is verified, systems and services restored, and normal operating status confirmed.' },
            { id: 'RC.RP-06', code: 'RC.RP-06', title: 'End of recovery declared', description: 'The end of incident recovery is declared based on criteria, and incident-related documentation completed.' },
          ],
        },
        {
          id: 'RC.CO',
          code: 'RC.CO',
          name: 'Incident Recovery Communication',
          items: [
            { id: 'RC.CO-03', code: 'RC.CO-03', title: 'Recovery communicated to stakeholders', description: 'Recovery activities and progress are communicated to designated internal and external stakeholders.' },
            { id: 'RC.CO-04', code: 'RC.CO-04', title: 'Public updates issued', description: 'Public updates on incident recovery are shared, where appropriate, using approved methods and messaging.' },
          ],
        },
      ],
    },
  ],
};
