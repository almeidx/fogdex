import { pullData, pushData } from "./r2.ts";

const actions = { pull: pullData, push: pushData };
const action = process.argv[2];

if (action !== "pull" && action !== "push") {
	console.error("Usage: pnpm run data:pull | pnpm run data:push");
	process.exit(1);
}

await actions[action]();
