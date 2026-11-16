/**
 * Savanna Access Kit - Unified Web Components Bundle (Track 2)
 *
 * Provides drop-in custom elements:
 * - <savanna-player>: Accessible video player (captions, keyboard, transcript, audio description, sign window)
 * - <savanna-sign-window>: Floating/resizable Ethiopian Sign Language (ESL) interpreter window
 * - <savanna-audio-description>: Synchronized audio description (recorded + text-cue modes)
 * - <savanna-offline>: Low-bandwidth offline pack downloader & service worker manager
 * - <savanna-job-card>: Accessible job card with audio summary & 200%/400% zoom reflow
 * - <savanna-credential>: Cryptographic verifiable certificate badge (Open Badges 3.0)
 */

import "./player/savanna-player.js";
import "./sign-window/sign-window.js";
import "./audio-description/audio-description.js";
import "./offline/offline.js";
import "./job-card/job-card.js";
import "./credential/credential.js";
import "./access-label/access-label.js";
import "./profiles/profiles.js";
import "./share/share-button.js";

export { SavannaPlayer } from "./player/savanna-player.js";
export { SavannaSignWindow } from "./sign-window/sign-window.js";
export { SavannaAudioDescription } from "./audio-description/audio-description.js";
export { SavannaOffline } from "./offline/offline.js";
export { SavannaJobCard } from "./job-card/job-card.js";
export { SavannaCredential } from "./credential/credential.js";
export { SavannaAccessLabel } from "./access-label/access-label.js";
export { SavannaAccessProfiles } from "./profiles/profiles.js";
export { SavannaShareButton } from "./share/share-button.js";
