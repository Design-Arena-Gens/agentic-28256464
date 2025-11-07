export type SupportLevel = "Level 1" | "Level 2";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

export type TicketStatus =
  | "New"
  | "In Progress"
  | "Waiting on User"
  | "Resolved"
  | "Escalated";

export interface SupportTicket {
  id: string;
  summary: string;
  requester: string;
  device: string;
  platform:
    | "Windows"
    | "macOS"
    | "iOS"
    | "Android"
    | "Network"
    | "Printer"
    | "Linux";
  priority: TicketPriority;
  level: SupportLevel;
  status: TicketStatus;
  slaMinutes: number;
  elapsedMinutes: number;
  updatedAt: string;
  assignedTo: string;
  automationPlaybook?: string;
  escalationPath?: string;
}

export interface VulnerabilityRecord {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  cvss: number;
  impactedAssets: number;
  publishedAt: string;
  remediationEta: string;
  status: "Investigating" | "Mitigating" | "Patched" | "Risk Accepted";
  owner: string;
  platforms: ("Windows" | "macOS" | "Network" | "Cloud")[];
  exposureWindowHours: number;
  recommendedAction: string;
}

export interface EndpointHealth {
  hostname: string;
  owner: string;
  os: "Windows 11" | "Windows 10" | "macOS" | "iOS" | "Android" | "Network Appliance";
  compliance: number;
  healthScore: number;
  openAlerts: number;
  lastSeen: string;
  vpnStatus: "Connected" | "Disconnected";
  patchStatus: "Up to date" | "Patch pending" | "Out of date";
  tags: string[];
}

export interface IntegrationStatus {
  name: "ServiceNow" | "Jira" | "Freshservice" | "Intune" | "Jamf";
  status: "Connected" | "Degraded" | "Disconnected";
  lastSync: string;
  itemsSyncedLastHour: number;
  issues?: string;
  url?: string;
}

export interface WorkflowRun {
  id: string;
  user: string;
  type: "Onboarding" | "Offboarding" | "Access Review";
  progress: number;
  owner: string;
  dueAt: string;
  checklist: {
    label: string;
    done: boolean;
  }[];
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  message: string;
  category: "Incident" | "Vulnerability" | "Automation" | "Security";
  target?: string;
  level?: "info" | "warning" | "critical";
}

export const supportTickets: SupportTicket[] = [
  {
    id: "INC-10452",
    summary: "VPN disconnects every 10 minutes",
    requester: "Maria Sanchez",
    device: "Dell XPS 13",
    platform: "Windows",
    priority: "High",
    level: "Level 2",
    status: "In Progress",
    slaMinutes: 240,
    elapsedMinutes: 155,
    updatedAt: "2024-06-12T12:05:00Z",
    assignedTo: "AI L2 Assistant",
    automationPlaybook: "VPN stability diagnostics",
    escalationPath: "Network Engineering",
  },
  {
    id: "REQ-20981",
    summary: "New hire account provisioning",
    requester: "HR Automation",
    device: "Corporate Services",
    platform: "Windows",
    priority: "Medium",
    level: "Level 1",
    status: "Waiting on User",
    slaMinutes: 1440,
    elapsedMinutes: 90,
    updatedAt: "2024-06-12T12:22:00Z",
    assignedTo: "AI L1 Assistant",
    automationPlaybook: "Onboarding - standard bundle",
  },
  {
    id: "INC-10461",
    summary: "Printer outage on 3rd floor",
    requester: "Facilities",
    device: "Canon MF4450",
    platform: "Printer",
    priority: "High",
    level: "Level 1",
    status: "New",
    slaMinutes: 180,
    elapsedMinutes: 12,
    updatedAt: "2024-06-12T12:35:00Z",
    assignedTo: "AI L1 Assistant",
    automationPlaybook: "Printer outage triage",
  },
  {
    id: "INC-10433",
    summary: "macOS Sonoma Wi-Fi authentication",
    requester: "Greg Phillips",
    device: "MacBook Pro 14\"",
    platform: "macOS",
    priority: "Medium",
    level: "Level 2",
    status: "Escalated",
    slaMinutes: 360,
    elapsedMinutes: 320,
    updatedAt: "2024-06-12T11:42:00Z",
    assignedTo: "AI L2 Assistant",
    escalationPath: "Identity & Networking",
  },
  {
    id: "ACC-5521",
    summary: "MFA locked out after phone reset",
    requester: "Chen Wei",
    device: "iPhone 15",
    platform: "iOS",
    priority: "Critical",
    level: "Level 1",
    status: "In Progress",
    slaMinutes: 60,
    elapsedMinutes: 38,
    updatedAt: "2024-06-12T12:40:00Z",
    assignedTo: "AI L1 Assistant",
    automationPlaybook: "MFA reset & verification",
  },
];

