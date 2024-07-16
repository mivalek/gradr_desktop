import { TProjectConfig } from './types'

export const RUBRIC_COLOURS = [
  '106, 76, 147',
  '25, 130, 196',
  '138, 201, 38',
  '255, 202, 58',
  '255, 146, 76',
  '255, 89, 94'
] as const

export const PROJECT_CONFIG_FILE = 'gradR'
export const NEW_GLOBAL_CONFIG = {
  openedProject: '',
  openedFile: ''
}

export const NEW_PROJECT_CONFIG: TProjectConfig = {
  rubric: { name: '', criteria: [] },
  commented: [],
  graded: []
}
export const HL_OPACITY = 0.7
