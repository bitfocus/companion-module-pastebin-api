import {
	CreateUseActionResultStoreUpgradeScript,
	FixupNumericOrVariablesValueToExpressions,
	type CompanionStaticUpgradeProps,
	type CompanionStaticUpgradeResult,
	type CompanionStaticUpgradeScript,
	type CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from './config.js'
import { ActionId } from './actions.js'

function migrateGetRawPasteToResultFlow(
	context: CompanionUpgradeContext<ModuleConfig>,
	props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
	return CreateUseActionResultStoreUpgradeScript<ModuleConfig, ModuleSecrets>({
		[ActionId.GetRawPaste]: 'variable',
	})(context, props)
}

function migrateGetPastesLimitToNumber(
	_context: CompanionUpgradeContext<ModuleConfig>,
	props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
	const result: CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}
	for (const action of props.actions) {
		if (action.actionId === (ActionId.GetPastes as string)) {
			action.options.limit = FixupNumericOrVariablesValueToExpressions(action.options.limit)
			result.updatedActions.push(action)
		}
	}
	return result
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets>[] = [
	migrateGetPastesLimitToNumber,
	migrateGetRawPasteToResultFlow,
]
