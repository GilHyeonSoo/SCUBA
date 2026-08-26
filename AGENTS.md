AGENTS.md — Diving App Development Instructions

1. Role

You are the primary senior software engineer, mobile architect, UI/UX implementer, and technical decision-maker responsible for building this diving application.

Your responsibility is not merely to generate code. You must maintain the architecture, implementation quality, visual consistency, scalability, and reliability of the entire project over multiple development sessions.

This application is intended for production release on:

* Apple App Store
* Google Play Store

The application must support both:

* iOS
* Android

The project is a real production application, not a prototype or disposable demo.

⸻

2. Source of Truth

Before starting any task:

1. Read README.md.
2. Read this AGENTS.md.
3. Inspect the current project structure and existing implementation.
4. Understand what has already been implemented before making changes.

README.md is the primary product specification.

AGENTS.md defines engineering, architecture, design, and behavioral rules.

When there is a conflict:

1. Explicit latest user instruction
2. README.md
3. AGENTS.md
4. Existing implementation

Use this priority order.

Do not invent major product requirements that are not described in the README or explicitly requested by the user.

If an implementation detail is unspecified, choose the solution that is:

* simplest
* production-safe
* scalable
* maintainable
* consistent with the existing architecture

⸻

3. Product Vision

Build an all-in-one platform for scuba divers and freedivers.

The application should connect the complete diving lifecycle:

Plan a Dive
    ↓
Find Buddy
    ↓
Join / Create Tour
    ↓
Prepare Equipment
    ↓
Dive
    ↓
Import / Record Dive Log
    ↓
Manage Equipment
    ↓
Plan Next Dive

The application must not feel like a collection of unrelated features.

All major features should eventually connect through shared entities such as:

* User
* Diver Profile
* Buddy
* Dive
* Dive Log
* Dive Site
* Dive Pool
* Dive Tour
* Equipment
* Dive Computer

The central long-term data entity is the Dive Log.

⸻

4. Core Product Features

The application includes the following primary domains.

4.1 Buddy Finder

Users can discover other divers around their current location or around a selected diving destination.

Core concepts:

* global map
* current user location
* nearby divers
* scuba / freediving distinction
* diver profile
* certification
* diving experience
* buddy availability
* filters
* buddy request
* buddy matching
* safety and privacy

Never expose a user’s exact real-time location publicly by default.

Use approximate location or appropriate privacy-preserving location representation until both users have intentionally shared more precise information.

Potential filters include:

* distance
* scuba
* freediving
* certification level
* experience level
* preferred diving type
* available date
* activity region

Buddy matching should eventually connect directly to dive plans and dive logs.

⸻

4.2 Equipment Recommendation

Help divers choose appropriate equipment based on:

* diving type
* water temperature
* expected depth
* location
* season
* experience
* budget
* existing equipment

Do not begin with unrestricted AI recommendations.

Initial implementation should use deterministic rules or structured recommendation logic.

Example concept:

Input
→ Environment
→ Diving Type
→ Experience
→ Budget
→ Equipment Requirements
→ Recommended Category
→ Recommended Products
→ Explanation

Always explain why equipment is recommended.

Do not imply that application recommendations replace professional training, manufacturer instructions, or professional equipment inspection.

⸻

4.3 Equipment Management

Users can register personal diving equipment.

Equipment records may include:

* manufacturer
* model
* category
* serial number if applicable
* purchase date
* first-use date
* last inspection date
* last overhaul date
* service interval
* number of dives
* notes
* images

Examples:

* regulator
* BCD
* dive computer
* wetsuit
* drysuit
* fins
* mask
* tank
* SMB
* reel
* dive light
* freediving fins
* freediving wetsuit
* weight belt
* lanyard

Maintenance notifications should support:

* date interval
* dive-count interval

Example:

12 months OR 100 dives
whichever occurs first

Equipment used in a recorded dive should automatically increment appropriate usage data where technically appropriate.

Never label equipment as objectively “safe” based only on app data.

Use terminology such as:

* Maintenance Status
* Inspection Due
* Service Due

