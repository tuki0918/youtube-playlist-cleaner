import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
const { version } = packageJson

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name:
    env.mode === 'staging'
      ? '[INTERNAL] YouTube Playlist Cleaner'
      : 'YouTube Playlist Cleaner',
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  // https://developer.chrome.com/docs/extensions/mv3/manifest/
  description: "Cleaning up the playlist on YouTube",
  permissions: ["activeTab"],
  action: {
    default_popup: "src/popup/index.html"
  },
  content_scripts: [
    {
      matches: [
        "https://*.youtube.com/playlist*",
        "https://youtube.com/playlist*"
      ],
      js: ["src/content/index.ts"]
    }
  ],
  background: {
    service_worker: "src/background/index.ts"
  }
}))
