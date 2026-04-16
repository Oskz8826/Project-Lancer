export type QuoteStatus = 'draft' | 'ready' | 'sent' | 'accepted' | 'rejected' | 'completed'
export type UserRole = 'freelancer' | 'studio'
export type WorkingCurrency = 'EUR' | 'GBP' | 'USD'
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'max'

export type Discipline =
  | '3d_hard_surface'
  | '3d_character'
  | '2d_concept_art'
  | 'environment_art'
  | 'vfx_technical'
  | 'ui_ux'
  | '2d_animation'
  | '3d_animation'
  | 'game_design'
  | 'development'
  | 'sound_design'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  primary_discipline: Discipline
  additional_skills: Discipline[]
  region: string
  country: string
  working_currency: WorkingCurrency
  tier: SubscriptionTier
  ai_addon: boolean
  quotes_used_this_month: number
  created: string
  updated: string
}

export type ExperienceLevel = 'Junior' | 'Mid' | 'Senior' | 'Veteran'
export type ComplexityTier = 'Simple' | 'Mid' | 'Complex' | 'Hero'
export type UsageRights = 'Personal' | 'Indie' | 'Commercial' | 'AAA' | 'Exclusive'
export type RevisionType = 'Minor' | 'Standard' | 'Major'

export interface QuoteData {
  // Step 1
  discipline: Discipline
  asset_type: string
  complexity_tier: ComplexityTier
  // Step 2
  experience_level: ExperienceLevel
  region: string
  country: string
  // Step 3
  hourly_rate: number
  hours_min: number
  hours_max: number
  rate_is_custom: boolean
  hours_are_custom: boolean
  // Step 4
  revision_rounds: number
  revision_type: RevisionType
  usage_rights: UsageRights
  rush_job: boolean
  project_name: string
  client_name: string
  notes: string
  client_brief: string
  // Step 5 (computed on save)
  quote_min: number
  quote_max: number
  quote_mid: number
  confidence?: 'Low' | 'Medium' | 'High'
  confidence_reason?: string
  ai_assisted: boolean
}

export interface OnboardingData {
  name: string
  email: string
  password: string
  role: UserRole
  primary_discipline: Discipline
  additional_skills: Discipline[]
  region: string
  country: string
  working_currency: WorkingCurrency
}
