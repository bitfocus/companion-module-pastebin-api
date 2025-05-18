import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

const API_PATH = 'pastebin.com'

export interface ModuleConfig {
	domain: string
	devKey: string
	user: string
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
		},
		{
			type: 'textinput',
			id: 'devKey',
			label: 'Developer API Key',
			width: 8,
			regex: Regex.SOMETHING,
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'User Name',
			width: 8,
			regex: Regex.SOMETHING,
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 8,
			regex: Regex.SOMETHING,
		},
	]
}