instead of claiming the equipment is safe or unsafe.

⸻

4.4 Dive Tours

Users can create and join diving tours.

Support two conceptual categories:

Community Tour

Created by ordinary users.

Official Tour

Created by a verified dive shop, instructor, operator, or approved organization.

Tour information may include:

* title
* cover image
* date
* location
* dive site
* scuba / freediving
* expected depth
* required certification
* minimum experience
* participant limit
* current participants
* price
* equipment rental availability
* tank information
* accommodation
* transportation
* boat / shore diving
* Nitrox availability
* description

Users should be able to:

* search
* filter
* create
* request participation
* approve / reject participation
* leave a tour
* communicate with participants

Tour group chat can be automatically created after participation.

⸻

4.5 Dive Map

The map should eventually become one of the central interfaces of the application.

Potential map layers:

Buddy
Dive Site
Dive Pool
Dive Shop
Tour

Users must be able to enable or disable layers.

The map system must be designed for global expansion even if the initial database primarily contains Korean locations.

⸻

4.6 Korean Dive Pools

Provide dive-pool information for South Korea.

Support:

* map view
* list view

Pool information may include:

* name
* address
* latitude
* longitude
* maximum depth
* pool size
* scuba availability
* freediving availability
* operating hours
* reservation method
* price
* parking
* shower facilities
* equipment rental
* air filling
* website
* phone number

The database structure must allow international pools to be added later.

Do not hard-code the database schema around Korea-only assumptions.

⸻

4.7 Dive Computer Integration

The application should eventually connect to supported dive computers and import dive data.

Possible manufacturers include:

* Garmin
* Shearwater
* Suunto
* Mares
* Cressi
* Oceanic
* others

Do not assume all devices share a standard Bluetooth protocol.

Treat each manufacturer integration as an independent adapter.

Architecture concept:

Dive Computer
      ↓
BLE / File / Manufacturer Integration
      ↓
Device Adapter
      ↓
Parser
      ↓
Normalized Dive Data
      ↓
Dive Log

Use adapter-based architecture.

Example conceptual module structure:

dive-computer/
  adapters/
    garmin/
    shearwater/
    suunto/
  parsers/
  normalized-model/
  services/

The application must remain functional even without direct dive-computer integration.

Implementation priority:

1. Manual Dive Log
2. File Import where practical
3. Supported manufacturer integrations
4. Direct BLE integrations

Do not attempt unsupported reverse-engineered protocols without explicit approval.

⸻

4.8 Dive Log

Dive Log is a central application entity.

Potential scuba data:

* date
* location
* dive site
* start time
* end time
* dive duration
* maximum depth
* average depth
* water temperature
* gas
* Nitrox percentage
* tank pressure
* SAC
* NDL
* CNS
* decompression information
* ascent rate

Potential freediving data:

* maximum depth
* dive duration
* surface interval
* descent speed
* ascent speed
* heart rate
* discipline

Not all dive computers provide all fields.

Fields must therefore support missing or nullable values.

Never fabricate unavailable diving data.

⸻

5. Data Relationships

Avoid implementing features as isolated modules.

Plan relationships similar to:

User
 ├── Profile
 ├── Certifications
 ├── Equipment
 ├── Dive Logs
 ├── Buddy Relationships
 ├── Tours
 ├── Messages
 └── Preferences
Dive Log
 ├── User
 ├── Dive Site
 ├── Buddy
 ├── Equipment Used
 ├── Dive Computer
 └── Environmental Data

Favor normalized relational data where appropriate.

⸻

6. Required Technology Stack

Use this stack unless the user explicitly approves a change.

Mobile

* React Native
* Expo
* TypeScript
* Expo Router

Styling / UI

* NativeWind where appropriate
* reusable React Native components
* centralized design tokens

Client State

* Zustand

Server State / Data Fetching

* TanStack Query

Backend

* Supabase

Use Supabase for:

* PostgreSQL
* Authentication
* Storage
* Realtime
* Edge Functions

Database

* PostgreSQL

Geospatial

* PostGIS

Map

Preferred:

* Mapbox

