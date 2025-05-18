import { PasteFormat, Publicity } from './enums.js'

export interface ParameterObject {
	api_dev_key?: string
	api_paste_expire_date?: string
	api_folder_key?: string
	api_option?: string
	api_paste_code?: string
	api_paste_format?: string
	api_paste_key?: string
	api_paste_name?: string
	api_paste_private?: string
	api_results_limit?: string
	api_user_key?: string
	api_user_name?: string
	api_user_password?: string
}

export interface ParsedPaste {
	paste_key: string
	paste_date: number
	paste_title: string
	paste_size: number
	paste_expire_date: number
	paste_private: Publicity
	paste_format_long: string
	paste_format_short: PasteFormat
	paste_url: string
	paste_hits: string
}
