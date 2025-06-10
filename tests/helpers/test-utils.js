import fs from 'fs';
import path from 'path';

export function getPostContent(filename) {
  const filePath = path.join(process.cwd(), 'src/content/posts', filename);
  return fs.readFileSync(filePath, 'utf-8');
}

export function getAllMarkdownFiles(directory) {
  const fullPath = path.join(process.cwd(), directory);
  const files = fs.readdirSync(fullPath);
  return files.filter(file => file.endsWith('.md'));
}

export function validateDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

export function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      full: match[0]
    });
  }
  
  return links;
}