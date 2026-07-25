import { CompanionActionDefinitions, DropdownChoice, Regex } from '@companion-module/base'
import { DropdownExpire, DropdownPasteFormat, DropdownPrivate } from './choices.js'
import type PasteBinAPI from './main.js'
import { orderBy } from 'es-toolkit'
import { ApiPasteFormat, ExpireDate, Publicity } from 'pastebin-api'

export enum ActionId {
	CreatePaste = 'createPaste',
	DeletePaste = 'deletePaste',
	GetPastes = 'getPastes',
	GetRawPaste = 'getRawPaste',
}

export type ActionSchema = {
	[ActionId.CreatePaste]: {
		options: {
			name: string
			publicity: Publicity
			expire: ExpireDate
			format: ApiPasteFormat
			folder: string
			code: string
		}
	}
	[ActionId.DeletePaste]: {
		options: {
			pasteKey: string
		}
	}
	[ActionId.GetPastes]: {
		options: {
			limit: number
		}
	}
	[ActionId.GetRawPaste]: {
		options: {
			pasteKey: string
		}
		result: string
	}
}

export function UpdateActions(self: PasteBinAPI): void {
	let pasteChoices: DropdownChoice<string>[] = []
	self.pastes.forEach((paste) => {
		pasteChoices.push({ id: paste.paste_key, label: paste.paste_title })
	})
	pasteChoices = orderBy(pasteChoices, ['label'], ['asc'])
	const actions: CompanionActionDefinitions<ActionSchema> = {
		[ActionId.CreatePaste]: {
			name: 'Create Paste',
			options: [
				{
					type: 'textinput',
					id: 'name',
					label: 'Name',
					default: 'New Paste',
					useVariables: true,
					regex: Regex.SOMETHING,
					minLength: 1,
				},
				{
					type: 'dropdown',
					id: 'publicity',
					label: 'Publicity',
					choices: DropdownPrivate,
					default: DropdownPrivate[0].id,
					expressionDescription: `Options: ${DropdownPrivate.map((choice) => `${choice.id} = ${choice.label}`).join(' | ')}`,
				},
				{
					type: 'dropdown',
					id: 'expire',
					label: 'Expire',
					choices: DropdownExpire,
					default: DropdownExpire[0].id,
					expressionDescription: `Options: ${DropdownExpire.map((choice) => choice.id).join(' | ')}`,
				},
				{
					type: 'dropdown',
					id: 'format',
					label: 'Format',
					choices: DropdownPasteFormat,
					default: DropdownPasteFormat[113].id,
					expressionDescription:
						'Format short-code, e.g. text, python, javascript, csharp, cpp, json. Full list: https://pastebin.com/doc_api#5',
				},
				{
					type: 'textinput',
					id: 'folder',
					label: 'Folder',
					useVariables: true,
				},
				{
					type: 'textinput',
					id: 'code',
					label: 'Code',
					useVariables: true,
					minLength: 0,
					multiline: true,
				},
			],
			callback: async ({ options }, context) => {
				const pasteUrl = await self.createPaste({
					name: options.name,
					apiUserKey: self.apiUserKey,
					publicity: options.publicity,
					expireDate: options.expire,
					format: options.format,
					folderKey: options.folder || undefined,
					code: options.code,
				})
				if (pasteUrl) {
					self.log('info', `Paste ${options.name} created with URI: ${pasteUrl}`)
					self.setVariableValues({ ['mostRecentUrl']: pasteUrl })
				}
				await self.getPastes({ userKey: self.apiUserKey, limit: 1000 }, context.signal)
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
					allowCustom: true,
				},
			],
			callback: async ({ options }, context) => {
				const key = options.pasteKey
				if (key == 'No available pastes') return
				const deletePaste = await self.deletePaste({ pasteKey: key, userKey: self.apiUserKey }, context.signal)
				if (deletePaste) {
					self.log('info', `Paste: ${key} deleted`)
					await self.getPastes({ userKey: self.apiUserKey, limit: 1000 }, context.signal)
				} else {
					self.log('warn', `Could not delete ${key}`)
				}
			},
		},
		[ActionId.GetPastes]: {
			name: 'Get Pastes',
			options: [
				{
					type: 'number',
					id: 'limit',
					label: 'Limit',
					default: 1000,
					min: 1,
					max: 1000,
					asInteger: true,
					clampValues: true,
				},
			],
			callback: async ({ options }, context) => {
				await self.getPastes({ userKey: self.apiUserKey, limit: options.limit }, context.signal)
			},
		},
		[ActionId.GetRawPaste]: {
			name: 'Get Raw Paste',
			hasResult: true,
			options: [
				{
					type: 'dropdown',
					id: 'pasteKey',
					label: 'Paste Key',
					choices: pasteChoices,
					default: pasteChoices[0]?.id ?? 'No available pastes',
					allowCustom: true,
				},
			],
			callback: async ({ options }, context): Promise<string> => {
				const key = options.pasteKey
				if (key == 'No available pastes') throw new Error('No available pastes')
				const paste = await self.getRawPaste({ userKey: self.apiUserKey, pasteKey: key }, context.signal)
				if (!paste) {
					throw new Error(`Could not get raw paste ${key}`)
				}
				return paste
			},
		},
	}
	self.setActionDefinitions(actions)
}
