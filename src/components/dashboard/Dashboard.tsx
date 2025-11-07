"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  activityLog,
  endpointHealth,
  integrations,
  supportTickets as supportTicketsSeed,
  vulnerabilities,
  workflowRuns,
  type SupportLevel,
  type SupportTicket,
  type TicketStatus,
  type VulnerabilityRecord,
} from "@/data/dashboard";
import clsx from "clsx";

type SeverityFilter = VulnerabilityRecord["severity"];

const severityPalette: Record<SeverityFilter, string> = {
  Critical: "bg-rose-100 text-rose-700 border border-rose-200",
  High: "bg-amber-100 text-amber-700 border border-amber-200",
  Medium: "bg-sky-100 text-sky-700 border border-sky-200",
  Low: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const ticketLevelFilters: (SupportLevel | "All")[] = [
  "All",
  "Level 1",
  "Level 2",
];

const severityOrder: SeverityFilter[] = ["Critical", "High", "Medium", "Low"];

const statusChipStyles: Record<TicketStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  "In Progress": "bg-sky-100 text-sky-700",
  "Waiting on User": "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Escalated: "bg-rose-100 text-rose-700",
};

export function Dashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>(supportTicketsSeed);
  const [levelFilter, setLevelFilter] = useState<(SupportLevel | "All")>("All");
  const [severityFilters, setSeverityFilters] = useState<SeverityFilter[]>([
    "Critical",
    "High",
    "Medium",
    "Low",
  ]);
  const [platformFilter, setPlatformFilter] = useState<
    "All" | "Windows" | "macOS" | "Network"
  >("All");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesLevel =
        levelFilter === "All" ? true : ticket.level === levelFilter;
      const matchesPlatform =
        platformFilter === "All"
          ? true
          : ticket.platform.toLowerCase().includes(platformFilter.toLowerCase());
      return matchesLevel && matchesPlatform;
    });
  }, [tickets, levelFilter, platformFilter]);

  const [activeVulnerability, setActiveVulnerability] =
    useState<VulnerabilityRecord | null>(vulnerabilities[0]);

  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilities
      .filter((item) => severityFilters.includes(item.severity))
      .sort(
        (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
      );
  }, [severityFilters]);

  const openCriticalTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.priority === "Critical" && ticket.status !== "Resolved",
      ).length,
    [tickets],
  );

  const ticketsBreachingSla = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status !== "Resolved" &&
          ticket.elapsedMinutes >= ticket.slaMinutes * 0.8,
      ).length,
    [tickets],
  );

  const vulnerableAssets = useMemo(
    () =>
      filteredVulnerabilities.reduce(
        (acc, vuln) =>
          vuln.status === "Patched" ? acc : acc + vuln.impactedAssets,
        0,
      ),
    [filteredVulnerabilities],
  );

  const deviceRisk = useMemo(() => {
    const highRisk = endpointHealth.filter(
      (item) => item.healthScore < 70 || item.compliance < 75,
    ).length;
    const total = endpointHealth.length || 1;
    return {
      highRisk,
      percentage: Math.round((highRisk / total) * 100),
    };
  }, []);

  const toggleSeverity = (severity: SeverityFilter) => {
    setSeverityFilters((current) =>
      current.includes(severity)
        ? current.filter((item) => item !== severity)
        : [...current, severity],
    );
  };

  const escalateTicket = (id: string) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              level: "Level 2",
              status: "Escalated",
              assignedTo: "Escalation Queue",
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    );
  };

  const resolveTicket = (id: string) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              status: "Resolved",
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    );
  };

  const enrichTicket = (id: string) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              automationPlaybook: ticket.automationPlaybook
                ? ticket.automationPlaybook
                : "AI enrichment: baseline diagnostics collected",
            }
          : ticket,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.4em] text-slate-400">
              AI-Powered IT Operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white lg:text-4xl">
              Vulnerability Management & Support Command Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Unified view across Level 1 & 2 support, vulnerability posture, and
              ServiceNow, Jira, Freshservice synchronisation. Automated runbooks keep
              Windows, macOS, and network fleets compliant while resolving user issues
              inside SLA.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-80">
            <MetricPill label="Critical Tickets" value={openCriticalTickets} tone="rose" />
            <MetricPill
              label="SLA At-Risk"
              value={ticketsBreachingSla}
              tone={ticketsBreachingSla > 2 ? "amber" : "emerald"}
            />
            <MetricPill
              label="Impacted Assets"
              value={vulnerableAssets}
              tone={vulnerableAssets > 250 ? "rose" : "sky"}
            />
            <MetricPill
              label="High-Risk Devices"
              value={`${deviceRisk.highRisk} (${deviceRisk.percentage}%)`}
              tone={deviceRisk.highRisk > 1 ? "rose" : "emerald"}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[2fr,1fr] lg:items-start">
        <section className="space-y-6">
          <SupportTicketsPanel
            tickets={filteredTickets}
            levelFilter={levelFilter}
            platformFilter={platformFilter}
            onFilterLevel={setLevelFilter}
            onFilterPlatform={setPlatformFilter}
            onEscalate={escalateTicket}
            onResolve={resolveTicket}
            onEnrich={enrichTicket}
          />

          <VulnerabilityPanel
            active={activeVulnerability}
            onSelect={setActiveVulnerability}
            onToggleSeverity={toggleSeverity}
            severityFilters={severityFilters}
            vulnerabilities={filteredVulnerabilities}
          />

          <AutomationPanel />
        </section>

        <section className="space-y-6">
          <IntegrationsPanel />
          <EndpointsPanel />
          <WorkflowsPanel />
          <ActivityPanel />
        </section>
      </main>
    </div>
  );
}

