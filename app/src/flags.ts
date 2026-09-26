// Platform feature flags, bundled from fixtures/ (docs/tech/feature-flags.md).
import { Platform } from 'react-native'
import matrix from '../../fixtures/feature-flags.json'
import type { Schemas } from './api'

export const flags = (matrix as Schemas['FlagMatrix'])[Platform.OS as 'android' | 'ios']
