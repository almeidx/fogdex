import type { APIRoute } from "astro";
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<defs>
		<radialGradient id="g1" cx="20%" cy="50%" r="60%">
			<stop offset="0%" stop-color="#c41e3a" stop-opacity="0.18"/>
			<stop offset="100%" stop-color="#c41e3a" stop-opacity="0"/>
		</radialGradient>
		<radialGradient id="g2" cx="80%" cy="20%" r="60%">
			<stop offset="0%" stop-color="#d4a017" stop-opacity="0.12"/>
			<stop offset="100%" stop-color="#d4a017" stop-opacity="0"/>
		</radialGradient>
	</defs>
	<rect width="1200" height="630" fill="#0a0a0f"/>
	<rect width="1200" height="630" fill="url(#g1)"/>
	<rect width="1200" height="630" fill="url(#g2)"/>
	<text x="600" y="300" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="160" font-weight="800" letter-spacing="-4">
		<tspan fill="#e0e0e8">Fog</tspan><tspan fill="#c41e3a">dex</tspan>
	</text>
	<text x="600" y="380" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="32" font-weight="500" fill="#6b6b80">
		Dead by Daylight Reference
	</text>
	<text x="600" y="430" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="22" font-weight="400" fill="#6b6b80">
		Killers · Survivors · Perks
	</text>
</svg>`;

export const GET: APIRoute = async () => {
	const png = await sharp(Buffer.from(svg)).png().toBuffer();
	return new Response(new Uint8Array(png), {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
};
