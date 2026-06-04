// dependency_graph.ts
import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '../../'); // Adjust to project root

// Recursively collect source files (ts,tsx, js, jsx)
function collectFiles(dir: string, extPattern: RegExp, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and build output directories
      if (['node_modules', 'dist', 'build'].includes(entry.name)) continue;
      collectFiles(fullPath, extPattern, files);
    } else if (extPattern.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const srcDir = path.join(projectRoot, 'src');
const sourceFiles = collectFiles(srcDir, /\.(ts|tsx|js|jsx)$/i);

// Build adjacency list: file -> imported files
const graph: Record<string, Set<string>> = {};
const importRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?["']([^"']+)['"]/g;

function resolveImport(importPath: string, importer: string): string | null {
  // Resolve relative imports
  if (importPath.startsWith('.')) {
    const resolved = path.resolve(path.dirname(importer), importPath);
    // Try adding extensions
    const candidates = [resolved, resolved + '.ts', resolved + '.tsx', resolved + '.js', resolved + '.jsx', path.join(resolved, 'index.ts'), path.join(resolved, 'index.tsx')];
    for (const c of candidates) {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) {
        return c;
      }
    }
    return null;
  }
  // For absolute/alias imports ignore (external libs)
  return null;
}

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const imports = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const importedPath = match[1];
    const resolved = resolveImport(importedPath, file);
    if (resolved) imports.add(resolved);
  }
  graph[file] = imports;
}

// Determine reachable files from entry point (main.tsx)
const entry = path.join(srcDir, 'main.tsx');
const visited = new Set<string>();
function dfs(file: string) {
  if (visited.has(file)) return;
  visited.add(file);
  const deps = graph[file];
  if (deps) {
    for (const dep of deps) dfs(dep);
  }
}
if (fs.existsSync(entry)) dfs(entry);

// Unused files = sourceFiles not in visited
const unused = sourceFiles.filter(f => !visited.has(f));

// Output results
console.log('=== Unused Files ===');
unused.forEach(f => console.log(path.relative(projectRoot, f)));

// Generate Mermaid graph (simple tree from entry)
function generateMermaid(node: string, depth = 0, visitedNodes = new Set<string>(), lines: string[] = []): string[] {
  const name = path.relative(projectRoot, node);
  const indent = '  '.repeat(depth);
  lines.push(`${indent}${name}`);
  if (visitedNodes.has(node)) return lines; // prevent cycles
  visitedNodes.add(node);
  const children = Array.from(graph[node] || []);
  for (const child of children) {
    generateMermaid(child, depth + 1, visitedNodes, lines);
  }
  return lines;
}

if (fs.existsSync(entry)) {
  const mermaidLines = ['graph TD'];
  const visitedMermaid = new Set<string>();
  function walk(node: string) {
    const children = Array.from(graph[node] || []);
    for (const child of children) {
      const from = path.relative(projectRoot, node).replace(/[\/]/g, '_');
      const to = path.relative(projectRoot, child).replace(/[\/]/g, '_');
      mermaidLines.push(`  ${from} --> ${to}`);
      if (!visitedMermaid.has(child)) {
        visitedMermaid.add(child);
        walk(child);
      }
    }
  }
  walk(entry);
  console.log('\n=== Mermaid Diagram ===');
  console.log(mermaidLines.join('\n'));
}
