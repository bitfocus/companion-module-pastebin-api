import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import type { PasteBinAPI } from './main.js'
import { sanitiseVariableId } from './util.js'

export function UpdateVariableDefinitions(self: PasteBinAPI): void {
	const variableDefs: CompanionVariableDefinition[] = []
	const variableValues: CompanionVariableValues = {}
	variableDefs.push({ variableId: `mostRecentUrl`, name: `URL: Most recently created` })
	self.pastes.forEach((paste) => {
		variableDefs.push({
			variableId: `${sanitiseVariableId(paste.paste_key)}_Key`,
			name: `Key: ${paste.paste_title} (${paste.paste_format_long})`,
		})
		variableDefs.push({
			variableId: `${sanitiseVariableId(paste.paste_key)}_Title`,
			name: `Title: ${paste.paste_title} (${paste.paste_format_long})`,
		})
		variableDefs.push({
			variableId: `${sanitiseVariableId(paste.paste_key)}_Format`,
			name: `Format: ${paste.paste_title} (${paste.paste_format_long})`,
		})
		variableDefs.push({
			variableId: `${sanitiseVariableId(paste.paste_key)}_URL`,
			name: `URL: ${paste.paste_title} (${paste.paste_format_long})`,
		})
	})
	self.setVariableDefinitions(variableDefs)
	self.pastes.forEach((paste) => {
		variableValues[`${sanitiseVariableId(paste.paste_key)}_Key`] = paste.paste_key
		variableValues[`${sanitiseVariableId(paste.paste_key)}_Title`] = paste.paste_title
		variableValues[`${sanitiseVariableId(paste.paste_key)}_Format`] = paste.paste_format_long
		variableValues[`${sanitiseVariableId(paste.paste_key)}_URL`] = paste.paste_url
	})
	self.setVariableValues(variableValues)
}
