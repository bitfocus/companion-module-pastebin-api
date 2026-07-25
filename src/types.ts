// import type { InstanceBase } from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from './config.js'
import type { ActionSchema } from './actions.js'
import type { VariableSchema } from './variables.js'

export interface PastebinModuleTypes {
	config: ModuleConfig
	secrets: ModuleSecrets
	actions: ActionSchema
	feedbacks: Record<string, never>
	variables: VariableSchema
}
