import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Code, Mail, Globe, ExternalLink, Building2 } from 'lucide-react';
import { NodeRedFlow } from '@/components/NodeRedFlow';

export const metadata = {
  title: 'About this project | SEDC Transformer Monitor',
  description:
    'How a 2023 3-phase transformer monitoring system, originally built at GTS Hi-Tech for the Sudanese Electrical Distribution Company (SEDC), was rebuilt in 2026 with Next.js, React, and Tailwind — preserving the original 24-field telemetry shape and customer-approved dashboard design.',
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto space-y-10 py-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-canar-blue"
      >
        <ChevronLeft className="size-4" />
        Back to dashboard
      </Link>

      {/* Hero */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canar-blue/10 text-canar-blue text-xs font-medium">
          About this project
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          A 3-phase transformer monitor for Sudan&apos;s electrical grid, rebuilt in 2026.
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          You&apos;re looking at a faithful rebuild of the second industrial IoT
          system I deployed in Khartoum — same 24-field telemetry payload, same
          per-phase voltage / current / power / frequency monitoring, same
          customer-approved dashboard design.
        </p>
      </header>

      {/* Story */}
      <Section title="The story">
        <p>
          Following the success of the{' '}
          <a
            href="https://fuel-tanker-monitor.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-canar-blue hover:underline"
          >
            Canar fuel tanker monitor
          </a>{' '}
          at GTS Hi-Tech, the next major IoT project we delivered was for the{' '}
          <strong>Sudanese Electrical Distribution Company (SEDC)</strong> — the
          national utility responsible for the low-voltage distribution network
          across Khartoum and beyond.
        </p>
        <p>
          The brief was straightforward but technically demanding: monitor
          high-load 1000–1500 kVA distribution transformers across the city in
          real time. Operators needed to see per-phase voltages (line-to-neutral
          and line-to-line), per-phase currents, active / reactive / apparent
          power, power factor, frequency, voltage angles, and accumulated
          energy — for every single device. Plus alarms on overvoltage,
          overcurrent, and phase imbalance.
        </p>
        <p>
          We picked the same stack that worked for Canar — energy-meter devices
          publishing over MQTT to a Node-RED backend on our VPS, with a
          ThingsBoard CE dashboard for the operators. The original deployment
          covered three substations in greater Khartoum:{' '}
          <strong>Jabra (Alsajdeen)</strong>, <strong>Ombada (Ahmed Altayeb)</strong>,
          and <strong>Shambat Square 11 (Mohammed Awad Hamza)</strong>. The
          system ran in production and was used by SEDC operators to spot
          overload conditions before they tripped breakers.
        </p>
        <p>
          Then in April 2023, the war hit. Same outcome as Canar — the VPS, the
          ThingsBoard server, and direct access to the substations were lost.
          The Node-RED flow exports and a 627 KB ThingsBoard dashboard backup
          (43 widgets across an overview + drill-down) survived on a personal
          drive. This dashboard is rebuilt from those backups, three years
          later, from Saudi Arabia.
        </p>
      </Section>

      {/* What you're looking at */}
      <Section title="What you're looking at">
        <p>
          A live monitoring dashboard for <strong>3 virtual distribution
          transformers</strong> at the exact same three Sudan sites that ran in
          the 2023 production deployment:
        </p>
        <ul className="list-disc list-inside space-y-1 text-zinc-700">
          <li><strong>SEDC-001</strong> — Jabra Alsajdeen (Khartoum) · 1000 kVA · I_limit 700 A</li>
          <li><strong>SEDC-002</strong> — Ombada Alhara 1, Ahmed Altayeb (Omdurman) · 1000 kVA · I_limit 1100 A</li>
          <li><strong>SEDC-003</strong> — Shambat Square 11, Mohammed Awad Hamza (Khartoum North) · 1500 kVA · I_limit 1000 A</li>
        </ul>
        <p>
          Each transformer emits a fresh telemetry packet every few seconds.
          The simulator generates realistic per-phase fluctuation, occasional
          load spikes that trigger overcurrent alarms, and frequency drift
          around the nominal 50 Hz — everything the operator would see on a
          live grid.
        </p>
      </Section>

      {/* Two modes */}
      <Section title="Two modes of operation">
        <Callout color="blue" title="Default — browser simulator">
          The dashboard ships with a TypeScript port of the Node-RED simulator
          that emits new 3-phase readings every 3 seconds. The deployed Netlify
          version uses this so visitors always see live-looking data without
          any backend.
        </Callout>
        <Callout color="green" title="With Node-RED — real pipeline">
          Run Node-RED locally, import{' '}
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">
            dummy-generator-sedc.json
          </code>
          , and this dashboard automatically connects to its WebSocket at{' '}
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">
            ws://localhost:1880/ws/transformers
          </code>
          . The badge in the top right flips from &quot;Browser simulator&quot;
          to &quot;Node-RED WS&quot; and you&apos;re seeing data flow through
          the actual rebuilt backend pipeline.
        </Callout>
      </Section>

      {/* How it works */}
      <Section title="How it works">
        <p>
          Below is a mockup of the SEDC Node-RED simulator flow — same
          structure as what you&apos;d see if you imported{' '}
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">
            dummy-generator-sedc.json
          </code>{' '}
          into your own Node-RED instance:
        </p>

        <NodeRedFlow />

        <p className="pt-2">
          Each meter publishes a <strong>3-element JSON array</strong>:
          element [0] holds the system power factor and frequency, element [1]
          holds a 24-number array of all the raw phase readings, and element
          [2] holds the accumulated energy counter.
        </p>

        <p>The 24-field payload structure (faithful to the real meters):</p>
        <pre className="bg-zinc-900 text-zinc-100 text-xs sm:text-sm rounded-lg p-4 overflow-x-auto leading-relaxed">
{`DATA[0..2]   = V_A,  V_B,  V_C    (phase-to-neutral, volts)
DATA[3..5]   = V_AB, V_BC, V_AC   (phase-to-phase, volts)
DATA[6..8]   = I_A,  I_B,  I_C    (currents, amps)
DATA[9..11]  = P_A,  P_B,  P_C    (active power, W)
DATA[12..14] = Q_A,  Q_B,  Q_C    (reactive power, VAR)
DATA[15..17] = S_A,  S_B,  S_C    (apparent power, VA)
DATA[18..20] = PF_A, PF_B, PF_C   (power factor)
DATA[21..23] = VAngle_AB, VAngle_BC, VAngle_AC   (degrees)`}
        </pre>

        <p>
          Per-device thresholds (
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">I_limit</code>{' '}
          for over-current,{' '}
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">V2_limit</code>{' '}
          for over-voltage line-to-line) come from the device attributes set in
          ThingsBoard. The decoder routes each reading by IMEI and pushes both
          telemetry (the 24 readings) and attributes (averages + alarm flags)
          to the dashboard.
        </p>
      </Section>

      {/* Original system */}
      <Section title="The original system, for reference">
        <p>
          The 2023 production deployment had:
        </p>
        <ul className="list-disc list-inside space-y-1 text-zinc-700">
          <li>3 distribution transformers (Jabra, Ombada, Shambat) totaling 3.5 MVA monitored</li>
          <li>Energy-meter devices publishing JSON over MQTT (topic <code className="text-xs">gts_energy</code>) on broker 143.244.147.158:1883</li>
          <li>Node-RED on a VPS, decoding the 24-element DATA array, computing averages and checking alarms</li>
          <li>ThingsBoard CE for the SEDC operator dashboard (43-widget detail page per device)</li>
          <li>MySQL <code className="text-xs">iot_energy.payload</code> table with 30 columns of historical readings</li>
          <li>Email + SMS alerts to GTS engineers when overvoltage or overcurrent triggered</li>
        </ul>
        <p>
          This rebuild keeps the exact same color palette and per-phase widget
          layout — line-to-neutral voltages, line-to-line voltages, phase
          currents, per-phase power factors, voltage angles, plus aggregate
          KPIs (active power, apparent power, reactive power, frequency,
          accumulated energy).
        </p>
      </Section>

      {/* Tech stack */}
      <Section title="Tech stack">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
          <StackCard title="Backend" items={['Node-RED (flow-based)', 'MQTT subscribe (topic gts_energy)', 'WebSocket egress (replacing the lost ThingsBoard MQTT)']} />
          <StackCard title="Frontend" items={['Next.js 16 (App Router, static export)', 'React 19', 'Tailwind CSS 4', 'Leaflet + react-leaflet', 'Recharts (per-phase line charts)', 'Lucide React (icons)']} />
          <StackCard title="Hosting" items={['Netlify (static)', 'No server runtime required']} />
          <StackCard title="Original sensors" items={['3-phase energy meters', 'MQTT publish over GSM/3G', '24-field JSON telemetry', 'IMEI-based device identity']} />
        </div>
      </Section>

      {/* Why a faithful rebuild */}
      <Section title="Why a faithful rebuild">
        <p>
          Power monitoring is unforgiving — there&apos;s no faking 3-phase
          electrical data. Every value has to relate sensibly to every other:
          V_AB ≈ V_A × √3, S² ≈ P² + Q², voltage angles ≈ 120° apart, etc. The
          simulator respects these relationships, the alarm logic uses the same
          per-device I_limit and V2_limit thresholds the real meters were
          configured with, and the dashboard shows the same per-phase
          breakdowns SEDC operators trusted in 2023.
        </p>
        <p>
          If a real meter came online tomorrow, the Node-RED decoder is
          identical to the one that ran in production — same 24-element array
          unpacking, same averaging logic, same threshold checks.
        </p>
      </Section>

      {/* Built at GTS Hi-Tech */}
      <Section title="Built at GTS Hi-Tech">
        <div className="bg-white border border-zinc-200 rounded-lg p-5 not-prose">
          <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
            <a
              href="https://gts-hitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 block bg-zinc-50 border border-zinc-200 rounded-md p-3 hover:border-canar-blue/40 transition-colors"
            >
              <Image
                src="/gts-logo.png"
                alt="GTS Hi-Tech"
                width={72}
                height={70}
                className="block"
              />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-zinc-900 text-lg">GTS Hi-Tech</h3>
                <span className="text-xs text-zinc-500">(formerly Gezira Telecom Solutions)</span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed mt-1.5">
                ICT solutions provider operating across <strong>Sudan</strong>,{' '}
                <strong>UAE</strong>, and <strong>South Sudan</strong>. GTS
                specializes in networking, IoT, cybersecurity, CCTV, cloud
                infrastructure, and solar power for enterprise clients across
                East Africa and the Gulf.
              </p>
              <p className="text-sm text-zinc-700 leading-relaxed mt-2">
                I was on the GTS team as <strong>System Administrator and IoT /
                Software Developer</strong>, and I designed, built, and
                maintained the SEDC transformer monitoring system end-to-end —
                meter integration, MQTT pipeline, Node-RED decoder, ThingsBoard
                dashboard, and the on-site deployment in Khartoum. I continue to
                collaborate with GTS on projects on a freelance basis.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href="https://gts-hitech.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-canar-blue hover:underline"
                >
                  <Globe className="size-3.5" />
                  gts-hitech.com
                </a>
                <span className="text-xs text-zinc-400">·</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                  <Building2 className="size-3.5" />
                  Dubai · Khartoum · Juba
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* About me */}
      <Section title="About me">
        <p>
          I&apos;m <strong>Babakr Hussain Babakr Saad</strong>. I built the
          original SEDC system as the{' '}
          <strong>System Administrator and IoT / Software Developer</strong> at{' '}
          <a
            href="https://gts-hitech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-canar-blue hover:underline"
          >
            GTS Hi-Tech
          </a>
          {' '}in Sudan, and I still collaborate with them on projects today. I
          now also work in Saudi Arabia as an IT &amp; Tendering Coordinator at
          Naif Obaid Al-Shammari Contracting Establishment, while continuing to
          develop software on the side.
        </p>
        <div className="flex flex-wrap gap-3 pt-2 not-prose">
          <ContactLink href="mailto:beko1986@gmail.com" icon={<Mail className="size-4" />} label="beko1986@gmail.com" />
          <ContactLink href="https://beko-cloud.work" icon={<Globe className="size-4" />} label="beko-cloud.work" />
          <ContactLink href="https://github.com/bekoblast/sedc-transformer-monitor" icon={<Code className="size-4" />} label="Source on GitHub" />
        </div>
      </Section>

      {/* See also */}
      <Section title="See also">
        <p>
          For the first project in this series — the Canar fuel tanker
          monitor — see{' '}
          <a
            href="https://fuel-tanker-monitor.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-canar-blue hover:underline font-medium"
          >
            fuel-tanker-monitor.netlify.app
          </a>
          . Same stack, different domain (binary protocol over TCP instead of
          JSON over MQTT, fuel tanks instead of transformers).
        </p>
      </Section>

      {/* CTA */}
      <div className="border-t border-zinc-200 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-canar-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-canar-blue/90 transition-colors"
        >
          Back to the live dashboard
          <ExternalLink className="size-4" />
        </Link>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      <div className="text-zinc-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Callout({ color, title, children }: { color: 'blue' | 'green'; title: string; children: React.ReactNode }) {
  const bg = color === 'blue' ? 'bg-canar-blue/5 border-canar-blue/30' : 'bg-canar-green/5 border-canar-green/30';
  const dot = color === 'blue' ? 'bg-canar-blue' : 'bg-canar-green';
  const txt = color === 'blue' ? 'text-canar-blue' : 'text-canar-green';
  return (
    <div className={`border ${bg} rounded-lg p-4`}>
      <div className={`flex items-center gap-2 font-semibold ${txt} mb-2`}>
        <span className={`size-2 rounded-full ${dot} live-dot`} />
        {title}
      </div>
      <div className="text-zinc-700 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function StackCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
            <span className="text-canar-blue mt-1.5 size-1 rounded-full bg-canar-blue inline-block shrink-0" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-zinc-700 hover:text-canar-blue border border-zinc-200 hover:border-canar-blue/40 rounded-md px-3 py-1.5 bg-white transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}
