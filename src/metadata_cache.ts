import {TFile} from "obsidian";
import {isUri} from "valid-url";

export function onMetadataCacheResolve(file: TFile) {
	const cache = app.metadataCache.getFileCache(file);
	if (!cache) {
		return;
	}

	const frontmatter = cache.frontmatter;
	if (!frontmatter) {
		return;
	}

	addFrontmatterLinksToCache(file, frontmatter);
}

function addFrontmatterLinksToCache(file: TFile, frontmatter: any) {
	if (!frontmatter) {
		return;
	}
	for (let key of Object.keys(frontmatter)) {
		const value = frontmatter[key];
		if (typeof (value) === "string") {
			const pattern = /\[\[(.+?\]?)(?:\|(.+?))?\]\]|\[(.+?)\]\((.+?)\)/gm;
			let matches = [...value.matchAll(pattern)];
			matches.forEach((match) => {
				if (!match) {
					return;
				}
				let href = (match[4] === undefined ? match[1] : match[4]);

				if (isUri(href)) {
					return;
				}

				let f = app.metadataCache.getFirstLinkpathDest(href, "");
				let links: Record<string, Record<string, number>>;
				if (f instanceof TFile) {
					href = f.path;
					links = app.metadataCache.resolvedLinks;
				} else {
					links = app.metadataCache.unresolvedLinks;
				}

				if (links[file.path][href]) {
					links[file.path][href] += 1;
				} else {
					links[file.path][href] = 1;
				}
			});
		} else if (typeof (value) === "object") {
			addFrontmatterLinksToCache(file, value);
		}
	}
}
