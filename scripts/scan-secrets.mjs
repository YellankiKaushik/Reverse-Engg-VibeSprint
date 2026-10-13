import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { parseEnv } from "node:util";

const privateValues = new Set();
for (const file of [".env", ".vercel/production.env"]) {
    if (!existsSync(file)) continue;
    for (const [name, value] of Object.entries(parseEnv(readFileSync(file, "utf8")))) {
        if (
            /(?:API_KEY|SERVICE_ROLE_KEY|SECRET_KEY|ACCESS_TOKEN)$/.test(name) &&
            !name.startsWith("VITE_") &&
            value.length > 16
        )
            privateValues.add(value);
    }
}
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
const source = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
)
    .split("\0")
    .filter(Boolean);
const findings = [];
for (const file of tracked)
    if (/(^|\/)\.env(?:\.|$)/.test(file) && !file.endsWith(".env.example"))
        findings.push(`${file}: tracked environment file`);
function inspect(file) {
    const content = readFileSync(file, "utf8");
    if ([...privateValues].some((value) => content.includes(value)))
        findings.push(`${file}: private credential match`);
    if (/sb_secret_[A-Za-z0-9_-]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{32,}/.test(content))
        findings.push(`${file}: secret pattern match`);
}
for (const file of source) inspect(file);
let assets = 0;
function scanDirectory(dir) {
    if (!existsSync(dir)) return;
    for (const item of readdirSync(dir, { withFileTypes: true })) {
        const file = join(dir, item.name);
        if (item.isDirectory()) scanDirectory(file);
        else if (/\.(?:js|mjs|html|map)$/.test(item.name)) {
            inspect(file);
            assets++;
        }
    }
}
scanDirectory(".vercel/output/static");
scanDirectory(".output/public");
console.log(JSON.stringify({ sourceFiles: source.length, clientAssets: assets, findings }));
if (findings.length) process.exitCode = 1;