interface MetricPillProps {
  label: string;
  value: number | string;
  tone: "emerald" | "sky" | "amber" | "rose";
}

function MetricPill({ label, value, tone }: MetricPillProps) {
  const toneStyles: Record<MetricPillProps["tone"], string> = {
    emerald: "bg-emerald-900/40 border border-emerald-500/30 text-emerald-200",
    sky: "bg-sky-900/40 border border-sky-500/30 text-sky-200",
    amber: "bg-amber-900/40 border border-amber-500/40 text-amber-200",
    rose: "bg-rose-900/40 border border-rose-500/30 text-rose-200",
  };

  return (
    <div className={clsx("rounded-2xl px-4 py-3", toneStyles[tone])}>
      <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

interface SupportTicketsPanelProps {
  tickets: SupportTicket[];
  levelFilter: SupportLevel | "All";
  platformFilter: "All" | "Windows" | "macOS" | "Network";
  onFilterLevel: (value: SupportLevel | "All") => void;
  onFilterPlatform: (value: "All" | "Windows" | "macOS" | "Network") => void;
  onEscalate: (id: string) => void;
  onResolve: (id: string) => void;
  onEnrich: (id: string) => void;
}

function SupportTicketsPanel({
  tickets,
  levelFilter,
  platformFilter,
  onFilterLevel,
  onFilterPlatform,
  onEscalate,
  onResolve,
  onEnrich,
}: SupportTicketsPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-slate-950/50">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Support Operations</h2>
          <p className="text-sm text-slate-400">
            Level 1 and Level 2 triage with automated diagnostics, SLA insights, and
            escalation guardrails.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {tickets.length} Active
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {ticketLevelFilters.map((level) => (
            <button
              key={level}
              onClick={() => onFilterLevel(level)}
              className={clsx(
                "rounded-full border px-4 py-1 text-xs font-medium transition",
                levelFilter === level
                  ? "border-sky-400 bg-sky-400/20 text-sky-100"
                  : "border-slate-700 text-slate-400 hover:text-slate-200",
              )}
            >
              {level}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {(["All", "Windows", "macOS", "Network"] as const).map((platform) => (
              <button
                key={platform}
                onClick={() => onFilterPlatform(platform)}
                className={clsx(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  platformFilter === platform
                    ? "border-emerald-400 bg-emerald-400/20 text-emerald-100"
                    : "border-slate-700 text-slate-400 hover:text-slate-200",
                )}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    {ticket.id} • {ticket.level}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {ticket.summary}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {ticket.requester} • {ticket.device} • {ticket.platform}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      statusChipStyles[ticket.status],
                    )}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    Updated {formatRelativeTime(ticket.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoStat label="Priority" value={ticket.priority} />
                <InfoStat
                  label="SLA Consumption"
                  value={`${Math.round((ticket.elapsedMinutes / ticket.slaMinutes) * 100)}%`}
                />
                <InfoStat label="Assigned" value={ticket.assignedTo} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {ticket.automationPlaybook && (
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-100">
                    {ticket.automationPlaybook}
                  </span>
                )}
                {ticket.escalationPath && (
                  <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-100">
                    Escalates to {ticket.escalationPath}
                  </span>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => onEnrich(ticket.id)}
                  className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
                >
                  Run AI diagnostics
                </button>
                <button
                  onClick={() => onEscalate(ticket.id)}
                  className="rounded-full border border-rose-500/70 px-4 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/10"
                >
                  Escalate
                </button>
                <button
                  onClick={() => onResolve(ticket.id)}
                  className="rounded-full border border-emerald-500/70 px-4 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/10"
                >
                  Resolve
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

interface InfoStatProps {
  label: string;
  value: string | number;
}

function InfoStat({ label, value }: InfoStatProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-left">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  );
}

interface VulnerabilityPanelProps {
  vulnerabilities: VulnerabilityRecord[];
  onToggleSeverity: (severity: SeverityFilter) => void;
  severityFilters: SeverityFilter[];
  active: VulnerabilityRecord | null;
  onSelect: (record: VulnerabilityRecord) => void;
}

function VulnerabilityPanel({
  vulnerabilities,
  onToggleSeverity,
  severityFilters,
  active,
  onSelect,
}: VulnerabilityPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-slate-950/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Vulnerability Radar</h2>
          <p className="text-sm text-slate-400">
            Exposure monitoring across Windows, macOS, cloud, and network surfaces with
            AI-driven prioritisation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {severityOrder.map((severity) => (
            <button
              key={severity}
              onClick={() => onToggleSeverity(severity)}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                severityFilters.includes(severity)
                  ? severityPalette[severity]
                  : "border border-slate-700 text-slate-400",
              )}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="flex flex-col gap-4">
          {vulnerabilities.map((vulnerability) => (
            <button
              key={vulnerability.id}
              onClick={() => onSelect(vulnerability)}
              className={clsx(
                "rounded-2xl border px-4 py-4 text-left transition",
                active?.id === vulnerability.id
                  ? "border-sky-500 bg-sky-500/10"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-600",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    {vulnerability.id} • {vulnerability.owner}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    {vulnerability.title}
                  </h3>
                </div>
                <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", severityPalette[vulnerability.severity])}>
                  {vulnerability.severity}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoStat label="CVSS" value={vulnerability.cvss.toFixed(1)} />
                <InfoStat label="Impacted assets" value={vulnerability.impactedAssets} />
                <InfoStat
                  label="Exposure"
                  value={`${Math.round(vulnerability.exposureWindowHours / 24)} days`}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                {vulnerability.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-slate-700 px-3 py-1"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
        {active && (
          <aside className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
            <h3 className="text-sm font-semibold text-white">
              Remediation Plan • {active.status}
            </h3>
            <p className="mt-2 text-sm text-slate-300">{active.recommendedAction}</p>
            <dl className="mt-4 space-y-3 text-sm text-slate-400">
              <div className="flex items-center justify-between">
                <dt>Published</dt>
                <dd>{formatDate(active.publishedAt)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Remediation ETA</dt>
                <dd>{formatDate(active.remediationEta)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Owner</dt>
                <dd>{active.owner}</dd>
              </div>
            </dl>
            <div className="mt-5 space-y-2 text-xs text-slate-400">
              <p className="font-semibold uppercase tracking-wide text-slate-500">
                Next Actions
              </p>
              <ul className="space-y-2">
                <li className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
                  Push emergency update to high criticality groups
                </li>
                <li className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
                  Validate patch success across compliance dashboards
                </li>
                <li className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
                  Notify stakeholders via ServiceNow change record
                </li>
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function AutomationPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-black/40">
        <h3 className="text-base font-semibold text-white">AI Runbooks</h3>
        <p className="mt-1 text-sm text-slate-400">
          Guided automation for multi-step troubleshooting across endpoints, SaaS, and
          infrastructure.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
            Level 1: Self-heal Office 365 profile corruption
          </li>
          <li className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
            Level 2: Collect advanced VPN diagnostics & packet captures
          </li>
          <li className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
            Vulnerability: Auto-mitigate CVEs via Intune/Jamf policies
          </li>
        </ul>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-black/40">
        <h3 className="text-base font-semibold text-white">Shift-Left Insights</h3>
        <p className="mt-1 text-sm text-slate-400">
          Ticket deflection and knowledge surfaced to end users before incidents breach
          SLAs.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="rounded-xl border border-emerald-800/40 bg-emerald-950/30 px-4 py-3">
            62% of printer tickets resolved automatically via remote firmware resets
          </li>
          <li className="rounded-xl border border-emerald-800/40 bg-emerald-950/30 px-4 py-3">
            1,284 proactive compliance alerts closed in the last 7 days
          </li>
          <li className="rounded-xl border border-emerald-800/40 bg-emerald-950/30 px-4 py-3">
            38 onboarding steps automated across HR, Identity, and SaaS requests
          </li>
        </ul>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-black/40">
        <h3 className="text-base font-semibold text-white">Action Queue</h3>
        <p className="mt-1 text-sm text-slate-400">
          Launch automations, schedule maintenance, and broadcast updates with one click.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-200">
          <button className="flex w-full items-center justify-between rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 font-semibold transition hover:border-sky-400 hover:bg-sky-500/20">
            Deploy zero-day patch set <span className="text-xs text-sky-200">15 min</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 font-semibold transition hover:border-amber-400 hover:bg-amber-500/20">
            Trigger VPN failover test{" "}
            <span className="text-xs text-amber-200">Maintenance window</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 font-semibold transition hover:border-emerald-400 hover:bg-emerald-500/20">
            Start automated onboarding kit{" "}
            <span className="text-xs text-emerald-200">Workflow</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function IntegrationsPanel() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-black/40">
      <h2 className="text-lg font-semibold text-white">Live Integrations</h2>
      <p className="mt-1 text-sm text-slate-400">
        Bi-directional sync with ITSM systems keeps tickets, changes, and assets aligned
        everywhere.
      </p>
      <ul className="mt-5 space-y-3">
        {integrations.map((integration) => (
          <li
            key={integration.name}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{integration.name}</p>
              <p className="text-xs text-slate-400">
                Last sync {integration.lastSync} • {integration.itemsSyncedLastHour} items
              </p>
              {integration.issues && (
                <p className="mt-1 text-xs text-amber-300">{integration.issues}</p>
              )}
              {integration.url && (
                <p className="mt-1 text-xs">
                  <a
                    href={integration.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-300 hover:text-sky-200"
                  >
                    Open dashboard
                  </a>
                </p>
              )}
            </div>
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold",
                integration.status === "Connected" && "bg-emerald-500/10 text-emerald-200",
                integration.status === "Degraded" && "bg-amber-500/10 text-amber-200",
                integration.status === "Disconnected" && "bg-rose-500/10 text-rose-200",
              )}
            >
              {integration.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EndpointsPanel() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-black/40">
      <h2 className="text-lg font-semibold text-white">Endpoint Health</h2>
      <p className="mt-1 text-sm text-slate-400">
        live telemetry from Intune, Jamf, and network probes to highlight devices that
        need action.
      </p>
      <ul className="mt-4 space-y-3">
        {endpointHealth.map((endpoint) => (
          <li
            key={endpoint.hostname}
            className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  {endpoint.hostname} • {endpoint.os}
                </p>
                <p className="text-xs text-slate-400">
                  {endpoint.owner} • Last seen {endpoint.lastSeen}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge tone={endpoint.healthScore < 70 ? "rose" : "emerald"}>
                  Health {endpoint.healthScore}
                </Badge>
                <Badge tone={endpoint.compliance < 75 ? "amber" : "sky"}>
                  Compliance {endpoint.compliance}%
                </Badge>
                <Badge tone="slate">{endpoint.patchStatus}</Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              {endpoint.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-700 px-3 py-1"
                >
                  {tag}
                </span>
              ))}
              <span className="rounded-full border border-slate-700 px-3 py-1">
                Alerts: {endpoint.openAlerts}
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1">
                VPN {endpoint.vpnStatus}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface BadgeProps {
  tone: "emerald" | "rose" | "amber" | "sky" | "slate";
  children: ReactNode;
}

function Badge({ tone, children }: BadgeProps) {
  const toneStyles: Record<BadgeProps["tone"], string> = {
    emerald: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30",
    rose: "bg-rose-500/10 text-rose-200 border border-rose-500/30",
    amber: "bg-amber-500/10 text-amber-200 border border-amber-500/30",
    sky: "bg-sky-500/10 text-sky-200 border border-sky-500/30",
    slate: "bg-slate-800/60 text-slate-200 border border-slate-700",
  };

  return (
    <span className={clsx("rounded-full px-3 py-1 font-semibold", toneStyles[tone])}>
      {children}
    </span>
  );
}

function WorkflowsPanel() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-black/40">
      <h2 className="text-lg font-semibold text-white">Automation Workflows</h2>
      <p className="mt-1 text-sm text-slate-400">
        Onboarding and offboarding orchestration with approvals, device tasks, and SaaS
        license management tied back into ITSM.
      </p>
      <ul className="mt-5 space-y-4">
        {workflowRuns.map((workflow) => (
          <li
            key={workflow.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  {workflow.type} • {workflow.user}
                </p>
                <p className="text-xs text-slate-400">
                  Owner {workflow.owner} • Due {formatDate(workflow.dueAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{workflow.progress}%</span>
                <div className="h-2 w-28 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${workflow.progress}%` }}
                  />
                </div>
              </div>
            </div>
            <ul className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
              {workflow.checklist.map((item) => (
                <li
                  key={item.label}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg border px-3 py-2",
                    item.done
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-800 bg-slate-950/60",
                  )}
                >
                  <span
                    className={clsx(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                      item.done
                        ? "border-emerald-400 bg-emerald-400/30 text-emerald-100"
                        : "border-slate-600 text-slate-500",
                    )}
                  >
                    {item.done ? "✓" : "•"}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityPanel() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl shadow-black/40">
      <h2 className="text-lg font-semibold text-white">Real-Time Activity</h2>
      <p className="mt-1 text-sm text-slate-400">
        Unified timeline of support actions, escalations, and security enforcement
        decisions.
      </p>
      <ul className="mt-4 space-y-3 text-sm">
        {activityLog.map((entry) => (
          <li
            key={entry.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wide text-slate-500">
                  {entry.category}
                </span>
                <span>•</span>
                <span>{entry.actor}</span>
              </div>
              <span className="text-xs text-slate-500">
                {formatRelativeTime(entry.timestamp)}
              </span>
            </div>
            <p className="mt-2 text-slate-200">{entry.message}</p>
            {entry.target && (
              <p className="mt-1 text-xs text-slate-400">Target • {entry.target}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 1000 / 60);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
