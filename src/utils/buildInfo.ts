/**
 * Build information utilities
 * Provides access to version and build date injected by Vite
 */

/**
 * Get the application version from package.json
 */
export function getBuildVersion(): string {
  // eslint-disable-next-line no-undef
  return __APP_VERSION__;
}

/**
 * Get the raw build date ISO string
 */
export function getBuildDate(): string {
  // eslint-disable-next-line no-undef
  return __BUILD_DATE__;
}

/**
 * Get the formatted build date (dd-mm-yyyy)
 */
export function getFormattedBuildDate(): string {
  // eslint-disable-next-line no-undef
  const date = new Date(__BUILD_DATE__);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Get complete build information
 * Format: "Version X.Y.Z (Built: dd-mm-yyyy)"
 */
export function getBuildInfo(): string {
  return `Version ${getBuildVersion()} (Built: ${getFormattedBuildDate()})`;
}

/**
 * Get short build information
 * Format: "v X.Y.Z"
 */
export function getShortBuildInfo(): string {
  return `v ${getBuildVersion()}`;
}
