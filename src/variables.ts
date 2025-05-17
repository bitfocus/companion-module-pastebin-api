import type { PasteBinAPI } from './main.js'

export function UpdateVariableDefinitions(self: PasteBinAPI): void {
	self.setVariableDefinitions([
		{ variableId: 'variable1', name: 'My first variable' },
		{ variableId: 'variable2', name: 'My second variable' },
		{ variableId: 'variable3', name: 'Another variable' },
	])
}
