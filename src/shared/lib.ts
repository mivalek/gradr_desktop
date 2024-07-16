import { HL_OPACITY } from '@shared/constants'
import { TRubricStore } from './types'

const generateCriterionStyle = (label: string, opacity: number = HL_OPACITY) =>
  `.gradr-crit-${label} {
    &.gradr-hl, &.gradr-hl::after {
      background: rgba(var(--gradr-${label}), ${opacity});
      & .gradr-hl.gradr-crit-${label}:not(.hovered) {
        background: transparent !important;
      }
      &.hovered {
        background: rgb(var(--gradr-${label}));
        * {
          background: transparent !important;
        }
      }
    }
    &.gradr-comment {
      border-color: rgba(var(--gradr-${label}), ${opacity}); 
      
      & .gradr-comment-header {
        background: rgba(var(--gradr-${label}), ${opacity});
      }
      &.hovered {
        border-color: rgb(var(--gradr-${label}));
        & .gradr-comment-header {
            background: rgb(var(--gradr-${label}));
        }
      }
    }
  }`

export const rubricStyle = (rubric: TRubricStore) =>
  `:root{
        --gradr-cmnt: 255, 229, 0;
        --gradr-good: 33, 184, 13;
        --gradr-attn: 255, 119, 0;
        --gradr-prob: 212, 11, 11;
        ${rubric.criteria.map((crit) => `--gradr-${crit.label}:${crit.colour};`).join('')}}
          ${rubric.criteria.map((crit) => generateCriterionStyle(crit.label)).join('')}
          ${['cmnt', 'good', 'attn', 'prob'].map((crit) => generateCriterionStyle(crit, crit === 'cmnt' ? 0.5 : HL_OPACITY)).join('')}`
