// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default {
	...defineCloudflareConfig({
		incrementalCache: r2IncrementalCache,
		queue: doQueue,
		tagCache: d1NextTagCache,
	}),
	// `npm run build` is the OpenNext build itself, so call Next directly here
	// to avoid recursing back into this script.
	buildCommand: "next build",
};
