import { cdnUrl } from "./cdn.ts";

/** Square 256px asset from the public CDN; `priority` images load eagerly. */
export function CdnImage({
	className,
	path,
	priority = false,
}: {
	className: string;
	path: string;
	priority?: boolean;
}) {
	return (
		<img
			alt=""
			className={className}
			fetchPriority={priority ? "high" : "auto"}
			height={256}
			loading={priority ? "eager" : "lazy"}
			src={cdnUrl(path)}
			width={256}
		/>
	);
}
