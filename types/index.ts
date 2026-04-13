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
