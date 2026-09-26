// Platform feature flags, bundled from fixtures/ (docs/tech/feature-flags.md).
import matrix from '../../fixtures/feature-flags.json'
import type { Schemas } from './api'

const flags = matrix as Schemas['FlagMatrix']

export const flagsFor = (isWap: boolean) => (isWap ? flags.wap : flags.web)
