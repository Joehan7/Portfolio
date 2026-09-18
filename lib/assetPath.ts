// Next prefixes route links itself; public-file URLs need the same build-time prefix.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const assetPath = (path: string) => basePath + path;
