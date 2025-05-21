import { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { PasteBinAPI } from './main.js'

export function UpdateFeedbacks(self: PasteBinAPI): void {
	const feedbackDefiitions: CompanionFeedbackDefinitions = {}
	self.setFeedbackDefinitions(feedbackDefiitions)
}