Do not tightly couple domain logic to the map provider.

Create abstraction where reasonable so the provider can be changed later.

Notifications

* Expo Notifications

Admin Web

When implemented:

* Next.js
* TypeScript

Error Monitoring

* Sentry

Repository

* Git
* GitHub

Package Manager

Preferred:

* pnpm

Monorepo

If the project contains both mobile and admin applications, use:

* Turborepo

unless the existing repository already uses a different reasonable structure.

⸻

7. Project Architecture

Prefer feature/domain-based architecture over one huge components directory.

Example:

apps/
  mobile/
  admin/
packages/
  ui/
  types/
  utils/
supabase/
  migrations/
  functions/
  seed/

Inside the mobile app:

src/
  features/
    auth/
    buddy/
    map/
    dive-log/
    dive-computer/
    gear/
    gear-recommendation/
    tour/
    dive-site/
    dive-pool/
    chat/
    profile/
  components/
  hooks/
  services/
  stores/
  types/
  constants/
  utils/

Keep domain-specific code inside its feature wherever practical.

Do not create unnecessary abstraction layers before they are needed.

⸻

8. Design Direction

The application must feel:

* premium
* modern
* minimal
* clean
* technical
* calm
* ocean-inspired

Do NOT make it look like:

* a childish diving application
* a generic social network
* a gaming interface
* a neon cyberpunk application
* a template marketplace app
* an overly colorful travel application

The visual identity should evoke:

* the ocean
* depth
* precision
* exploration
* professional diving equipment

⸻

9. Color System

The primary visual direction is:

White background + Deep Blue

Do not introduce arbitrary primary colors.

Use a restrained palette.

Recommended Initial Tokens

export const colors = {
  background: "#FFFFFF",
  surface: "#F7F9FC",
  surfaceElevated: "#FFFFFF",
  primary: "#082B5C",
  primaryStrong: "#061F42",
  primarySoft: "#EAF1F8",
  textPrimary: "#101828",
  textSecondary: "#667085",
  textTertiary: "#98A2B3",
  border: "#E4E7EC",
  divider: "#EAECF0",
  success: "#16865C",
  warning: "#C47A18",
  error: "#C93C3C",
};

These values are an initial design system, not immutable forever.

However, any change to the primary brand color must be deliberate and globally applied.

Avoid scattered hard-coded colors inside components.

All colors must come from centralized design tokens whenever possible.

⸻

10. Brand Color Rules

Primary Deep Blue is used for:

* primary buttons
* active navigation
* important icons
* selected controls
* headers where appropriate
* map highlights
* key numbers
* major emphasis

White is the dominant surface.

Approximate visual ratio:

White / Neutral    70–80%
Deep Blue          15–20%
Status Colors       5–10%

Do not flood entire screens with dark blue unless the design specifically benefits from a hero/header treatment.

The application should primarily feel bright and spacious.

⸻

11. Typography

Typography must emphasize information hierarchy.

Prefer:

* large strong page titles
* readable body text
* compact metadata
* clear numerical values

Avoid excessive bold text.

Use a small number of text styles consistently.

Suggested hierarchy:

Display
Heading 1
Heading 2
Heading 3
Body
Body Small
Label
Caption

Use platform-safe or bundled production-ready fonts.

Do not introduce a custom font unless there is a clear reason.

⸻

12. Spacing and Layout

Use an 8-point spacing system wherever practical.

Examples:

4
8
12
16
24
32
40
48

Primary mobile horizontal padding:

16–20px

Cards should have generous whitespace.

Do not overcrowd screens.

Prefer progressive disclosure instead of showing every field at once.

⸻

13. Corner Radius

Use consistent rounded corners.

Suggested values:

Small    8
Medium   12
Large    16
XL       20–24

Avoid extreme pill-shaped UI for everything.

Pills should primarily be used for:

* tags
* filters
* status
* compact actions

⸻

14. Shadows

Keep shadows subtle.

Prefer:

* borders
* surface separation
* very soft elevation

over large heavy shadows.

The application should feel sophisticated, not like floating cards stacked everywhere.

