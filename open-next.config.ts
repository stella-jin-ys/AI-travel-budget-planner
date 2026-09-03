import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sites packages the generated worker with its OpenNext support files.
// The deployment archive keeps only the compiled server payload, not its source links.
export default defineCloudflareConfig();
