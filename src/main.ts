import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import {
	PasteClient,
	CreateOptions,
	GetPastesOptions,
	ParsedPaste,
	GetRawPasteOptions,
	DeletePasteOptions,
} from 'pastebin-api'
import PQueue from 'p-queue'

export class PasteBinAPI extends InstanceBase<ModuleConfig, ModuleSecrets> {
	config!: ModuleConfig // Setup in init()
	secrets!: ModuleSecrets
	private queue = new PQueue({ concurrency: 2 })
	private client!: PasteClient
	private userKey: string = ''
	public pastes: Map<string, ParsedPaste> = new Map<string, ParsedPaste>()
	public pasteURIs: Map<string, string> = new Map<string, string>()

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		process.title = this.label
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.configUpdated(config, secrets).catch(() => {})
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', `Destroy Module: ${this.label} ID: ${this.id} Process ID: ${process.pid}`)
		this.queue.clear()
	}

	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		process.title = this.label
		this.queue.clear()
		if (secrets.devKey) {
			this.client = new PasteClient({ apiKey: secrets.devKey, domain: config.domain })
			await this.login(config, secrets)
			await this.getPastes({ limit: 1000, userKey: this.apiUserKey })
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	public get apiUserKey(): string {
		return this.userKey
	}

	private async login(config: ModuleConfig, secrets: ModuleSecrets): Promise<string | undefined> {
		return this.queue.add(async () => {
			try {
				this.userKey = await this.client.login({ name: config.user, password: secrets.password })
				this.updateStatus(InstanceStatus.Ok, `Logged In`)
				return this.userKey
			} catch (error) {
				this.log('warn', `Login Failed: ${typeof error == 'string' ? error : JSON.stringify(error)}`)
				this.updateStatus(InstanceStatus.AuthenticationFailure)
				return undefined
			}
		})
	}

	public async deletePaste(options: DeletePasteOptions): Promise<boolean | undefined> {
		return this.queue.add(async () => {
			try {
				const deleted = await this.client.deletePasteByKey(options)
				await this.getPastes({ limit: 1000, userKey: this.apiUserKey })
				return deleted
			} catch (error) {
				this.log('warn', `Delete Paste Failed: ${typeof error == 'string' ? error : JSON.stringify(error)}`)

				return undefined
			}
		})
	}

	public async createPaste(options: CreateOptions): Promise<string | undefined> {
		return this.queue.add(async () => {
			try {
				const createdURL = await this.client.createPaste(options)
				this.pasteURIs.set(options.name ?? 'New Paste', createdURL)
				return createdURL
			} catch (error) {
				this.log('warn', `Create Paste Failed: ${typeof error == 'string' ? error : JSON.stringify(error)}`)

				return undefined
			}
		})
	}

	public async getPastes(options: GetPastesOptions): Promise<ParsedPaste[] | undefined> {
		return this.queue.add(async () => {
			try {
				const pastes = await this.client.getPastesByUser(options)
				this.pastes.clear()
				pastes.forEach((paste) => {
					this.pastes.set(paste.paste_key, paste)
				})
				this.updateActions()
				this.updateFeedbacks()
				this.updateVariableDefinitions()
				return pastes
			} catch (error) {
				this.log('warn', `Get Pastes Failed: ${typeof error == 'string' ? error : JSON.stringify(error)}`)

				return undefined
			}
		})
	}

	public async getRawPaste(options: GetRawPasteOptions): Promise<string | undefined> {
		return this.queue.add(async () => {
			try {
				const rawPaste = await this.client.getRawPasteByKey(options)
				return rawPaste
			} catch (error) {
				this.log('warn', `Get Raw Paste Failed: ${typeof error == 'string' ? error : JSON.stringify(error)}`)

				return undefined
			}
		})
	}

	// Return config fields for web config
	public getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private updateActions(): void {
		UpdateActions(this)
	}

	private updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	private updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(PasteBinAPI, UpgradeScripts)
