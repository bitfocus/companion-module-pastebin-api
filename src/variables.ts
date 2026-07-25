import type { CompanionVariableDefinitions } from '@companion-module/base'
import type { ParsedPaste } from 'pastebin-api'
import type PasteBinAPI from './main.js'
import { sanitiseVariableId } from './util.js'

export type VariableSchema = Record<
	'mostRecentUrl' | `${string}_Key` | `${string}_Title` | `${string}_Format` | `${string}_URL`,
	string
>

export function UpdateVariableDefinitions(self: PasteBinAPI): void {
	const variableDefs: CompanionVariableDefinitions<VariableSchema> = {
		mostRecentUrl: { name: `URL: Most recently created` },
	}
	const variableValues: Partial<VariableSchema> = {}
	self.pastes.forEach((paste: ParsedPaste) => {
		const id = sanitiseVariableId(paste.paste_key)
		variableDefs[`${id}_Key`] = { name: `Key: ${paste.paste_title} (${paste.paste_format_long})` }
		variableDefs[`${id}_Title`] = { name: `Title: ${paste.paste_title} (${paste.paste_format_long})` }
		variableDefs[`${id}_Format`] = { name: `Format: ${paste.paste_title} (${paste.paste_format_long})` }
		variableDefs[`${id}_URL`] = { name: `URL: ${paste.paste_title} (${paste.paste_format_long})` }
	})
	self.setVariableDefinitions(variableDefs)
	self.pastes.forEach((paste: ParsedPaste) => {
		const id = sanitiseVariableId(paste.paste_key)
		variableValues[`${id}_Key`] = paste.paste_key
		variableValues[`${id}_Title`] = paste.paste_title
		variableValues[`${id}_Format`] = paste.paste_format_long
		variableValues[`${id}_URL`] = paste.paste_url
	})
	self.setVariableValues(variableValues)
}
