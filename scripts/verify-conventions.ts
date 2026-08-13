import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const sourceDirectories = ["server", "website"];
const excludedDirectories = new Set(["dist", "node_modules", "public"]);
const violations: string[] = [];

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return excludedDirectories.has(entry.name) ? [] : walk(path);
    }
    return [path];
  });
}

const sourceFiles = sourceDirectories.flatMap(walk);

for (const path of sourceFiles) {
  if (/\.(js|jsx)$/.test(path)) {
    violations.push(`${relative(".", path)}: JavaScript and JSX source files are not permitted.`);
  }
}

const stylesPath = "website/src/styles.css";
const styles = readFileSync(stylesPath, "utf8").trim();
if (styles !== '@import "tailwindcss";') {
  violations.push(`${stylesPath}: must contain only the Tailwind CSS import.`);
}

for (const path of sourceFiles.filter((file) => file.endsWith(".css") && file !== stylesPath)) {
  violations.push(`${relative(".", path)}: authored CSS files are not permitted; use Tailwind CSS 4 utilities.`);
}

for (const path of sourceFiles.filter((file) => file.endsWith(".tsx"))) {
  const source = readFileSync(path, "utf8");
  if (/\bstyle\s*=/.test(source)) {
    violations.push(`${relative(".", path)}: inline style props are not permitted; use Tailwind CSS 4 utilities.`);
  }
  if (/\bstyled\s*(?:\.|\()/.test(source)) {
    violations.push(`${relative(".", path)}: styled-component patterns are not permitted; use Tailwind CSS 4 utilities.`);
  }
}

const websitePackage = JSON.parse(readFileSync("website/package.json", "utf8")) as { dependencies?: Record<string, string> };
const usesTailwindFour = websitePackage.dependencies?.tailwindcss?.startsWith("^4.") && websitePackage.dependencies?.["@tailwindcss/vite"]?.startsWith("^4.");
if (!usesTailwindFour) {
  violations.push("website/package.json: Tailwind CSS and its Vite integration must use version 4.");
}

for (const directory of ["server/node_modules", "website/node_modules"]) {
  if (existsSync(directory)) {
    violations.push(`${directory}: nested workspace node_modules directory is not permitted.`);
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Repository conventions verified.");
}
