import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

const API_PATH = 'pastebin.com'

export type ModuleConfig = {
	domain: string
	user: string
}

export type ModuleSecrets = {
	devKey: string
	password: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'domain',
			label: 'Domain',
			width: 8,
			default: API_PATH,
			regex: Regex.HOSTNAME,
			minLength: 1,
		},
		{
			type: 'secret-text',
			id: 'devKey',
			label: 'Developer API Key',
			width: 8,
			regex: Regex.SOMETHING,
			minLength: 1,
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'User Name',
			width: 8,
			regex: Regex.SOMETHING,
			minLength: 1,
		},
		{
			type: 'secret-text',
			id: 'password',
			label: 'Password',
			width: 8,
			regex: Regex.SOMETHING,
			minLength: 1,
		},
	]
}
