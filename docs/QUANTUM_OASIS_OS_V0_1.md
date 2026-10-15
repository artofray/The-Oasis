# Quantum Oasis OS v0.1: Founding Architecture and Oasis Bridge

**Working design, 15 October 2026.** This is a build specification, not a claim that any OS, adapter or agent is already operating.
**First host:** Ray's working Windows laptop.
**Short-term non-negotiable:** Maintain a native Windows option for Resolume and the live performances. Do not touch the separate ADATA SSD during experimental OS installations.

## Founding promise

**Different people. Different devices. One shared language, without giving up ownership.**

Quantum Oasis is a user-owned, open-standard computing environment that unites files, creative applications, connected devices, knowledge and specialized AI assistance. It should hide unnecessary complexity while exposing trustworthy status, simple permissions, and clear recovery routes.

A person can say, "Send yesterday's video to my desktop and stage it for tonight." The system identifies the file and device, asks permission where needed, selects an available interoperable route, verifies completion, and reports a truthful result. If the capability is unsupported, it describes a working alternative. It never fabricates that a transfer, device action or show cue succeeded.

## Existing foundations: verified repository inspection

- **The-Oasis**: React + TypeScript + Vite frontend with Maggie chat, dashboard, Round Table, voice and creative views, plus a Gemini SDK integration.
- **The_Symphony-**: separate React dashboard and OpenClaw-style agent dispatch policies, skill definitions and runtime configuration examples.
- **Oasis-Agent-Studio**: related prototype.
- The-Oasis **WorkflowsView** and **DataStreamsView** currently display placeholders, not functioning orchestrators.
- Dashboard system health includes hard-coded sample statistics.
- `services/persistenceService.ts` calls a browser-localStorage sharding system "decentralized"; it does not actually distribute data across devices and may prune history/images.
- `vite.config.ts` currently injects a Gemini API key into frontend code. Replace this with backend-only credentials before production deployment.

## Major components

### Oasis Shell

The user-facing app: Home, Projects, Files, Devices, Stage Manager, Requests, Review Queue, Agents, Activity and Settings. First run as a web UI from the working laptop, then optionally a desktop wrapper, PWA and native companion agents.

### Maggie: Conductor

Translates goals to proposals, identifies available permissions and agents, dispatches approved work, displays outcomes. Agent instructions are versioned and tied to explicitly stated user goals. Respect the owner's preferences, data and final decisions. Agents do not gain independent unlimited administrator privileges or invent completion reports.

### Infinite Brain

A structured folder of project notes, policy, context and indexed references backed by local durable storage (SQLite + FTS for MVP). Separate global/project/regional/private/session context. Keep raw media, huge datasets and secrets out of the text index. Source-linked memory with timestamps, privacy labels and correction history. Export and restore can work without a specific model company.

### Symphony agent runtime

Task lifecycle: **requested -> proposed -> approved -> running -> tested -> done/failed/cancelled**.
Each agent declares capabilities, input/output schemas, accessible resources, model/runtime, external effects, costs and human approval gates. Core roles: Conductor, Translator, Archivist, Builder, Stagehand, Security Steward and Stage Manager. Every actual tool invocation is logged and testable; side effects are scoped and reversible when possible.

### Secrets and security

Use host secret store/backend broker. Never embed tokens in frontend bundles, public Git repositories, URLs or prompt transcripts. Distinguish human owner consent from untrusted commands in documents or webpages. Auto-approval is only for narrow, user-configured low-risk routines. Ask before sharing, paying, sending messages, deleting, installing code or changing access controls.

## Oasis Bridge: cross-device interoperability

**Founding requirement:** Oasis should communicate across operating systems and device categories through open protocols and small adapters, not through dependence on one proprietary ecosystem.

### User experience

- A single **Devices** panel shows nearby or connected hosts, their names, capabilities, owner permissions and online/offline state.
- Pair an authorized device using a QR code or short one-time code. Permission is explicit and revocable.
- Interact using ordinary language, buttons or accessible voice:
  - "Move this video from my phone to my laptop."
  - "Show tonight's set list on the tablet."
  - "Tell me whether the desktop projector is connected."
  - "Start the rehearsal timeline" (only after controls are tested).
- Build in clear success/failure feedback. A device's last-seen status does not mean it is currently available.
- Local transfers should work with no internet when both devices share a reachable network. A remote relay is optional, not mandatory.

### Device classes and adapters

| Device or service | First-choice interface | Notes |
| --- | --- | --- |
| Windows, Linux, macOS | Small Oasis Companion agent; HTTPS/WebSocket | Read-only device info first, then approved file transfers and app-specific actions |
| Android | Browser/PWA initially, optional native companion | Native permissions required for background files, discovery and some hardware |
| iOS/iPadOS | Browser/PWA, optional signed native app | Platform permissions restrict background and system control |
| Any modern browser | Web dashboard over authenticated HTTPS | Browser sandbox limits filesystem and OS automation |
| Smart TVs and media players | Supported Cast/DLNA/AirPlay-compatible adapters | No assumption of universal screen casting |
| Projectors, audio, stage consoles | Official OSC/MIDI/HTTP/API adapters | App/device/version-specific; show-time controls need offline manual fallback |
| IoT/sensors | MQTT and where applicable Matter | Discovery and actual supported functions vary by manufacturer |
| Legacy or proprietary Windows apps | Native Windows, VM or individually tested Wine adapter | No promise of translating arbitrary binaries into working Linux apps |

