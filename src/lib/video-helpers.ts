/**
 * Video helper utilities for YouTube and Vimeo
 */

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
	const patterns = [
		/youtube\.com\/embed\/([^?&"'>]+)/,
		/youtube\.com\/watch\?v=([^&"'>]+)/,
		/youtu\.be\/([^?&"'>]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

/**
 * Extract Vimeo video ID from various URL formats
 */
export function extractVimeoId(url: string): string | null {
	const patterns = [
		/vimeo\.com\/video\/(\d+)/,
		/vimeo\.com\/(\d+)/,
		/player\.vimeo\.com\/video\/(\d+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

/**
 * Get YouTube thumbnail URL from video ID
 * Uses maxresdefault with fallback to hqdefault
 */
export function getYouTubeThumbnail(videoId: string): string {
	return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Get YouTube thumbnail fallback (for older videos without HD thumbnail)
 */
export function getYouTubeThumbnailFallback(videoId: string): string {
	return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Get Vimeo thumbnail URL - requires video ID
 * Note: Vimeo thumbnails require API access, so we'll use a placeholder approach
 * The actual thumbnail will be fetched client-side or we use a generic placeholder
 */
export function getVimeoThumbnailUrl(videoId: string): string {
	// Vimeo API endpoint for thumbnail (accessed client-side)
	return `https://vimeo.com/api/v2/video/${videoId}.json`;
}

/**
 * Generate YouTube embed URL with autoplay
 */
export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = true): string {
	const params = new URLSearchParams({
		autoplay: autoplay ? '1' : '0',
		rel: '0',
		modestbranding: '1',
	});
	return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Generate Vimeo embed URL with autoplay
 */
export function getVimeoEmbedUrl(videoId: string, hash?: string, autoplay: boolean = true): string {
	let url = `https://player.vimeo.com/video/${videoId}`;
	const params = new URLSearchParams({
		autoplay: autoplay ? '1' : '0',
		title: '0',
		byline: '0',
		portrait: '0',
	});
	if (hash) {
		params.set('h', hash);
	}
	return `${url}?${params.toString()}`;
}

/**
 * Extract Vimeo hash from URL if present (for private videos)
 */
export function extractVimeoHash(url: string): string | null {
	const match = url.match(/[?&]h=([a-zA-Z0-9]+)/);
	return match ? match[1] : null;
}

/**
 * Get thumbnail URL based on video type
 */
export function getVideoThumbnail(videoUrl: string, videoType: 'youtube' | 'vimeo'): string | null {
	if (videoType === 'youtube') {
		const videoId = extractYouTubeId(videoUrl);
		return videoId ? getYouTubeThumbnail(videoId) : null;
	} else if (videoType === 'vimeo') {
		const videoId = extractVimeoId(videoUrl);
		return videoId ? getVimeoThumbnailUrl(videoId) : null;
	}
	return null;
}

/**
 * Get embed URL based on video type
 */
export function getEmbedUrl(videoUrl: string, videoType: 'youtube' | 'vimeo', autoplay: boolean = true): string | null {
	if (videoType === 'youtube') {
		const videoId = extractYouTubeId(videoUrl);
		return videoId ? getYouTubeEmbedUrl(videoId, autoplay) : null;
	} else if (videoType === 'vimeo') {
		const videoId = extractVimeoId(videoUrl);
		const hash = extractVimeoHash(videoUrl);
		return videoId ? getVimeoEmbedUrl(videoId, hash || undefined, autoplay) : null;
	}
	return null;
}
