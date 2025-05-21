export interface DataObject {
	[key: string]: any
}

export interface VariableValues {
	[key: string]: string | number | boolean
}

export function flattenObj(obj: DataObject, parent: string, res: DataObject = {}, depth: number = 1): VariableValues {
	if (depth > 10) return res //to avoid infinite recursion
	for (const key in obj) {
		const propName = parent ? parent + '_' + key : key
		if (typeof obj[key] == 'object') {
			flattenObj(obj[key], propName, res, depth + 1)
		} else if (typeof obj[key] == 'string' || typeof obj[key] == 'number' || typeof obj[key] == 'boolean') {
			res[propName] = obj[key]
		} else if (typeof obj[key] == 'bigint' || typeof obj[key] == 'symbol' || typeof obj[key] == 'undefined') {
			res[propName] = obj[key]?.toString()
		} else if (typeof obj[key] == 'function') {
			continue
		}
	}
	return res
}

export const sanitiseVariableId = (id: string, substitute: '' | '.' | '-' | '_' = '_'): string =>
	id.replaceAll(/[^a-zA-Z0-9-_.]/gm, substitute)