### Bridge architecture

```
Natural-language request / UI action
                |
         Maggie / Conductor
                |
       Capability Registry + Policy
                |
    Authenticated Oasis Bridge API
       /            |            \
 Local Companion   Adapter      Optional Relay
 (PC / phone)      (OSC/etc.)   (remote access)
       \            |            /
      Signed results and activity log
```

**Internal protocol:** versioned JSON action schema, capability advertisement, device identity, request ID, expiry, approval policy, progress reports and typed results. Use HTTPS for setup/control and WebSocket where live events matter. Large files transfer separately with resumable chunks and verified checksums. Interfaces must be documented so third parties can implement compatible companions.

**Discovery:** opt-in mDNS on the local network where permitted, plus manual pairing via address/QR and a relay path if later enabled. No scanning arbitrary networks or controlling unknown devices.

**Trust:** mutual device authentication or equivalent pairing-bound credentials, encrypted channels, device-scoped permissions, expiring sessions, clear revocation and a visible activity log. A phone may view cue sheets while a stage computer can accept only a narrow approved "prepare scene" instruction. Never grant arbitrary shell execution merely because two devices have paired.

**Translation:** an AI can choose among documented adapters and help create new ones in a sandbox. It cannot magically bypass unsupported hardware interfaces or operating-system security restrictions. Compatibility is an accumulating registry of *tested capabilities*, not guesses.

**Remote access:** later phase. Do not expose an unauthenticated bridge to the internet. If a relay is added, prefer end-to-end authenticated connections and minimize central metadata.

**Reliability:** background job queue, retries with idempotency, connection state, checksums, cancellation, user-visible error messages, file overwrite policies and manual fallback.

### First functional interoperability test

**MVP 1: Browser dashboard + Windows Companion on Ray's laptop**
- List the local host (real OS/version/hostname/capabilities).
- Show actual "online" and heartbeat status, not placeholders.
- On explicit approval, send a test text file or image between two devices on the same LAN.
- Verify received checksum and destination. Never silently overwrite existing files.
- Provide revoke/disconnect and a human-readable log.
- Do not require a cloud account for local LAN pairing.

**MVP 2: Android browser companion** showing projects, file transfer, stage cue list, and device state.
**MVP 3: Windows Stage Manager adapter** to actual Resolume controls after confirming product/version/protocol and running a dry rehearsal.
**MVP 4: Linux Companion** once the desktop hardware works from a non-destructive live environment.

**Acceptance criterion:** two different operating systems complete a user-approved task across the LAN, with traceable success and the same interface semantics. When the internet is disconnected, the local transfer and cached cue sheet still work.

## Delivery plan

### Phase 0: Time-critical stage work
- Preserve existing Windows functionality needed for the performance.
- Verify show date, event names, set list, media files and backup playback path before introducing any automatic cue triggers.
- Manual GO/STOP first. Do not let an autonomous agent update running stage software mid-show.

### Phase 1: Repair and run existing Oasis UI on laptop
- Reproduce build, protect secrets, remove hard-coded "online" status.
- Run a local authenticated backend; preserve export/restore of current Oasis state.
- Basic Projects, Devices and Activity screens.

### Phase 2: Brain and first useful agent
- Implement local SQLite index, project context, source links and tested restore.
- Conductor proposes work; Stagehand verifies one completed artifact; Ray approves external effects.

### Phase 3: Oasis Bridge LAN MVP
- Pair Windows laptop with Android/browser companion or second computer.
- Authenticated status, permissioned file transfer, progress, checksum and audit trail.
- Keep adapters isolated so one failed provider/device does not break the core.

### Phase 4: Expanded adapters and live event features
- Test OSC/MIDI/HTTP with stage hardware and Resolume on Windows.
- Add macOS, Linux and IoT support incrementally, with a published capability matrix.

### Phase 5: Quantum-resistant security research
- Implement current well-reviewed TLS and storage encryption first.
- Explore established NIST post-quantum standards using maintained libraries, initially in an experimental environment.
- Investigate patentable *novel system techniques* such as context-scoped agent authorization and portable cryptographic device identity, separately from established algorithms.
- Keep unfiled invention disclosures private; describe inventions as patent-pending only after a relevant application is filed.

## Non-negotiable release checklist

1. Owner controls device discovery, pairing, permissions, export and revocation.
2. No misleading "all systems supported" promise; every adapter reports tested features and known limits.
3. Local-first core and a usable offline mode.
4. No plaintext credentials or silent cross-device sharing.
5. One action, one understandable approval, one verifiable result.
6. A friendly interface that doesn't require users to understand paths, ports, driver jargon or terminal commands.
7. Performance reliability and manual operator control outrank experimental autonomous capabilities.
8. The product supports collaboration across different people and devices without requiring a single model vendor, cloud provider or hardware brand.

## Inspiration

A user-supplied AI operating system transcript describes an indexed "brain," workflow runtime, approval queues, separate secrets broker and data store. These are design influences rather than claims about the third party's availability, pricing or code license. The chosen tools require independent security and licensing review.
