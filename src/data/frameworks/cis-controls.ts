import type { Framework } from '@/types';

// CIS Critical Security Controls v8.1.2 — representative safeguards across 18 controls.
// IG tiers per safeguard.

export const CIS_CONTROLS: Framework = {
  id: 'CIS_V8_1_2',
  name: 'CIS Critical Security Controls',
  shortName: 'CIS Controls',
  version: '8.1.2',
  description:
    'Prioritised set of safeguards published by the Center for Internet Security, organised across 18 Controls and 153 Safeguards with three Implementation Group tiers.',
  groups: [
    {
      id: 'CIS-01',
      code: '01',
      name: 'Inventory and Control of Enterprise Assets',
      categories: [
        {
          id: 'CIS-01-CAT',
          code: '01',
          name: 'Safeguards',
          items: [
            { id: 'CIS-1.1', code: '1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', description: 'Maintain an accurate, up-to-date inventory of all enterprise assets with the potential to store or process data.', igTier: 1, assetType: 'Devices', securityFunction: 'Identify' },
            { id: 'CIS-1.2', code: '1.2', title: 'Address Unauthorised Assets', description: 'Ensure unauthorised assets are removed from the network, denied access, or quarantined.', igTier: 1, assetType: 'Devices', securityFunction: 'Respond' },
            { id: 'CIS-1.3', code: '1.3', title: 'Utilise an Active Discovery Tool', description: 'Use an active discovery tool to identify assets connected to the enterprise network.', igTier: 2, assetType: 'Devices', securityFunction: 'Detect' },
            { id: 'CIS-1.4', code: '1.4', title: 'Use DHCP Logging to Update Inventory', description: 'Use DHCP logging on DHCP servers or IP address management tools to update the inventory.', igTier: 2, assetType: 'Devices', securityFunction: 'Identify' },
            { id: 'CIS-1.5', code: '1.5', title: 'Passive Asset Discovery', description: 'Use passive discovery to identify assets connected to the network.', igTier: 3, assetType: 'Devices', securityFunction: 'Detect' },
          ],
        },
      ],
    },
    {
      id: 'CIS-02',
      code: '02',
      name: 'Inventory and Control of Software Assets',
      categories: [
        {
          id: 'CIS-02-CAT',
          code: '02',
          name: 'Safeguards',
          items: [
            { id: 'CIS-2.1', code: '2.1', title: 'Establish and Maintain a Software Inventory', description: 'Maintain a detailed inventory of all licensed software installed on enterprise assets.', igTier: 1, assetType: 'Applications', securityFunction: 'Identify' },
            { id: 'CIS-2.2', code: '2.2', title: 'Ensure Authorised Software is Currently Supported', description: 'Ensure that only currently supported software is designated as authorised.', igTier: 1, assetType: 'Applications', securityFunction: 'Identify' },
            { id: 'CIS-2.3', code: '2.3', title: 'Address Unauthorised Software', description: 'Ensure unauthorised software is removed or receives a documented exception.', igTier: 1, assetType: 'Applications', securityFunction: 'Respond' },
            { id: 'CIS-2.4', code: '2.4', title: 'Utilise Automated Software Inventory Tools', description: 'Utilise software inventory tools to automate documentation of software on assets.', igTier: 2, assetType: 'Applications', securityFunction: 'Detect' },
            { id: 'CIS-2.5', code: '2.5', title: 'Allowlist Authorised Software', description: 'Use technical controls to ensure only authorised software is allowed to execute or be accessed.', igTier: 2, assetType: 'Applications', securityFunction: 'Protect' },
            { id: 'CIS-2.6', code: '2.6', title: 'Allowlist Authorised Libraries', description: 'Use technical controls to ensure only authorised libraries are loaded by enterprise processes.', igTier: 2, assetType: 'Applications', securityFunction: 'Protect' },
            { id: 'CIS-2.7', code: '2.7', title: 'Allowlist Authorised Scripts', description: 'Use technical controls to ensure only authorised scripts can execute.', igTier: 3, assetType: 'Applications', securityFunction: 'Protect' },
          ],
        },
      ],
    },
    {
      id: 'CIS-03',
      code: '03',
      name: 'Data Protection',
      categories: [
        {
          id: 'CIS-03-CAT',
          code: '03',
          name: 'Safeguards',
          items: [
            { id: 'CIS-3.1', code: '3.1', title: 'Establish and Maintain a Data Management Process', description: 'Establish and maintain a data management process addressing classification, handling, retention and disposal.', igTier: 1, assetType: 'Data', securityFunction: 'Identify' },
            { id: 'CIS-3.2', code: '3.2', title: 'Establish and Maintain a Data Inventory', description: 'Establish and maintain an inventory of sensitive data.', igTier: 1, assetType: 'Data', securityFunction: 'Identify' },
            { id: 'CIS-3.3', code: '3.3', title: 'Configure Data Access Control Lists', description: 'Configure access control lists based on a need-to-know basis.', igTier: 1, assetType: 'Data', securityFunction: 'Protect' },
            { id: 'CIS-3.4', code: '3.4', title: 'Enforce Data Retention', description: 'Retain data according to the data management process.', igTier: 1, assetType: 'Data', securityFunction: 'Protect' },
            { id: 'CIS-3.5', code: '3.5', title: 'Securely Dispose of Data', description: 'Securely dispose of data as outlined in the data management process.', igTier: 1, assetType: 'Data', securityFunction: 'Protect' },
            { id: 'CIS-3.6', code: '3.6', title: 'Encrypt Data on End-User Devices', description: 'Encrypt data on end-user devices containing sensitive data.', igTier: 1, assetType: 'Devices', securityFunction: 'Protect' },
            { id: 'CIS-3.10', code: '3.10', title: 'Encrypt Sensitive Data in Transit', description: 'Encrypt sensitive data in transit.', igTier: 2, assetType: 'Data', securityFunction: 'Protect' },
            { id: 'CIS-3.11', code: '3.11', title: 'Encrypt Sensitive Data at Rest', description: 'Encrypt sensitive data at rest on servers, applications and databases.', igTier: 2, assetType: 'Data', securityFunction: 'Protect' },
            { id: 'CIS-3.12', code: '3.12', title: 'Segment Data Processing', description: 'Segment data processing based on sensitivity.', igTier: 2, assetType: 'Network', securityFunction: 'Protect' },
            { id: 'CIS-3.13', code: '3.13', title: 'Deploy DLP Solution', description: 'Implement a data loss prevention solution.', igTier: 3, assetType: 'Data', securityFunction: 'Protect' },
          ],
        },
      ],
    },
    {
      id: 'CIS-04',
      code: '04',
      name: 'Secure Configuration of Enterprise Assets and Software',
      categories: [
        {
          id: 'CIS-04-CAT',
          code: '04',
          name: 'Safeguards',
          items: [
            { id: 'CIS-4.1', code: '4.1', title: 'Establish and Maintain a Secure Configuration Process', description: 'Establish a secure configuration process for enterprise assets and software.', igTier: 1, assetType: 'Applications', securityFunction: 'Protect' },
            { id: 'CIS-4.2', code: '4.2', title: 'Secure Configuration for Network Infrastructure', description: 'Establish a secure configuration process for network devices.', igTier: 1, assetType: 'Network', securityFunction: 'Protect' },
            { id: 'CIS-4.3', code: '4.3', title: 'Configure Automatic Session Locking', description: 'Configure automatic session locking on enterprise assets.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
            { id: 'CIS-4.4', code: '4.4', title: 'Implement and Manage a Firewall on Servers', description: 'Implement host-based firewalls on servers.', igTier: 1, assetType: 'Devices', securityFunction: 'Protect' },
            { id: 'CIS-4.5', code: '4.5', title: 'Implement and Manage a Firewall on End-User Devices', description: 'Implement host-based firewalls on end-user devices.', igTier: 1, assetType: 'Devices', securityFunction: 'Protect' },
            { id: 'CIS-4.6', code: '4.6', title: 'Securely Manage Enterprise Assets and Software', description: 'Securely manage assets and software using version-controlled IaC and SSH/HTTPS.', igTier: 2, assetType: 'Network', securityFunction: 'Protect' },
            { id: 'CIS-4.7', code: '4.7', title: 'Manage Default Accounts on Enterprise Assets', description: 'Manage default accounts on enterprise assets and software.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
          ],
        },
      ],
    },
    {
      id: 'CIS-05',
      code: '05',
      name: 'Account Management',
      categories: [
        {
          id: 'CIS-05-CAT', code: '05', name: 'Safeguards',
          items: [
            { id: 'CIS-5.1', code: '5.1', title: 'Establish and Maintain an Inventory of Accounts', description: 'Maintain an inventory of all accounts managed in the enterprise.', igTier: 1, assetType: 'Users', securityFunction: 'Identify' },
            { id: 'CIS-5.2', code: '5.2', title: 'Use Unique Passwords', description: 'Use unique passwords for all enterprise assets.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
            { id: 'CIS-5.3', code: '5.3', title: 'Disable Dormant Accounts', description: 'Delete or disable dormant accounts after a defined period of inactivity.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
            { id: 'CIS-5.4', code: '5.4', title: 'Restrict Administrator Privileges to Dedicated Accounts', description: 'Use dedicated administrator accounts separate from primary user accounts.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
            { id: 'CIS-5.5', code: '5.5', title: 'Establish and Maintain an Inventory of Service Accounts', description: 'Maintain an inventory of service accounts.', igTier: 2, assetType: 'Users', securityFunction: 'Identify' },
            { id: 'CIS-5.6', code: '5.6', title: 'Centralise Account Management', description: 'Centralise account management through a directory or identity service.', igTier: 2, assetType: 'Users', securityFunction: 'Protect' },
          ],
        },
      ],
    },
    {
      id: 'CIS-06', code: '06', name: 'Access Control Management',
      categories: [{ id: 'CIS-06-CAT', code: '06', name: 'Safeguards', items: [
        { id: 'CIS-6.1', code: '6.1', title: 'Establish an Access Granting Process', description: 'Establish a process to grant access on new hire, role change or other event.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-6.2', code: '6.2', title: 'Establish an Access Revoking Process', description: 'Establish a process to revoke access promptly.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-6.3', code: '6.3', title: 'Require MFA for Externally-Exposed Applications', description: 'Require MFA for externally-exposed enterprise or third-party applications.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-6.4', code: '6.4', title: 'Require MFA for Remote Network Access', description: 'Require MFA for remote network access.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-6.5', code: '6.5', title: 'Require MFA for Administrative Access', description: 'Require MFA for all administrative access.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-6.7', code: '6.7', title: 'Centralise Access Control', description: 'Centralise access control for all enterprise assets through SSO.', igTier: 2, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-6.8', code: '6.8', title: 'Define and Maintain Role-Based Access Control', description: 'Define and maintain role-based access control.', igTier: 3, assetType: 'Data', securityFunction: 'Protect' },
      ] }],
    },
    {
      id: 'CIS-07', code: '07', name: 'Continuous Vulnerability Management',
      categories: [{ id: 'CIS-07-CAT', code: '07', name: 'Safeguards', items: [
        { id: 'CIS-7.1', code: '7.1', title: 'Establish a Vulnerability Management Process', description: 'Establish a documented vulnerability management process.', igTier: 1, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-7.2', code: '7.2', title: 'Establish a Remediation Process', description: 'Establish a risk-based remediation strategy with monthly cadence.', igTier: 1, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-7.3', code: '7.3', title: 'Perform Automated OS Patch Management', description: 'Perform OS patches monthly or more frequently.', igTier: 1, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-7.4', code: '7.4', title: 'Perform Automated Application Patch Management', description: 'Perform application updates monthly or more frequently.', igTier: 1, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-7.5', code: '7.5', title: 'Perform Automated Vulnerability Scans of Internal Assets', description: 'Perform internal scans on a quarterly or greater frequency.', igTier: 2, assetType: 'Applications', securityFunction: 'Identify' },
        { id: 'CIS-7.6', code: '7.6', title: 'Perform Automated Vulnerability Scans of Externally-Exposed Assets', description: 'Perform external scans monthly or more frequently.', igTier: 2, assetType: 'Applications', securityFunction: 'Identify' },
        { id: 'CIS-7.7', code: '7.7', title: 'Remediate Detected Vulnerabilities', description: 'Remediate detected vulnerabilities through processes and tooling on a monthly basis.', igTier: 2, assetType: 'Applications', securityFunction: 'Respond' },
      ] }],
    },
    {
      id: 'CIS-08', code: '08', name: 'Audit Log Management',
      categories: [{ id: 'CIS-08-CAT', code: '08', name: 'Safeguards', items: [
        { id: 'CIS-8.1', code: '8.1', title: 'Establish and Maintain an Audit Log Management Process', description: 'Establish a logging process for collection, alerting, retention and review.', igTier: 1, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-8.2', code: '8.2', title: 'Collect Audit Logs', description: 'Collect audit logs across enterprise assets.', igTier: 1, assetType: 'Network', securityFunction: 'Detect' },
        { id: 'CIS-8.3', code: '8.3', title: 'Ensure Adequate Audit Log Storage', description: 'Ensure logging destinations have adequate storage.', igTier: 1, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-8.5', code: '8.5', title: 'Collect Detailed Audit Logs', description: 'Configure detailed logs to include event source, date, user, timestamp, address, etc.', igTier: 2, assetType: 'Network', securityFunction: 'Detect' },
        { id: 'CIS-8.6', code: '8.6', title: 'Collect DNS Query Audit Logs', description: 'Collect DNS query audit logs.', igTier: 2, assetType: 'Network', securityFunction: 'Detect' },
        { id: 'CIS-8.9', code: '8.9', title: 'Centralise Audit Logs', description: 'Centralise audit logs in a single platform.', igTier: 2, assetType: 'Network', securityFunction: 'Detect' },
        { id: 'CIS-8.11', code: '8.11', title: 'Conduct Audit Log Reviews', description: 'Conduct reviews of audit logs to detect anomalies.', igTier: 2, assetType: 'Network', securityFunction: 'Detect' },
      ] }],
    },
    {
      id: 'CIS-09', code: '09', name: 'Email and Web Browser Protections',
      categories: [{ id: 'CIS-09-CAT', code: '09', name: 'Safeguards', items: [
        { id: 'CIS-9.1', code: '9.1', title: 'Ensure Use of Only Fully Supported Browsers and Email Clients', description: 'Use only fully supported browsers and email clients.', igTier: 1, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-9.2', code: '9.2', title: 'Use DNS Filtering Services', description: 'Use DNS filtering services on enterprise assets.', igTier: 1, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-9.3', code: '9.3', title: 'Maintain and Enforce Network-Based URL Filters', description: 'Enforce network-based URL filters to limit access to malicious websites.', igTier: 2, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-9.6', code: '9.6', title: 'Block Unnecessary File Types', description: 'Block unnecessary file types reaching enterprise assets via email.', igTier: 2, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-9.7', code: '9.7', title: 'Deploy and Maintain Email Server Anti-Malware Protections', description: 'Deploy and maintain anti-malware on email servers.', igTier: 3, assetType: 'Network', securityFunction: 'Protect' },
      ] }],
    },
    {
      id: 'CIS-10', code: '10', name: 'Malware Defences',
      categories: [{ id: 'CIS-10-CAT', code: '10', name: 'Safeguards', items: [
        { id: 'CIS-10.1', code: '10.1', title: 'Deploy and Maintain Anti-Malware Software', description: 'Deploy anti-malware on all enterprise assets.', igTier: 1, assetType: 'Devices', securityFunction: 'Protect' },
        { id: 'CIS-10.2', code: '10.2', title: 'Configure Automatic Anti-Malware Signature Updates', description: 'Configure automatic anti-malware signature updates on assets.', igTier: 1, assetType: 'Devices', securityFunction: 'Protect' },
        { id: 'CIS-10.3', code: '10.3', title: 'Disable Autorun and Autoplay for Removable Media', description: 'Disable autorun/autoplay across all enterprise assets.', igTier: 1, assetType: 'Devices', securityFunction: 'Protect' },
        { id: 'CIS-10.5', code: '10.5', title: 'Enable Anti-Exploitation Features', description: 'Enable anti-exploitation features such as DEP, ASLR.', igTier: 2, assetType: 'Devices', securityFunction: 'Protect' },
        { id: 'CIS-10.6', code: '10.6', title: 'Centrally Manage Anti-Malware Software', description: 'Centrally manage anti-malware software.', igTier: 2, assetType: 'Devices', securityFunction: 'Protect' },
        { id: 'CIS-10.7', code: '10.7', title: 'Use Behaviour-Based Anti-Malware', description: 'Use behaviour-based anti-malware software.', igTier: 2, assetType: 'Devices', securityFunction: 'Detect' },
      ] }],
    },
    {
      id: 'CIS-11', code: '11', name: 'Data Recovery',
      categories: [{ id: 'CIS-11-CAT', code: '11', name: 'Safeguards', items: [
        { id: 'CIS-11.1', code: '11.1', title: 'Establish and Maintain a Data Recovery Process', description: 'Establish a data recovery process and document scope, schedules and methods.', igTier: 1, assetType: 'Data', securityFunction: 'Recover' },
        { id: 'CIS-11.2', code: '11.2', title: 'Perform Automated Backups', description: 'Perform automated backups on at least a weekly basis.', igTier: 1, assetType: 'Data', securityFunction: 'Recover' },
        { id: 'CIS-11.3', code: '11.3', title: 'Protect Recovery Data', description: 'Protect recovery data with equivalent controls to source data.', igTier: 1, assetType: 'Data', securityFunction: 'Protect' },
        { id: 'CIS-11.4', code: '11.4', title: 'Establish and Maintain an Isolated Instance of Recovery Data', description: 'Maintain an isolated instance of recovery data.', igTier: 1, assetType: 'Data', securityFunction: 'Recover' },
        { id: 'CIS-11.5', code: '11.5', title: 'Test Data Recovery', description: 'Test backup recovery quarterly or more frequently for IG2/IG3 enterprises.', igTier: 2, assetType: 'Data', securityFunction: 'Recover' },
      ] }],
    },
    {
      id: 'CIS-12', code: '12', name: 'Network Infrastructure Management',
      categories: [{ id: 'CIS-12-CAT', code: '12', name: 'Safeguards', items: [
        { id: 'CIS-12.1', code: '12.1', title: 'Ensure Network Infrastructure is Up-to-Date', description: 'Ensure network infrastructure is up-to-date.', igTier: 1, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-12.2', code: '12.2', title: 'Establish and Maintain a Secure Network Architecture', description: 'Maintain a secure network architecture.', igTier: 2, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-12.3', code: '12.3', title: 'Securely Manage Network Infrastructure', description: 'Securely manage network infrastructure using version control and secure protocols.', igTier: 2, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-12.5', code: '12.5', title: 'Centralise Network Authentication, Authorisation, and Auditing (AAA)', description: 'Centralise AAA across the network.', igTier: 2, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-12.6', code: '12.6', title: 'Use Secure Network Management and Communications Protocols', description: 'Use secure network management protocols (e.g. SNMPv3, SSHv2).', igTier: 2, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-12.8', code: '12.8', title: 'Establish and Maintain Dedicated Computing Resources for All Administrative Work', description: 'Maintain dedicated workstations for administrative tasks.', igTier: 3, assetType: 'Devices', securityFunction: 'Protect' },
      ] }],
    },
    {
      id: 'CIS-13', code: '13', name: 'Network Monitoring and Defence',
      categories: [{ id: 'CIS-13-CAT', code: '13', name: 'Safeguards', items: [
        { id: 'CIS-13.1', code: '13.1', title: 'Centralise Security Event Alerting', description: 'Centralise security event alerting across enterprise assets to a SIEM.', igTier: 2, assetType: 'Network', securityFunction: 'Detect' },
        { id: 'CIS-13.2', code: '13.2', title: 'Deploy a Host-Based Intrusion Detection Solution', description: 'Deploy a host-based intrusion detection solution on enterprise assets.', igTier: 2, assetType: 'Devices', securityFunction: 'Detect' },
        { id: 'CIS-13.3', code: '13.3', title: 'Deploy a Network Intrusion Detection Solution', description: 'Deploy a network intrusion detection solution.', igTier: 2, assetType: 'Network', securityFunction: 'Detect' },
        { id: 'CIS-13.6', code: '13.6', title: 'Collect Network Traffic Flow Logs', description: 'Collect network traffic flow logs.', igTier: 2, assetType: 'Network', securityFunction: 'Detect' },
        { id: 'CIS-13.10', code: '13.10', title: 'Perform Application Layer Filtering', description: 'Perform application layer filtering with proxy or NGFW.', igTier: 3, assetType: 'Network', securityFunction: 'Protect' },
      ] }],
    },
    {
      id: 'CIS-14', code: '14', name: 'Security Awareness and Skills Training',
      categories: [{ id: 'CIS-14-CAT', code: '14', name: 'Safeguards', items: [
        { id: 'CIS-14.1', code: '14.1', title: 'Establish and Maintain a Security Awareness Programme', description: 'Establish and maintain a security awareness programme.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-14.2', code: '14.2', title: 'Train Workforce Members to Recognise Social Engineering Attacks', description: 'Train workforce on phishing, vishing, smishing and other social engineering.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-14.3', code: '14.3', title: 'Train Workforce Members on Authentication Best Practices', description: 'Train on MFA, password composition and credential management.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-14.4', code: '14.4', title: 'Train Workforce on Data Handling Best Practices', description: 'Train workforce on the secure handling of data.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
        { id: 'CIS-14.6', code: '14.6', title: 'Train Workforce on Causes of Unintentional Data Exposure', description: 'Train on causes such as misdelivery and misconfiguration.', igTier: 1, assetType: 'Users', securityFunction: 'Protect' },
      ] }],
    },
    {
      id: 'CIS-15', code: '15', name: 'Service Provider Management',
      categories: [{ id: 'CIS-15-CAT', code: '15', name: 'Safeguards', items: [
        { id: 'CIS-15.1', code: '15.1', title: 'Establish and Maintain an Inventory of Service Providers', description: 'Maintain inventory of service providers and their classifications.', igTier: 1, assetType: 'Data', securityFunction: 'Identify' },
        { id: 'CIS-15.2', code: '15.2', title: 'Establish and Maintain a Service Provider Management Policy', description: 'Establish a service provider management policy.', igTier: 2, assetType: 'Data', securityFunction: 'Identify' },
        { id: 'CIS-15.3', code: '15.3', title: 'Classify Service Providers', description: 'Classify service providers by risk and data sensitivity.', igTier: 2, assetType: 'Data', securityFunction: 'Identify' },
        { id: 'CIS-15.4', code: '15.4', title: 'Ensure Service Provider Contracts Include Security Requirements', description: 'Ensure security requirements are included in third-party contracts.', igTier: 2, assetType: 'Data', securityFunction: 'Identify' },
        { id: 'CIS-15.5', code: '15.5', title: 'Assess Service Providers', description: 'Assess service providers on a defined cadence consistent with classification.', igTier: 3, assetType: 'Data', securityFunction: 'Identify' },
      ] }],
    },
    {
      id: 'CIS-16', code: '16', name: 'Application Software Security',
      categories: [{ id: 'CIS-16-CAT', code: '16', name: 'Safeguards', items: [
        { id: 'CIS-16.1', code: '16.1', title: 'Establish and Maintain a Secure Application Development Process', description: 'Establish a secure application development process.', igTier: 2, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-16.2', code: '16.2', title: 'Establish and Maintain a Process to Accept and Address Software Vulnerabilities', description: 'Maintain a process to accept and address software vulnerabilities.', igTier: 2, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-16.5', code: '16.5', title: 'Use Up-to-Date and Trusted Third-Party Software Components', description: 'Use up-to-date trusted third-party software components.', igTier: 2, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-16.7', code: '16.7', title: 'Use Standard Hardening Configuration Templates for Application Infrastructure', description: 'Use standard, industry-recommended hardening templates.', igTier: 2, assetType: 'Applications', securityFunction: 'Protect' },
        { id: 'CIS-16.11', code: '16.11', title: 'Leverage Vetted Modules or Services for Application Security Components', description: 'Leverage vetted modules for security components such as identity, encryption.', igTier: 2, assetType: 'Applications', securityFunction: 'Protect' },
      ] }],
    },
    {
      id: 'CIS-17', code: '17', name: 'Incident Response Management',
      categories: [{ id: 'CIS-17-CAT', code: '17', name: 'Safeguards', items: [
        { id: 'CIS-17.1', code: '17.1', title: 'Designate Personnel to Manage Incident Handling', description: 'Designate personnel to manage incident handling.', igTier: 1, assetType: 'N/A', securityFunction: 'Respond' },
        { id: 'CIS-17.2', code: '17.2', title: 'Establish and Maintain Contact Information for Reporting Security Incidents', description: 'Maintain contact information for reporting security incidents.', igTier: 1, assetType: 'N/A', securityFunction: 'Respond' },
        { id: 'CIS-17.3', code: '17.3', title: 'Establish and Maintain an Enterprise Process for Reporting Incidents', description: 'Establish a process for reporting incidents.', igTier: 1, assetType: 'N/A', securityFunction: 'Respond' },
        { id: 'CIS-17.4', code: '17.4', title: 'Establish and Maintain an Incident Response Process', description: 'Establish and maintain an incident response process.', igTier: 2, assetType: 'N/A', securityFunction: 'Respond' },
        { id: 'CIS-17.7', code: '17.7', title: 'Conduct Routine Incident Response Exercises', description: 'Conduct routine incident response exercises.', igTier: 2, assetType: 'N/A', securityFunction: 'Recover' },
      ] }],
    },
    {
      id: 'CIS-18', code: '18', name: 'Penetration Testing',
      categories: [{ id: 'CIS-18-CAT', code: '18', name: 'Safeguards', items: [
        { id: 'CIS-18.1', code: '18.1', title: 'Establish and Maintain a Penetration Testing Programme', description: 'Establish a penetration testing programme appropriate to the enterprise.', igTier: 2, assetType: 'N/A', securityFunction: 'Identify' },
        { id: 'CIS-18.2', code: '18.2', title: 'Perform Periodic External Penetration Tests', description: 'Perform periodic external penetration tests.', igTier: 2, assetType: 'Network', securityFunction: 'Identify' },
        { id: 'CIS-18.3', code: '18.3', title: 'Remediate Penetration Test Findings', description: 'Remediate penetration test findings based on severity.', igTier: 2, assetType: 'N/A', securityFunction: 'Protect' },
        { id: 'CIS-18.4', code: '18.4', title: 'Validate Security Measures', description: 'Validate security measures by retesting after remediation.', igTier: 3, assetType: 'Network', securityFunction: 'Protect' },
        { id: 'CIS-18.5', code: '18.5', title: 'Perform Periodic Internal Penetration Tests', description: 'Perform periodic internal penetration tests.', igTier: 3, assetType: 'Network', securityFunction: 'Identify' },
      ] }],
    },
  ],
};
