import type { Discipline } from '@/types'

// ─── Benchmark Region Keys ───────────────────────────────────────────────────
type BenchmarkRegion = 'EE' | 'WE' | 'NA' | 'UK'

// Maps app region value + country to a benchmark region
export function getBenchmarkRegion(region: string, country: string): BenchmarkRegion {
  if (country === 'United Kingdom') return 'UK'
  if (region === 'eastern_europe') return 'EE'
  if (region === 'western_europe') return 'WE'
  if (region === 'north_america') return 'NA'
  // Fallback: Latin America, Asia Pacific, MENA → Eastern Europe rates
  return 'EE'
}

// ─── Rate Benchmarks (EUR/hr) ─────────────────────────────────────────────────
// [Junior, Mid, Senior, Veteran]
type RatesByExperience = [number, number, number, number]
type RatesByRegion = Record<BenchmarkRegion, RatesByExperience>

export const RATE_BENCHMARKS: Record<Discipline, RatesByRegion> = {
  '3d_hard_surface': {
    EE: [18, 30, 45, 60],
    WE: [35, 60, 90, 130],
    NA: [45, 75, 110, 160],
    UK: [35, 58, 85, 120],
  },
  '3d_character': {
    EE: [20, 35, 55, 75],
    WE: [40, 65, 95, 140],
    NA: [50, 80, 120, 175],
    UK: [38, 62, 90, 130],
  },
  '2d_concept_art': {
    EE: [15, 25, 40, 60],
    WE: [30, 50, 75, 110],
    NA: [40, 65, 95, 140],
    UK: [28, 48, 70, 105],
  },
  'environment_art': {
    EE: [18, 30, 48, 65],
    WE: [35, 58, 88, 125],
    NA: [45, 72, 108, 155],
    UK: [33, 55, 82, 118],
  },
  'vfx_technical': {
    EE: [20, 35, 55, 80],
    WE: [40, 65, 100, 145],
    NA: [50, 85, 130, 185],
    UK: [38, 60, 95, 138],
  },
  'ui_ux': {
    EE: [15, 28, 45, 65],
    WE: [30, 55, 80, 120],
    NA: [40, 68, 100, 150],
    UK: [30, 52, 78, 115],
  },
  'game_design': {
    EE: [15, 28, 45, 65],
    WE: [28, 50, 75, 110],
    NA: [35, 62, 95, 140],
    UK: [28, 50, 72, 108],
  },
  'development': {
    EE: [20, 38, 60, 90],
    WE: [35, 65, 100, 150],
    NA: [45, 80, 125, 185],
    UK: [35, 62, 95, 145],
  },
  'sound_design': {
    EE: [12, 22, 38, 58],
    WE: [25, 45, 70, 100],
    NA: [30, 55, 85, 130],
    UK: [25, 42, 65, 95],
  },
  '2d_animation': {
    EE: [15, 25, 42, 62],
    WE: [30, 50, 78, 115],
    NA: [38, 62, 95, 145],
    UK: [28, 48, 72, 108],
  },
  '3d_animation': {
    EE: [20, 35, 58, 82],
    WE: [38, 65, 98, 145],
    NA: [48, 80, 125, 180],
    UK: [35, 60, 92, 135],
  },
}

const EXP_INDEX: Record<string, number> = {
  Junior: 0,
  Mid: 1,
  Senior: 2,
  Veteran: 3,
}

export function getSuggestedRate(
  discipline: Discipline,
  region: string,
  country: string,
  experienceLevel: string,
): number {
  const benchRegion = getBenchmarkRegion(region, country)
  const rates = RATE_BENCHMARKS[discipline][benchRegion]
  return rates[EXP_INDEX[experienceLevel] ?? 1]
}

// ─── Asset Types + Hour Estimates ─────────────────────────────────────────────
// Hours: { min, max } per ComplexityTier [Simple, Mid, Complex, Hero]
export type HourRange = { min: number; max: number }
export type AssetHours = { Simple: HourRange; Mid: HourRange; Complex: HourRange; Hero: HourRange }

