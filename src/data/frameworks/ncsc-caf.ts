import type { Framework } from '@/types';

// NCSC Cyber Assessment Framework v4.0
// Objectives A–D, Principles, Contributing Outcomes.

export const NCSC_CAF: Framework = {
  id: 'NCSC_CAF_4_0',
  name: 'NCSC Cyber Assessment Framework',
  shortName: 'NCSC CAF',
  version: '4.0',
  description:
    'NCSC outcome-based framework for assessing cyber resilience of organisations performing essential functions. Four objectives A–D, fourteen principles and thirty-nine contributing outcomes.',
  groups: [
    {
      id: 'A',
      code: 'A',
      name: 'Managing Security Risk',
      description: 'Appropriate organisational structures, policies and processes to understand, assess and systematically manage security risks.',
      categories: [
        { id: 'A1', code: 'A1', name: 'Governance', items: [
          { id: 'A1.a', code: 'A1.a', title: 'Board Direction', description: 'Effective security risk management is directed and overseen at board level.' },
          { id: 'A1.b', code: 'A1.b', title: 'Roles and Responsibilities', description: 'Roles and responsibilities for security across the organisation are clear and understood.' },
          { id: 'A1.c', code: 'A1.c', title: 'Decision-making', description: 'Security decision-making is informed by accurate information and uses defined processes.' },
        ]},
        { id: 'A2', code: 'A2', name: 'Risk Management', items: [
          { id: 'A2.a', code: 'A2.a', title: 'Risk Management Process', description: 'A systematic process is in place to identify, assess and understand security risks to essential functions.' },
          { id: 'A2.b', code: 'A2.b', title: 'Assurance', description: 'Confidence in security measures is gained through structured assurance activities.' },
        ]},
        { id: 'A3', code: 'A3', name: 'Asset Management', items: [
          { id: 'A3.a', code: 'A3.a', title: 'Asset Management', description: 'Everything required to deliver, maintain or support essential functions is determined and understood.' },
        ]},
        { id: 'A4', code: 'A4', name: 'Supply Chain', items: [
          { id: 'A4.a', code: 'A4.a', title: 'Supply Chain', description: 'Risks to essential functions arising from the supply chain are understood and managed.' },
        ]},
      ],
    },
    {
      id: 'B',
      code: 'B',
      name: 'Protecting Against Cyber Attack',
      description: 'Proportionate security measures to protect essential functions and the systems supporting them from cyber attack.',
      categories: [
        { id: 'B1', code: 'B1', name: 'Service Protection Policies, Processes and Procedures', items: [
          { id: 'B1.a', code: 'B1.a', title: 'Policy, Process and Procedure Development', description: 'Policies and processes are developed, communicated and implemented to control security risks.' },
          { id: 'B1.b', code: 'B1.b', title: 'Policy, Process and Procedure Implementation', description: 'Policies and processes are followed; non-compliance is detected and responded to.' },
        ]},
        { id: 'B2', code: 'B2', name: 'Identity and Access Control', items: [
          { id: 'B2.a', code: 'B2.a', title: 'Identity Verification, Authentication and Authorisation', description: 'Robust verification, authentication and authorisation are applied to access systems and information.' },
          { id: 'B2.b', code: 'B2.b', title: 'Device Management', description: 'Only authorised, well-managed devices have access.' },
          { id: 'B2.c', code: 'B2.c', title: 'Privileged User Management', description: 'Privileged users are subject to enhanced controls.' },
          { id: 'B2.d', code: 'B2.d', title: 'Identity and Access Management (IdAM)', description: 'Establish and maintain identity and access management policies and processes.' },
        ]},
        { id: 'B3', code: 'B3', name: 'Data Security', items: [
          { id: 'B3.a', code: 'B3.a', title: 'Understanding Data', description: 'Data important to essential functions is understood across its lifecycle.' },
          { id: 'B3.b', code: 'B3.b', title: 'Data in Transit', description: 'Data in transit is suitably protected.' },
          { id: 'B3.c', code: 'B3.c', title: 'Stored Data', description: 'Data at rest is protected against unauthorised access, modification and deletion.' },
          { id: 'B3.d', code: 'B3.d', title: 'Mobile Data', description: 'Data is protected on mobile and removable media.' },
          { id: 'B3.e', code: 'B3.e', title: 'Media/Equipment Sanitisation', description: 'Media and equipment are sanitised before reuse or disposal.' },
        ]},
        { id: 'B4', code: 'B4', name: 'System Security', items: [
          { id: 'B4.a', code: 'B4.a', title: 'Secure by Design', description: 'Systems are designed and configured to reduce the likelihood and impact of attack.' },
          { id: 'B4.b', code: 'B4.b', title: 'Secure Configuration', description: 'Systems are securely configured throughout their lifecycle.' },
          { id: 'B4.c', code: 'B4.c', title: 'Secure Management', description: 'Systems are managed securely.' },
          { id: 'B4.d', code: 'B4.d', title: 'Vulnerability Management', description: 'Vulnerabilities are managed before they can be exploited.' },
        ]},
        { id: 'B5', code: 'B5', name: 'Resilient Networks and Systems', items: [
          { id: 'B5.a', code: 'B5.a', title: 'Resilience Preparation', description: 'Systems are designed to maintain delivery of essential functions in adverse conditions.' },
          { id: 'B5.b', code: 'B5.b', title: 'Design for Resilience', description: 'Resilience is built into system design.' },
          { id: 'B5.c', code: 'B5.c', title: 'Backups', description: 'Backups of important data and information are maintained, securely stored and tested.' },
        ]},
        { id: 'B6', code: 'B6', name: 'Staff Awareness and Training', items: [
          { id: 'B6.a', code: 'B6.a', title: 'Cyber Security Culture', description: 'A positive cybersecurity culture is established.' },
          { id: 'B6.b', code: 'B6.b', title: 'Cyber Security Training', description: 'Staff have appropriate cyber security awareness and training.' },
        ]},
      ],
    },
    {
      id: 'C',
      code: 'C',
      name: 'Detecting Cyber Security Events',
      description: 'Capabilities to ensure security defences remain effective and to detect cyber security events.',
      categories: [
        { id: 'C1', code: 'C1', name: 'Security Monitoring', items: [
          { id: 'C1.a', code: 'C1.a', title: 'Monitoring Coverage', description: 'Monitoring covers the essential function and supporting infrastructure.' },
          { id: 'C1.b', code: 'C1.b', title: 'Securing Logs', description: 'Logging is reliable and supports investigation.' },
          { id: 'C1.c', code: 'C1.c', title: 'Generating Alerts', description: 'Evidence of potential security incidents in monitored data is identified.' },
          { id: 'C1.d', code: 'C1.d', title: 'Identifying Security Incidents', description: 'Security events are correlated to identify potential incidents.' },
          { id: 'C1.e', code: 'C1.e', title: 'Monitoring Tools and Skills', description: 'Tools and skills are sufficient to support monitoring.' },
        ]},
        { id: 'C2', code: 'C2', name: 'Proactive Security Event Discovery', items: [
          { id: 'C2.a', code: 'C2.a', title: 'System Abnormalities for Attack Detection', description: 'Capabilities to detect abnormalities indicative of an attack.' },
          { id: 'C2.b', code: 'C2.b', title: 'Proactive Attack Discovery', description: 'Methods to proactively discover attacker activity, including threat hunting.' },
        ]},
      ],
    },
    {
      id: 'D',
      code: 'D',
      name: 'Minimising the Impact of Cyber Security Incidents',
      description: 'Capabilities to minimise the impact of cyber security incidents on essential functions.',
      categories: [
        { id: 'D1', code: 'D1', name: 'Response and Recovery Planning', items: [
          { id: 'D1.a', code: 'D1.a', title: 'Response Plan', description: 'A response plan exists, is up-to-date and is suitable to handle realistic incidents.' },
          { id: 'D1.b', code: 'D1.b', title: 'Response and Recovery Capability', description: 'Capability is in place to deliver an effective response and recovery.' },
          { id: 'D1.c', code: 'D1.c', title: 'Testing and Exercising', description: 'Plans are tested and exercised to confirm their effectiveness.' },
        ]},
        { id: 'D2', code: 'D2', name: 'Lessons Learned', items: [
          { id: 'D2.a', code: 'D2.a', title: 'Incident Root Cause Analysis', description: 'Root cause analysis is conducted on incidents.' },
          { id: 'D2.b', code: 'D2.b', title: 'Using Incidents to Drive Improvements', description: 'Lessons learned are used to drive security improvements.' },
        ]},
      ],
    },
  ],
};
