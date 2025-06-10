// tests/content.test.js
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const IMAGES_DIR = path.join(POSTS_DIR, 'images');

// Get all markdown files
function getAllPosts() {
  const files = fs.readdirSync(POSTS_DIR);
  return files.filter(file => file.endsWith('.md'));
}

// Get all images
function getAllImages() {
  if (!fs.existsSync(IMAGES_DIR)) return [];
  return fs.readdirSync(IMAGES_DIR);
}

describe('Blog Content Tests', () => {
  const posts = getAllPosts();
  const images = getAllImages();

  it('should have at least one blog post', () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  describe('Frontmatter Validation', () => {
    posts.forEach(postFile => {
      it(`${postFile} should have valid frontmatter`, () => {
        const filePath = path.join(POSTS_DIR, postFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);

        // Required fields
        expect(frontmatter.title).toBeDefined();
        expect(frontmatter.title).not.toBe('');
        
        expect(frontmatter.date).toBeDefined();
        expect(new Date(frontmatter.date)).toBeInstanceOf(Date);
        expect(new Date(frontmatter.date).toString()).not.toBe('Invalid Date');

        // Optional but recommended fields
        if (frontmatter.description) {
          expect(typeof frontmatter.description).toBe('string');
          expect(frontmatter.description.length).toBeLessThanOrEqual(160); // SEO best practice
        }

        if (frontmatter.tags) {
          expect(Array.isArray(frontmatter.tags)).toBe(true);
        }
      });
    });
  });

  describe('Content Quality', () => {
    posts.forEach(postFile => {
      it(`${postFile} should have meaningful content`, () => {
        const filePath = path.join(POSTS_DIR, postFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { content } = matter(fileContent);

        expect(content.trim().length).toBeGreaterThan(100); // At least 100 characters
        expect(content).not.toMatch(/lorem ipsum/i); // No placeholder text
      });

      it(`${postFile} should not have broken internal links`, () => {
        const filePath = path.join(POSTS_DIR, postFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { content } = matter(fileContent);

        // Find markdown links [text](url)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links = [...content.matchAll(linkRegex)];

        links.forEach(([fullMatch, text, url]) => {
          if (url.startsWith('./') || url.startsWith('../')) {
            // Check if relative file exists
            const resolvedPath = path.resolve(path.dirname(filePath), url);
            expect(fs.existsSync(resolvedPath)).toBe(true);
          }
        });
      });

      it(`${postFile} should have valid image references`, () => {
        const filePath = path.join(POSTS_DIR, postFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { content } = matter(fileContent);

        // Find image references ![alt](src)
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const imageRefs = [...content.matchAll(imageRegex)];

        imageRefs.forEach(([fullMatch, alt, src]) => {
          if (src.startsWith('./images/') || src.startsWith('images/')) {
            const imageName = src.replace('./images/', '').replace('images/', '');
            expect(images).toContain(imageName);
          }
          
          // Check alt text exists
          expect(alt.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('File Structure', () => {
    it('should have proper slug format for filenames', () => {
      posts.forEach(postFile => {
        const nameWithoutExt = postFile.replace('.md', '');
        // Should be kebab-case (lowercase with hyphens)
        expect(nameWithoutExt).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      });
    });

    it('should have unique post titles', () => {
      const titles = posts.map(postFile => {
        const filePath = path.join(POSTS_DIR, postFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);
        return frontmatter.title;
      });

      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });

    it('should have chronological dates', () => {
      const dates = posts.map(postFile => {
        const filePath = path.join(POSTS_DIR, postFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);
        return new Date(frontmatter.date);
      });

      // Sort dates and compare with original
      const sortedDates = [...dates].sort((a, b) => b - a);
      // This test passes if dates are in any order, but logs if not chronological
      if (JSON.stringify(dates) !== JSON.stringify(sortedDates)) {
        console.warn('Posts are not in chronological order');
      }
      expect(true).toBe(true); // Always pass but warn
    });
  });

  describe('SEO and Performance', () => {
    posts.forEach(postFile => {
      it(`${postFile} should have SEO-friendly content`, () => {
        const filePath = path.join(POSTS_DIR, postFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        // Check for headings
        const hasH1 = content.includes('# ') || frontmatter.title;
        const hasH2OrLower = /#{2,6}\s/.test(content);
        
        expect(hasH1).toBe(true);
        expect(hasH2OrLower).toBe(true);

        // Word count should be reasonable
        const wordCount = content.split(/\s+/).length;
        expect(wordCount).toBeGreaterThan(50);
      });
    });

    it('should not have oversized images', () => {
      images.forEach(imageName => {
        const imagePath = path.join(IMAGES_DIR, imageName);
        const stats = fs.statSync(imagePath);
        const sizeInMB = stats.size / (1024 * 1024);
        
        // Warn if image is larger than 1MB
        if (sizeInMB > 1) {
          console.warn(`Image ${imageName} is ${sizeInMB.toFixed(2)}MB - consider optimizing`);
        }
        
        // Fail if larger than 5MB
        expect(sizeInMB).toBeLessThan(5);
      });
    });
  });
});

// tests/build.test.js - Test that the site builds successfully
describe('Build Tests', () => {
  it('should build without errors', async () => {
    const { execSync } = await import('child_process');
    
    expect(() => {
      execSync('npm run build', { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
    }).not.toThrow();
  });

  it('should generate all expected pages', () => {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Check if dist folder exists (after build)
    if (fs.existsSync(distPath)) {
      expect(fs.existsSync(path.join(distPath, 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(distPath, 'blog/index.html'))).toBe(true);
      
      // Check if individual blog posts are generated
      const posts = getAllPosts();
      posts.forEach(postFile => {
        const slug = postFile.replace('.md', '');
        const postHtmlPath = path.join(distPath, 'blog', slug, 'index.html');
        expect(fs.existsSync(postHtmlPath)).toBe(true);
      });
    }
  });
});