export const ASSET_TYPES: Record<Discipline, { label: string; hours: AssetHours }[]> = {
  '3d_hard_surface': [
    { label: 'Prop',         hours: { Simple: {min:2,max:6},   Mid: {min:6,max:16},  Complex: {min:16,max:35}, Hero: {min:35,max:80}  } },
    { label: 'Modular Kit',  hours: { Simple: {min:12,max:20}, Mid: {min:20,max:40}, Complex: {min:40,max:80}, Hero: {min:80,max:160} } },
    { label: 'Vehicle',      hours: { Simple: {min:16,max:30}, Mid: {min:30,max:55}, Complex: {min:55,max:100},Hero: {min:100,max:200}} },
    { label: 'Weapon',       hours: { Simple: {min:4,max:8},   Mid: {min:8,max:16},  Complex: {min:16,max:28}, Hero: {min:28,max:50}  } },
    { label: 'Building',     hours: { Simple: {min:20,max:35}, Mid: {min:35,max:65}, Complex: {min:65,max:120},Hero: {min:120,max:220}} },
  ],
  '3d_character': [
    { label: 'Character (No Rig)',  hours: { Simple: {min:10,max:18}, Mid: {min:18,max:32}, Complex: {min:32,max:55},  Hero: {min:55,max:100}  } },
    { label: 'Character + Rig',     hours: { Simple: {min:20,max:35}, Mid: {min:35,max:60}, Complex: {min:60,max:110}, Hero: {min:110,max:200} } },
    { label: 'Enemy / NPC',         hours: { Simple: {min:12,max:22}, Mid: {min:22,max:40}, Complex: {min:40,max:70},  Hero: {min:70,max:130}  } },
    { label: 'Creature',            hours: { Simple: {min:18,max:32}, Mid: {min:32,max:60}, Complex: {min:60,max:110}, Hero: {min:110,max:200} } },
  ],
  '2d_concept_art': [
    { label: 'Character Sheet',     hours: { Simple: {min:4,max:8},  Mid: {min:8,max:14},  Complex: {min:14,max:24}, Hero: {min:24,max:45} } },
    { label: 'Environment Concept', hours: { Simple: {min:3,max:6},  Mid: {min:6,max:12},  Complex: {min:12,max:22}, Hero: {min:22,max:40} } },
    { label: 'Prop / Item Sheet',   hours: { Simple: {min:2,max:4},  Mid: {min:4,max:8},   Complex: {min:8,max:15},  Hero: {min:15,max:28} } },
    { label: 'Splash Art',          hours: { Simple: {min:6,max:10}, Mid: {min:10,max:18}, Complex: {min:18,max:32}, Hero: {min:32,max:60} } },
  ],
  'environment_art': [
    { label: 'Interior Scene',      hours: { Simple: {min:20,max:35}, Mid: {min:35,max:65},  Complex: {min:65,max:120},  Hero: {min:120,max:220} } },
    { label: 'Exterior Environment',hours: { Simple: {min:25,max:45}, Mid: {min:45,max:85},  Complex: {min:85,max:160},  Hero: {min:160,max:300} } },
    { label: 'Modular Tileset',     hours: { Simple: {min:15,max:28}, Mid: {min:28,max:55},  Complex: {min:55,max:100},  Hero: {min:100,max:180} } },
    { label: 'Game Level',          hours: { Simple: {min:30,max:55}, Mid: {min:55,max:100}, Complex: {min:100,max:180}, Hero: {min:180,max:320} } },
  ],
  'vfx_technical': [
    { label: 'Particle System', hours: { Simple: {min:4,max:8},   Mid: {min:8,max:16},  Complex: {min:16,max:30}, Hero: {min:30,max:55}  } },
    { label: 'Shader',          hours: { Simple: {min:5,max:10},  Mid: {min:10,max:20}, Complex: {min:20,max:38}, Hero: {min:38,max:70}  } },
    { label: 'Full VFX Set',    hours: { Simple: {min:15,max:28}, Mid: {min:28,max:50}, Complex: {min:50,max:90}, Hero: {min:90,max:160} } },
  ],
  'ui_ux': [
    { label: 'UI Screen',   hours: { Simple: {min:4,max:8},   Mid: {min:8,max:15},  Complex: {min:15,max:28}, Hero: {min:28,max:50}  } },
    { label: 'Icon Set',    hours: { Simple: {min:4,max:8},   Mid: {min:8,max:16},  Complex: {min:16,max:28}, Hero: {min:28,max:50}  } },
    { label: 'Full UI Kit', hours: { Simple: {min:20,max:38}, Mid: {min:38,max:70}, Complex: {min:70,max:120},Hero: {min:120,max:220} } },
    { label: 'UX Flow',     hours: { Simple: {min:8,max:15},  Mid: {min:15,max:28}, Complex: {min:28,max:50}, Hero: {min:50,max:90}  } },
  ],
  'game_design': [
    { label: 'Level Design Doc', hours: { Simple: {min:8,max:15},  Mid: {min:15,max:28}, Complex: {min:28,max:50}, Hero: {min:50,max:90}  } },
    { label: 'Game Design Doc',  hours: { Simple: {min:15,max:28}, Mid: {min:28,max:50}, Complex: {min:50,max:90}, Hero: {min:90,max:160} } },
    { label: 'System Design',    hours: { Simple: {min:10,max:18}, Mid: {min:18,max:35}, Complex: {min:35,max:65}, Hero: {min:65,max:120} } },
  ],
  'development': [
    { label: 'Feature / Module', hours: { Simple: {min:8,max:16},   Mid: {min:16,max:32},  Complex: {min:32,max:60},   Hero: {min:60,max:110}  } },
    { label: 'System Build',     hours: { Simple: {min:20,max:40},  Mid: {min:40,max:75},  Complex: {min:75,max:140},  Hero: {min:140,max:250} } },
    { label: 'Full Game Build',  hours: { Simple: {min:60,max:100}, Mid: {min:100,max:180},Complex: {min:180,max:320}, Hero: {min:320,max:600} } },
  ],
  'sound_design': [
    { label: 'SFX Pack',                 hours: { Simple: {min:4,max:8},   Mid: {min:8,max:16},  Complex: {min:16,max:28}, Hero: {min:28,max:50}  } },
    { label: 'Music Track',              hours: { Simple: {min:5,max:10},  Mid: {min:10,max:18}, Complex: {min:18,max:32}, Hero: {min:32,max:60}  } },
    { label: 'Full Audio Implementation',hours: { Simple: {min:15,max:28}, Mid: {min:28,max:50}, Complex: {min:50,max:90}, Hero: {min:90,max:160} } },
  ],
  '2d_animation': [
    { label: 'Sprite Sheet',           hours: { Simple: {min:5,max:10},  Mid: {min:10,max:20}, Complex: {min:20,max:36}, Hero: {min:36,max:65}  } },
    { label: 'Character Animation Set', hours: { Simple: {min:10,max:20}, Mid: {min:20,max:38}, Complex: {min:38,max:70}, Hero: {min:70,max:130} } },
    { label: 'Cutscene / Short',        hours: { Simple: {min:15,max:28}, Mid: {min:28,max:50}, Complex: {min:50,max:90}, Hero: {min:90,max:170} } },
  ],
  '3d_animation': [
    { label: 'Animation Clip',      hours: { Simple: {min:6,max:12},  Mid: {min:12,max:22}, Complex: {min:22,max:40},  Hero: {min:40,max:75}  } },
    { label: 'Cinematic Animation', hours: { Simple: {min:20,max:38}, Mid: {min:38,max:70}, Complex: {min:70,max:130}, Hero: {min:130,max:240} } },
    { label: 'Motion Capture Edit', hours: { Simple: {min:8,max:16},  Mid: {min:16,max:30}, Complex: {min:30,max:55},  Hero: {min:55,max:100}  } },
  ],
}

