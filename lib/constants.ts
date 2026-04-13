import type { Discipline } from '@/types'

export const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: '3d_hard_surface', label: '3D Hard Surface' },
  { value: '3d_character', label: '3D Character' },
  { value: '2d_concept_art', label: '2D / Concept Art' },
  { value: 'environment_art', label: 'Environment Art' },
  { value: 'vfx_technical', label: 'VFX / Technical Art' },
  { value: 'ui_ux', label: 'UI/UX' },
  { value: '2d_animation', label: '2D Animation' },
  { value: '3d_animation', label: '3D Animation' },
  { value: 'game_design', label: 'Game Design' },
  { value: 'development', label: 'Development' },
  { value: 'sound_design', label: 'Sound Design' },
]

export const REGIONS: { value: string; label: string; countries: string[] }[] = [
  {
    value: 'western_europe',
    label: 'Western Europe',
    countries: ['Germany', 'France', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland'],
  },
  {
    value: 'eastern_europe',
    label: 'Eastern Europe',
    countries: ['Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Estonia', 'Latvia', 'Lithuania', 'Ukraine', 'Serbia'],
  },
  {
    value: 'north_america',
    label: 'North America',
    countries: ['United States', 'Canada'],
  },
  {
    value: 'latin_america',
    label: 'Latin America',
    countries: ['Brazil', 'Argentina', 'Mexico', 'Colombia', 'Chile'],
  },
  {
    value: 'asia_pacific',
    label: 'Asia Pacific',
    countries: ['China', 'Japan', 'South Korea', 'India', 'Australia', 'New Zealand', 'Indonesia', 'Philippines', 'Vietnam', 'Thailand'],
  },
  {
    value: 'middle_east_africa',
    label: 'Middle East & Africa',
    countries: ['UAE', 'Saudi Arabia', 'Israel', 'South Africa', 'Egypt', 'Nigeria'],
  },
]

export const CURRENCIES = [
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'GBP', label: '£ GBP', symbol: '£' },
  { value: 'USD', label: '$ USD', symbol: '$' },
] as const

// Fixed conversion rates from EUR (updated periodically, not live)
export const CURRENCY_RATES: Record<string, number> = {
  EUR: 1,
  GBP: 0.86,
  USD: 1.08,
}

export const TIER_LIMITS = {
  free: { quotes_per_month: 3, additional_skills: 2 },
  basic: { quotes_per_month: Infinity, additional_skills: Infinity },
  pro: { quotes_per_month: Infinity, additional_skills: Infinity },
  max: { quotes_per_month: Infinity, additional_skills: Infinity },
}
