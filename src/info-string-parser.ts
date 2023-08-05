export function parseInfoString(infoString: string): Record<string, string> {
  const result: Record<string, string> = {};
  infoString
    .split(" ") // Split on spaces
    .filter((s, i) => i > 0) // Remove the leading "mdql"
    .map((s) => s.trim()) // Remove leading and trailing spaces
    .forEach((s) => {
      const [key, value] = s.split("=");
      result[key] = value;
    });
  return result;
}

function isPropertyIncluded(
  props: Record<string, string>,
  name: string
): boolean {
  return Object.keys(props)
    .map((k) => k.toLowerCase())
    .includes(name.toLowerCase());
}

export function isInjectModeActive(props: Record<string, string>): boolean {
  return isPropertyIncluded(props, "inject");
}

export function isHideQueryActive(props: Record<string, string>): boolean {
  return isPropertyIncluded(props, "hidequery");
}