export const vulnerabilities: VulnerabilityRecord[] = [
  {
    id: "CVE-2024-27898",
    title: "macOS WebKit remote code execution",
    severity: "Critical",
    cvss: 9.8,
    impactedAssets: 435,
    publishedAt: "2024-06-10T04:00:00Z",
    remediationEta: "2024-06-14T18:00:00Z",
    status: "Mitigating",
    owner: "Endpoint Security",
    platforms: ["macOS"],
    exposureWindowHours: 96,
    recommendedAction: "Force deploy Apple Rapid Security Response 17.5.1",
  },
  {
    id: "CVE-2024-11603",
    title: "OpenSSL DTLS buffer overflow",
    severity: "High",
    cvss: 8.7,
    impactedAssets: 82,
    publishedAt: "2024-06-07T08:00:00Z",
    remediationEta: "2024-06-13T23:00:00Z",
    status: "Investigating",
    owner: "Network Engineering",
    platforms: ["Network", "Windows"],
    exposureWindowHours: 144,
    recommendedAction: "Deploy OpenSSL 3.2.2 to VPN concentrators",
  },
  {
    id: "CVE-2024-9315",
    title: "Windows LSA privilege escalation",
    severity: "Critical",
    cvss: 9.3,
    impactedAssets: 712,
    publishedAt: "2024-06-05T13:00:00Z",
    remediationEta: "2024-06-16T13:00:00Z",
    status: "Mitigating",
    owner: "Endpoint Security",
    platforms: ["Windows"],
    exposureWindowHours: 192,
    recommendedAction: "Rollout June cumulative update KB5037592",
  },
  {
    id: "CVE-2024-8011",
    title: "Fortinet SSL VPN pre-auth bug",
    severity: "High",
    cvss: 8.6,
    impactedAssets: 16,
    publishedAt: "2024-06-02T09:00:00Z",
    remediationEta: "2024-06-12T21:00:00Z",
    status: "Patched",
    owner: "Network Security",
    platforms: ["Network"],
    exposureWindowHours: 240,
    recommendedAction: "Confirm patch deployment on all edge appliances",
  },
];

export const endpointHealth: EndpointHealth[] = [
  {
    hostname: "LON-LPT-0021",
    owner: "Alex Morgan",
    os: "Windows 11",
    compliance: 96,
    healthScore: 88,
    openAlerts: 1,
    lastSeen: "4 minutes ago",
    vpnStatus: "Connected",
    patchStatus: "Up to date",
    tags: ["Finance", "Tier-1"],
  },
  {
    hostname: "NYC-MAC-0145",
    owner: "Priya Patel",
    os: "macOS",
    compliance: 82,
    healthScore: 72,
    openAlerts: 3,
    lastSeen: "Just now",
    vpnStatus: "Connected",
    patchStatus: "Patch pending",
    tags: ["Design", "VIP"],
  },
  {
    hostname: "SFO-SRV-008",
    owner: "Data Center",
    os: "Windows 10",
    compliance: 65,
    healthScore: 54,
    openAlerts: 6,
    lastSeen: "12 minutes ago",
    vpnStatus: "Disconnected",
    patchStatus: "Out of date",
    tags: ["Server", "Restricted"],
  },
  {
    hostname: "AMS-NET-EDGE1",
    owner: "Network Core",
    os: "Network Appliance",
    compliance: 91,
    healthScore: 94,
    openAlerts: 0,
    lastSeen: "2 minutes ago",
    vpnStatus: "Connected",
    patchStatus: "Up to date",
    tags: ["SD-WAN", "Edge"],
  },
];

