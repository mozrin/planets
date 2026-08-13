import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const sourceDirectories = ["server", "website"];
const excludedDirectories = new Set(["dist", "node_modules", "public"]);
const violations: string[] = [];

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return excludedDirectories.has(entry.name) ? [] : walk(path);
    return [path];
  });
}

for (const directory of sourceDirectories) {
  for (const path of walk(directory)) {
    if (/\.(js|jsx)$/.test(path)) violations.push(`${relative(".", path)}: JavaScript and JSX source files are not permitted.`);
  }
}

const stylesPath = "website/src/styles.css";
const styles = readFileSync(stylesPath, "utf8").trim();
if (styles !== '@import "tailwindcss";') violations.push(`${stylesPath}: must contain only the Tailwind CSS import.`);

for (const directory of ["server/node_modules", "website/node_modules"]) {
  if (existsSync(directory)) violations.push(`${directory}: nested workspace node_modules directory is not permitted.`);
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Repository conventions verified.");
}