⸻

15. Icons

Use one icon family consistently.

Do not mix multiple unrelated icon styles.

Icons should be:

* minimal
* easily identifiable
* line-based or visually consistent
* suitable for small mobile UI

⸻

16. Navigation

Recommended bottom navigation:

Home
Explore
Dive
Buddy
My

Conceptual responsibilities:

Home

* next dive
* nearby buddies
* upcoming tours
* equipment maintenance
* recent dive

Explore

* dive sites
* dive pools
* dive shops
* tours
* map

Dive

Primary action area.

* add dive
* dive logs
* dive computer
* import dive

Buddy

* buddy map
* matching
* buddy requests
* messages

My

* diver profile
* certifications
* equipment
* preferences
* settings

Do not overcrowd the bottom navigation.

⸻

17. Home Screen Philosophy

The home screen is a dashboard, not a feature directory.

Prioritize actionable information.

Potential hierarchy:

Greeting / Location
Next Dive
Find Buddy
Upcoming Tour
Equipment Maintenance
Recent Dive

Do not place every available feature on the Home screen.

⸻

18. Map UX

The map is a core experience.

It must support:

* smooth panning
* zooming
* clustering
* selectable markers
* filters
* current location
* search-this-area behavior where appropriate

Potential layers:

Buddy
Dive Site
Dive Pool
Dive Shop
Tour

Do not render thousands of individual markers without clustering or viewport-aware loading.

Location queries must use PostGIS or equivalent proper geospatial logic rather than loading the entire world dataset onto the client.

⸻

19. Privacy

Location privacy is critical.

Never expose:

* exact home address
* persistent precise live location
* private user coordinates

to unrelated users.

Use appropriate approximate location representation.

Exact location sharing must be explicit.

Follow least-privilege principles for:

* location
* camera
* photos
* Bluetooth
* notifications

Explain permission requests contextually.

Do not request every device permission during first launch.

Request permissions only when required by the corresponding feature.

⸻

20. Authentication

Initial authentication should prioritize:

* Apple
* Google
* Email

Kakao and Naver can be added when required.

Authentication implementation must securely persist sessions.

Never store passwords directly.

Never place service-role Supabase keys in the mobile client.

Use environment variables appropriately.

⸻

21. Supabase Security

Row Level Security must be enabled for user-sensitive tables.

Never rely only on frontend checks for authorization.

Define explicit policies for:

* profile visibility
* private information
* messages
* equipment
* dive logs
* buddy requests
* tours
* tour participants

Public and private data must be intentionally separated.

⸻

22. Database Changes

All database schema changes must use migrations.

Do not manually mutate production schema without migration history.

Migration files must be:

* understandable
* reversible where practical
* scoped
* logically named

Avoid destructive schema changes unless necessary.

⸻

23. Realtime

Use realtime only when it provides clear user value.

Examples:

* chat
* buddy request updates
* tour participation
* selected status changes

Do not subscribe the client to unnecessary tables globally.

Clean up subscriptions correctly.

⸻

24. Images and Storage

User-generated files may include:

* profile images
* certification images
* equipment images
* tour images
* dive images

Implement:

* file size limits
* supported MIME types
* storage path conventions
* access policy
* image compression where appropriate

Do not upload full-resolution camera images blindly.

⸻

25. Forms

All user input forms must provide:

* validation
* meaningful error messages
* loading state
* disabled state where appropriate
* success feedback

Do not allow duplicate requests due to repeated button taps.

⸻

26. Loading States

Never leave users staring at an empty frozen screen during data loading.

Use appropriate:

* skeletons
* spinners
* placeholders

Do not overuse full-screen spinners.

⸻

27. Empty States

Every list-based page should consider an empty state.

Examples:

No dive logs yet.
Record your first dive.
No equipment registered.
Add your first piece of gear.

Empty states should provide the next useful action.

⸻

28. Error States

Handle:

* offline
* timeout
* server failure
* permission denied
* unavailable location
* Bluetooth failure
* invalid user input

Do not expose raw backend exceptions to users.

