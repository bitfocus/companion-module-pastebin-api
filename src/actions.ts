import { CompanionActionDefinition, DropdownChoice, Regex } from '@companion-module/base'
import { DropdownExpire, DropdownPasteFormat, DropdownPrivate } from './choices.js'
import type { PasteBinAPI } from './main.js'
import { ApiPasteFormat, ExpireDate, Publicity } from 'pastebin-api'

export enum ActionId {
	CreatePaste = 'createPaste',
	DeletePaste = 'deletePaste',
	GetPastes = 'getPastes',
	GetRawPaste = 'getRawPaste',
}

export function UpdateActions(self: PasteBinAPI): void {
	const pasteChoices: DropdownChoice[] = []
	self.pastes.forEach((paste) => {
		pasteChoices.push({ id: paste.paste_key, label: paste.paste_title })
	})
	const actions: { [id in ActionId]: CompanionActionDefinition } = {
		[ActionId.CreatePaste]: {
			name: 'Create Paste',
			options: [
				{
					type: 'textinput',
					id: 'name',
					label: 'Name',
					default: 'New Paste',
					useVariables: { local: true },
					regex: Regex.SOMETHING,
					required: true,
				},
				{
					type: 'dropdown',
					id: 'publicity',
					label: 'Publicity',
					choices: DropdownPrivate,
					default: DropdownPrivate[0].id,
				},
				{
					type: 'dropdown',
					id: 'expire',
					label: 'Expire',
					choices: DropdownExpire,
					default: DropdownExpire[0].id,
				},
				{
					type: 'dropdown',
					id: 'format',
					label: 'Format',
					choices: DropdownPasteFormat,
					default: DropdownPasteFormat[113].id,
				},
				{
					type: 'textinput',
					id: 'folder',
					label: 'Folder',
					useVariables: { local: true },
					regex: Regex.SOMETHING,
					required: false,
				},
				{
					type: 'textinput',
					id: 'code',
					label: 'Code',
					useVariables: { local: true },
					regex: Regex.SOMETHING,
					required: true,
				},
			],
			callback: async (action, context) => {
				const name = await context.parseVariablesInString(action.options.name?.toString() ?? '')
				const code = await context.parseVariablesInString(action.options.code?.toString() ?? '')
				let folder: string | undefined
				if (action.options.folder) {
					folder = await context.parseVariablesInString(action.options.folder.toString())
				}
				const pasteUrl = await self.createPaste({
					name: name,
					apiUserKey: self.apiUserKey,
					publicity: action.options.publicity as Publicity,
					expireDate: action.options.expire as ExpireDate,
					format: action.options.format as ApiPasteFormat,
					folderKey: folder,
					code: code,
				})
				if (pasteUrl) {
					self.log('info', `Paste ${name} created with URI: ${pasteUrl}`)
					self.setVariableValues({ ['mostRecentUrl']: pasteUrl })
				}
				await self.getPastes({ userKey: self.apiUserKey, limit: 1000 })
			},
		},
		[ActionId.DeletePaste]: {
			name: 'Delete Paste',
			options: [
				{
					type: 'dropdown',
					id: 'pasteKey',
					label: 'Paste Key',
					choices: pasteChoices,
					default: pasteChoices[0]?.id ?? 'No available pastes',
				},
			],
			callback: async (action, context) => {
				const key = await context.parseVariablesInString(action.options.pasteKey?.toString() ?? '')
				if (key == 'No available pastes') return
				const deletePaste = await self.deletePaste({ pasteKey: key, userKey: self.apiUserKey })
				if (deletePaste) {
					self.log('info', `Paste: ${key} deleted`)
					await self.getPastes({ userKey: self.apiUserKey, limit: 1000 })
				} else {
					self.log('warn', `Could not delete ${key}`)
				}
			},
		},
		[ActionId.GetPastes]: {
			name: 'Get Pastes',
			options: [
				{
					type: 'textinput',
					id: 'limit',
					label: 'Limit',
					useVariables: { local: true },
					regex: Regex.SOMETHING,
					default: '1000',
					tooltip: 'Min: 1, Max: 1000',
				},
			],
			callback: async (action, context) => {
				let limit = Number.parseInt(await context.parseVariablesInString(action.options.limit?.toString() ?? ''))
				limit = Number.isNaN(limit) ? 100 : limit < 1 ? 1 : limit > 1000 ? 1000 : limit
				await self.getPastes({ userKey: self.apiUserKey, limit: limit })
			},
		},
		[ActionId.GetRawPaste]: {
			name: 'Get Raw Paste',
			options: [
				{
					type: 'dropdown',
					id: 'pasteKey',
					label: 'Paste Key',
					choices: pasteChoices,
					default: pasteChoices[0]?.id ?? 'No available pastes',
				},
				{
					type: 'custom-variable',
					id: 'variable',
					label: 'Variable',
				},
			],
			callback: async (action, context) => {
				const key = await context.parseVariablesInString(action.options.pasteKey?.toString() ?? '')
				if (key == 'No available pastes') return
				const paste = await self.getRawPaste({ userKey: self.apiUserKey, pasteKey: key })
				if (paste === undefined) {
					self.log('warn', `Could not get raw paste ${key}`)
					return
				}
				self.setCustomVariableValue(action.options.variable?.toString() ?? '', paste)
			},
		},
	}
	self.setActionDefinitions(actions)
}