export const integrations: IntegrationStatus[] = [
  {
    name: "ServiceNow",
    status: "Connected",
    lastSync: "2 minutes ago",
    itemsSyncedLastHour: 34,
    url: "https://servicenow.example.com/nav_to.do?uri=%2Fincident_list.do",
  },
  {
    name: "Jira",
    status: "Degraded",
    lastSync: "14 minutes ago",
    itemsSyncedLastHour: 8,
    issues: "Webhook retries exceeded threshold",
    url: "https://jira.example.com/projects/ITSM/board",
  },
  {
    name: "Freshservice",
    status: "Connected",
    lastSync: "5 minutes ago",
    itemsSyncedLastHour: 21,
    url: "https://acme.freshservice.com/helpdesk/tickets",
  },
  {
    name: "Intune",
    status: "Connected",
    lastSync: "6 minutes ago",
    itemsSyncedLastHour: 59,
  },
  {
    name: "Jamf",
    status: "Connected",
    lastSync: "4 minutes ago",
    itemsSyncedLastHour: 47,
  },
];

export const workflowRuns: WorkflowRun[] = [
  {
    id: "WF-7781",
    user: "Jamie Lee",
    type: "Onboarding",
    progress: 72,
    owner: "People Ops",
    dueAt: "2024-06-12T18:00:00Z",
    checklist: [
      { label: "Azure AD account created", done: true },
      { label: "Laptop imaged & shipped", done: true },
      { label: "VPN access provisioned", done: false },
      { label: "Orientation session scheduled", done: false },
    ],
  },
  {
    id: "WF-7652",
    user: "Elena Russo",
    type: "Offboarding",
    progress: 48,
    owner: "Security Operations",
    dueAt: "2024-06-12T15:00:00Z",
    checklist: [
      { label: "Disable SSO accounts", done: true },
      { label: "Revoke VPN & MFA tokens", done: false },
      { label: "Collect corporate assets", done: false },
      { label: "Archive mailbox", done: true },
    ],
  },
  {
    id: "WF-7601",
    user: "Quarterly Admin Review",
    type: "Access Review",
    progress: 38,
    owner: "Compliance",
    dueAt: "2024-06-18T11:00:00Z",
    checklist: [
      { label: "Privileged users validated", done: false },
      { label: "Service accounts rotation", done: true },
      { label: "Vendor access pruned", done: false },
    ],
  },
];

export const activityLog: ActivityLogEntry[] = [
  {
    id: "ACT-9001",
    timestamp: "2024-06-12T12:44:00Z",
    actor: "AI Support L2",
    category: "Incident",
    message: "Auto-routed VPN incident INC-10452 to Network Engineering with diagnostic bundle attached.",
    target: "INC-10452",
    level: "info",
  },
  {
    id: "ACT-8999",
    timestamp: "2024-06-12T12:38:00Z",
    actor: "AI SecOps",
    category: "Vulnerability",
    message: "Marked KB5037592 deployment at 52% completion; 71 high-risk devices quarantined pending reboot.",
    target: "CVE-2024-9315",
    level: "warning",
  },
  {
    id: "ACT-8994",
    timestamp: "2024-06-12T12:20:00Z",
    actor: "Workflow Engine",
    category: "Automation",
    message: "Onboarding workflow WF-7781 paused waiting for VPN group approval from Identity team.",
    target: "WF-7781",
    level: "warning",
  },
  {
    id: "ACT-8989",
    timestamp: "2024-06-12T11:58:00Z",
    actor: "AI Support L1",
    category: "Incident",
    message: "Resolved 12 password reset tickets automatically via delegated MFA reset policy.",
    level: "info",
  },
  {
    id: "ACT-8983",
    timestamp: "2024-06-12T11:46:00Z",
    actor: "AI SecOps",
    category: "Security",
    message: "Detected anomalous sign-in from subnet 192.168.44.0/24 for account service-splunk, temporarily disabled credentials.",
    level: "critical",
  },
];