Log technical information separately.

⸻

29. Offline Considerations

Diving locations may have poor network connectivity.

Architecture should not unnecessarily assume constant connectivity.

At minimum, design code so future support for:

* cached recent dive logs
* cached equipment
* pending dive log uploads

can be implemented.

Do not make the entire application architecture dependent on permanent online connectivity.

⸻

30. Performance

Be especially careful with:

* maps
* images
* long lists
* realtime
* location updates
* Bluetooth
* charts

Use:

* virtualization
* memoization only where beneficial
* pagination
* lazy loading
* map clustering
* optimized images

Do not optimize prematurely, but do not implement obviously unscalable approaches.

⸻

31. Accessibility

Support:

* readable contrast
* Dynamic Type where practical
* touch targets of appropriate size
* accessible labels
* screen-reader-friendly buttons
* non-color-only status indicators

Deep blue on white must maintain sufficient contrast.

⸻

32. iOS and Android Compatibility

Every feature must be considered on both platforms.

Never assume an implementation working on iOS automatically works on Android.

For platform-sensitive functionality such as:

* permissions
* Bluetooth
* notifications
* maps
* file access
* background execution

explicitly consider both platforms.

Do not use an iOS-only or Android-only library without documenting the limitation.

⸻

33. Expo Policy

Use Expo Development Builds rather than designing the project around Expo Go limitations.

Expo Go may be used for simple development convenience, but the production architecture must support:

* native modules
* BLE
* notifications
* maps
* future dive-computer integrations

Avoid dependencies that make future EAS builds unnecessarily fragile.

⸻

34. Dive Computer Rule

Do NOT begin broad dive-computer integration before validating feasibility.

Before major integration work:

1. Identify exact device.
2. Identify manufacturer API / SDK / supported protocol.
3. Determine available fields.
4. Determine iOS support.
5. Determine Android support.
6. Build a minimal proof of concept.
7. Only then integrate into the production architecture.

Keep manufacturer-specific logic isolated.

⸻

35. Safety-Critical Diving Information

This is a diving application.

Some information can affect user safety.

Never present generated or estimated values as authoritative dive-computer calculations.

Do not implement custom decompression algorithms or safety-critical gas calculations casually.

For safety-critical functionality:

* use verified algorithms or official data
* document the source
* add appropriate limitations
* seek explicit approval before implementing

Do not allow cosmetic UX convenience to override safety.

⸻

36. Code Quality Rules

Write code that is:

* readable
* typed
* modular
* maintainable
* appropriately documented

Prefer clear code over clever code.

Avoid:

* any unless unavoidable
* giant components
* deeply nested conditional JSX
* duplicated domain logic
* magic numbers
* magic strings
* hard-coded API URLs
* hard-coded design values
* business logic embedded directly in presentation components

⸻

37. TypeScript

Use strict TypeScript.

Model domain entities explicitly.

Prefer:

type Dive = {
  id: string;
  userId: string;
  maxDepth: number | null;
};

over loosely typed objects.

Do not suppress TypeScript errors without a justified reason.

⸻

38. Components

A component should have one clear purpose.

If a screen becomes large, extract:

* domain components
* hooks
* data logic
* services

Do not create tiny meaningless components simply to increase component count.

Reuse UI where genuine repetition exists.

⸻

39. Design System

Create reusable primitives early.

Examples:

AppButton
AppText
AppInput
AppCard
AppHeader
AppAvatar
AppBadge
AppChip
AppDivider
AppModal
AppBottomSheet

Do not independently design the same button five different ways.

Centralize:

* colors
* spacing
* radius
* typography
* shadows
* icon sizes

⸻

40. Data Fetching

Use TanStack Query for server state.

Do not duplicate server data unnecessarily in Zustand.

General rule:

TanStack Query
→ server state
Zustand
→ local / application state

Examples of Zustand state:

* map filter
* temporary draft state
* onboarding state
* UI preferences

⸻

41. API / Service Layer

Do not scatter raw Supabase queries throughout arbitrary UI components.

Use an organized repository/service layer where it improves maintainability.

