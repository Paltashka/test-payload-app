import type { Config as PayloadGeneratedConfig } from '../payload-types'

declare module 'payload' {
  interface GeneratedTypes extends PayloadGeneratedConfig {}
}