export function getSuggestedHours(
  discipline: Discipline,
  assetLabel: string,
  complexity: string,
): HourRange {
  const types = ASSET_TYPES[discipline]
  const asset = types.find(a => a.label === assetLabel)
  if (!asset) return { min: 8, max: 16 }
  return asset.hours[complexity as keyof AssetHours] ?? { min: 8, max: 16 }
}

// ─── Usage Rights Multipliers ─────────────────────────────────────────────────
export const USAGE_MULTIPLIERS: Record<string, number> = {
  Personal:    1.00,
  Indie:       1.30,
  Commercial:  1.80,
  AAA:         2.50,
  Exclusive:   1.75,
}

export const USAGE_LABELS: Record<string, string> = {
  Personal:   'Personal / Portfolio',
  Indie:      'Indie (<€250k revenue)',
  Commercial: 'Commercial (€250k–€2M)',
  AAA:        'AAA / Large (>€2M)',
  Exclusive:  'Exclusive Rights',
}

// ─── Revision Rates (% per round added to base_mid) ──────────────────────────
export const REVISION_RATES: Record<string, number> = {
  Minor:    0.05,
  Standard: 0.10,
  Major:    0.20,
}

// ─── Pricing Calculation ──────────────────────────────────────────────────────
export interface QuoteCalculation {
  base_min: number
  base_max: number
  revision_add: number
  rush_add: number
  quote_min: number
  quote_max: number
  quote_mid: number
}

export function calculateQuote(params: {
  hours_min: number
  hours_max: number
  hourly_rate: number
  revision_rounds: number
  revision_type: string
  usage_rights: string
  rush_job: boolean
}): QuoteCalculation {
  const { hours_min, hours_max, hourly_rate, revision_rounds, revision_type, usage_rights, rush_job } = params

  const base_min = hours_min * hourly_rate
  const base_max = hours_max * hourly_rate
  const base_mid = (base_min + base_max) / 2

  const rev_rate = REVISION_RATES[revision_type] ?? 0.10
  const revision_add = base_mid * rev_rate * revision_rounds
  const rush_add = rush_job ? base_mid * 0.30 : 0
  const usage_mult = USAGE_MULTIPLIERS[usage_rights] ?? 1.0

  const quote_min = (base_min + revision_add + rush_add) * usage_mult
  const quote_max = (base_max + revision_add + rush_add) * usage_mult
  const quote_mid = (quote_min + quote_max) / 2

  return { base_min, base_max, revision_add, rush_add, quote_min, quote_max, quote_mid }
}