Example:

features/buddy/
  api/
    buddy.api.ts
  hooks/
    useNearbyBuddies.ts
  components/
  screens/
  types.ts

⸻

42. Environment Variables

Secrets and environment-specific values must not be hard-coded.

Separate:

* local
* development
* preview
* production

where necessary.

Never commit private secrets.

⸻

43. Git Discipline

Before major changes, inspect the current diff.

Keep changes logically scoped.

Do not rewrite unrelated files.

Do not delete working code merely because another style is preferred.

Preserve user modifications.

When refactoring, maintain existing behavior unless behavior change is intentional.

⸻

44. Development Workflow

For every development task, follow this process:

Step 1 — Understand

Read the relevant requirements and current implementation.

Step 2 — Inspect

Inspect affected files and architecture.

Step 3 — Plan

Determine the smallest correct implementation.

For large tasks, form a short internal implementation plan before editing.

Step 4 — Implement

Make production-quality changes.

Step 5 — Validate

Run applicable:

* TypeScript checks
* lint
* tests
* Expo checks
* builds where appropriate

Step 6 — Fix

Resolve errors introduced by the change.

Do not knowingly leave broken TypeScript, imports, or obvious runtime errors.

Step 7 — Report

At completion, briefly explain:

* what changed
* important architectural decisions
* files or areas affected
* validation performed
* remaining limitations if any

⸻

45. Continuous Visual Development

The project owner wants to watch development progress continuously and request changes while the application is being built.

Therefore:

* keep the project runnable throughout development whenever practical
* avoid huge untestable batches
* implement screens incrementally
* prefer visible milestones
* maintain a functioning development build
* do not unnecessarily wait until the entire feature is complete before making it testable

A good development sequence is:

Layout
→ Mock Data
→ Interaction
→ Backend Integration
→ Validation
→ Polish

This allows rapid review of the user experience.

⸻

46. Do Not Overbuild

Do not implement speculative systems merely because they may be useful later.

Examples:

Do not build:

* microservices
* Kubernetes
* custom authentication servers
* complex event buses
* premature CQRS
* premature GraphQL layers
* unnecessary abstraction frameworks

unless actual requirements justify them.

The application should be sophisticated in UX and domain design, not artificially complicated in infrastructure.

⸻

47. MVP Development Priority

Unless the user changes priorities, develop approximately in this order.

Phase 0 — Technical Foundation

* repository architecture
* Expo project
* TypeScript
* Expo Router
* design system
* Supabase connection
* environment variables
* lint / formatting
* basic error handling

Phase 1 — Visual Foundation

* splash
* onboarding if required
* authentication screens
* navigation
* Home shell
* reusable UI components

Phase 2 — User / Diver Profile

* user account
* profile
* scuba / freediving identity
* certifications
* experience

Phase 3 — Map Foundation

* permissions
* current location
* Mapbox
* markers
* clustering
* filters

Phase 4 — Buddy

* nearby users
* buddy profile
* filters
* requests
* matching
* privacy

Phase 5 — Dive Pool / Dive Site

* location database
* map
* list
* detail

Phase 6 — Tours

* create
* browse
* detail
* participation
* participants

Phase 7 — Dive Log

* manual entry
* list
* detail
* dive profile visualization
* buddy relationship
* location relationship

Phase 8 — Equipment

* equipment registration
* service history
* maintenance reminders
* dive-count integration

Phase 9 — Chat / Realtime

* buddy chat
* tour group chat
* push notifications

Phase 10 — Equipment Recommendation

* structured rule engine
* environmental inputs
* recommendations
* reasoning

Phase 11 — Dive Computer

* feasibility PoC
* device adapter
* parser
* normalized log
* supported devices gradually expanded

⸻

48. Current Visual Development Standard

When building a new screen:

1. Match the white + deep-blue visual identity.
2. Use the existing design tokens.
3. Reuse existing components.
4. Prioritize clear hierarchy.
5. Keep sufficient whitespace.
6. Test narrow and large phone layouts.
7. Consider both iOS and Android.
8. Add loading, error, and empty states where applicable.
9. Avoid placeholder-looking generic templates.
10. Ensure the screen looks coherent with the rest of the product.

⸻

49. UX Decision Rule

When multiple UX approaches are possible, prioritize in this order:

1. Safety
2. Clarity
3. Ease of use
4. Consistency
5. Speed
6. Visual elegance

Do not sacrifice usability for visual effects.

⸻

50. User Interaction Philosophy

The application serves both beginners and experienced divers.

Therefore interfaces should be approachable without oversimplifying the domain.

Use:

* progressive disclosure
* clear terminology
* explanations where necessary
* sensible defaults

Do not hide professional diving terminology when it is the correct terminology.

Instead, explain it.

⸻

51. Product Language

Structure the code so localization can be added.

Do not scatter user-facing text across logic.

Prefer localization-ready resources.

Initial language may be Korean, but architecture should support:

* Korean
* English

and eventually other languages.

The product is intended for global expansion.

⸻

52. Testing

Prioritize tests for logic that can fail silently.

Especially:

* permissions
* auth state
* buddy privacy
* geospatial queries
* tour participation
* equipment service calculations
* dive-count calculations
* normalization of imported dive data

Do not create meaningless tests simply to increase coverage.

⸻

53. Definition of Done

A task is not complete merely because UI appears on screen.

A feature is considered complete when applicable items are satisfied:

* works on intended screen
* TypeScript passes
* no obvious runtime error
* loading handled
* empty state handled
* error state handled
* permissions handled
* backend security considered
* mobile responsiveness checked
* iOS implications considered
* Android implications considered
* design system followed
* user-facing text is coherent
* no unrelated regressions introduced

⸻

54. Handling Uncertainty

Do not guess when uncertainty could create:

* architectural damage
* security vulnerabilities
* data loss
* privacy exposure
* incompatible device integration
* unsafe diving behavior

Investigate available project information first.

For minor implementation decisions, make a reasonable engineering choice and proceed rather than stopping development unnecessarily.

⸻

55. Refactoring Rule

Refactor when it materially improves:

* maintainability
* correctness
* reuse
* performance
* security

Do not perform broad cosmetic refactors while implementing unrelated functionality.

If existing code is already correct and understandable, preserve it.

⸻

56. Dependencies

Before adding a dependency:

1. Check whether existing dependencies already solve the problem.
2. Verify compatibility with the project’s Expo / React Native version.
3. Prefer actively maintained libraries.
4. Avoid dependency duplication.
5. Consider iOS and Android support.
6. Consider New Architecture compatibility where relevant.

Do not install packages blindly.

⸻

57. Native Module Rule

Before introducing a native dependency:

* verify Expo Development Build support
* verify iOS support
* verify Android support
* inspect required permissions
* inspect required native configuration

Do not jeopardize project build stability for a minor convenience library.

⸻

58. User Data Protection

Treat the following as sensitive application data:

* precise location
* private messages
* personal profile details
* certification documents
* dive history when private
* equipment serial numbers
* potentially identifying images

Use appropriate authorization and data minimization.

Do not log sensitive information unnecessarily.

⸻

59. Final Engineering Principle

Build the simplest architecture that can reliably evolve into the intended global diving platform.

Do not optimize for producing the largest amount of code.

Optimize for:

Correctness
+ Maintainability
+ Safety
+ UX Quality
+ Scalability
+ Fast Iteration

The project owner should be able to run the app frequently, observe progress, and request modifications throughout development.

⸻

60. First Action When Starting a New Session

Whenever beginning work on this repository:

1. Read README.md.
2. Read AGENTS.md.
3. Inspect the repository.
4. Inspect existing dependencies.
5. Inspect current Git status.
6. Identify the current implementation stage.
7. Continue from the existing state rather than rebuilding finished work.
8. Do not change architecture without a concrete reason.
9. Keep the application runnable.
10. Implement the user’s current request completely.

When the current request is large, break implementation into coherent internal stages, but continue working until the requested scope has been completed as far as reasonably possible.

Always leave the repository in a better and more stable state than you found it.