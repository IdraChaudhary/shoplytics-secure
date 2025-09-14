import { Page } from '@playwright/test';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export interface VisualTestConfig {
  threshold: number; // 0-1, where 0 is identical
  includeAA: boolean; // Include anti-aliasing in comparison
  alpha: number; // Blending factor of original image
  aaColor: [number, number, number]; // Anti-aliasing color
  diffColor: [number, number, number]; // Color of different pixels
  diffMask: boolean; // Draw the diff over original image
}

export interface VisualTestCase {
  id: string;
  name: string;
  component: string;
  selector: string;
  viewport: { width: number; height: number };
  config: VisualTestConfig;
  states: VisualTestState[];
  tags: string[];
  description: string;
  createdAt: Date;
  lastRun?: Date;
}

export interface VisualTestState {
  name: string;
  setup: () => Promise<void> | void;
  interactions?: Array<{
    action: string;
    target: string;
    data?: any;
  }>;
  waitFor?: {
    selector?: string;
    timeout?: number;
    state?: 'visible' | 'hidden' | 'stable';
  };
}

export interface VisualTestResult {
  testId: string;
  state: string;
  passed: boolean;
  diffPixels: number;
  totalPixels: number;
  diffPercentage: number;
  baselinePath: string;
  currentPath: string;
  diffPath?: string;
  error?: string;
  timestamp: Date;
  executionTime: number;
}

export interface VisualTestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    new: number;
    executionTime: number;
  };
  results: VisualTestResult[];
  timestamp: Date;
  environment: {
    browser: string;
    viewport: string;
    os: string;
  };
}

export class VisualRegressionTester {
  private baselinePath: string;
  private currentPath: string;
  private diffPath: string;
  private defaultConfig: VisualTestConfig;

  constructor(options: {
    baselinePath?: string;
    currentPath?: string;
    diffPath?: string;
  } = {}) {
    this.baselinePath = options.baselinePath || path.join(process.cwd(), 'tests/visual/baseline');
    this.currentPath = options.currentPath || path.join(process.cwd(), 'tests/visual/current');
    this.diffPath = options.diffPath || path.join(process.cwd(), 'tests/visual/diff');

    this.defaultConfig = {
      threshold: 0.1,
      includeAA: false,
      alpha: 0.1,
      aaColor: [255, 255, 0],
      diffColor: [255, 0, 0],
      diffMask: false
    };

    this.ensureDirectories();
  }

  /**
   * Create necessary directories for visual testing
   */
  private async ensureDirectories(): Promise<void> {
    const directories = [this.baselinePath, this.currentPath, this.diffPath];
    
    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  /**
   * Capture screenshot of a component
   */
  async captureComponent(
    page: Page,
    testCase: VisualTestCase,
    state: VisualTestState
  ): Promise<Buffer> {
    // Set viewport
    await page.setViewportSize(testCase.viewport);

    // Execute state setup
    if (state.setup) {
      await state.setup();
    }

    // Perform interactions
    if (state.interactions) {
      for (const interaction of state.interactions) {
        await this.performInteraction(page, interaction);
      }
    }

    // Wait for conditions
    if (state.waitFor) {
      await this.waitForCondition(page, state.waitFor);
    }

    // Wait for component to be stable
    await this.waitForComponentStable(page, testCase.selector);

    // Capture screenshot
    const element = await page.locator(testCase.selector).first();
    const screenshot = await element.screenshot({
      animations: 'disabled',
      caret: 'hide'
    });

    return screenshot;
  }

  /**
   * Perform interaction on the page
   */
  private async performInteraction(
    page: Page,
    interaction: { action: string; target: string; data?: any }
  ): Promise<void> {
    const { action, target, data } = interaction;

    switch (action) {
      case 'click':
        await page.click(target);
        break;
      case 'hover':
        await page.hover(target);
        break;
      case 'type':
        await page.fill(target, data?.text || '');
        break;
      case 'select':
        await page.selectOption(target, data?.value || '');
        break;
      case 'scroll':
        await page.locator(target).scrollIntoViewIfNeeded();
        break;
      case 'wait':
        await page.waitForTimeout(data?.timeout || 1000);
        break;
      default:
        console.warn(`Unknown interaction: ${action}`);
    }

    // Wait a bit after interaction
    await page.waitForTimeout(100);
  }

  /**
   * Wait for specified condition
   */
  private async waitForCondition(
    page: Page,
    waitFor: {
      selector?: string;
      timeout?: number;
      state?: 'visible' | 'hidden' | 'stable';
    }
  ): Promise<void> {
    const { selector, timeout = 5000, state = 'visible' } = waitFor;

    if (selector) {
      switch (state) {
        case 'visible':
          await page.waitForSelector(selector, { state: 'visible', timeout });
          break;
        case 'hidden':
          await page.waitForSelector(selector, { state: 'hidden', timeout });
          break;
        case 'stable':
          await page.waitForSelector(selector, { state: 'visible', timeout });
          await this.waitForComponentStable(page, selector);
          break;
      }
    } else {
      await page.waitForTimeout(timeout);
    }
  }

  /**
   * Wait for component to be visually stable (no animations)
   */
  private async waitForComponentStable(page: Page, selector: string): Promise<void> {
    let previousHash = '';
    let stableCount = 0;
    const maxAttempts = 10;
    const stabilityThreshold = 3;

    for (let i = 0; i < maxAttempts; i++) {
      await page.waitForTimeout(100);
      
      try {
        const element = await page.locator(selector).first();
        const screenshot = await element.screenshot({ animations: 'disabled' });
        const currentHash = createHash('md5').update(screenshot).digest('hex');

        if (currentHash === previousHash) {
          stableCount++;
          if (stableCount >= stabilityThreshold) {
            return; // Component is stable
          }
        } else {
          stableCount = 0;
          previousHash = currentHash;
        }
      } catch (error) {
        console.warn(`Error checking component stability:`, error);
        break;
      }
    }
  }

  /**
   * Compare two images and return difference metrics
   */
  async compareImages(
    baselineBuffer: Buffer,
    currentBuffer: Buffer,
    config: VisualTestConfig = this.defaultConfig
  ): Promise<{
    diffPixels: number;
    totalPixels: number;
    diffPercentage: number;
    diffBuffer?: Buffer;
  }> {
    const baselineImg = PNG.sync.read(baselineBuffer);
    const currentImg = PNG.sync.read(currentBuffer);

    const { width, height } = baselineImg;
    
    // Ensure images have the same dimensions
    if (currentImg.width !== width || currentImg.height !== height) {
      throw new Error(
        `Image dimensions don't match: baseline(${width}x${height}) vs current(${currentImg.width}x${currentImg.height})`
      );
    }

    const diffImg = new PNG({ width, height });
    const totalPixels = width * height;

    const diffPixels = pixelmatch(
      baselineImg.data,
      currentImg.data,
      diffImg.data,
      width,
      height,
      {
        threshold: config.threshold,
        includeAA: config.includeAA,
        alpha: config.alpha,
        aaColor: config.aaColor,
        diffColor: config.diffColor,
        diffMask: config.diffMask
      }
    );

    const diffPercentage = (diffPixels / totalPixels) * 100;
    const diffBuffer = PNG.sync.write(diffImg);

    return {
      diffPixels,
      totalPixels,
      diffPercentage,
      diffBuffer
    };
  }

  /**
   * Run visual tests for a test case
   */
  async runVisualTest(
    page: Page,
    testCase: VisualTestCase
  ): Promise<VisualTestResult[]> {
    const results: VisualTestResult[] = [];

    for (const state of testCase.states) {
      const startTime = Date.now();
      const testId = `${testCase.id}-${state.name}`;
      
      try {
        // Capture current screenshot
        const currentBuffer = await this.captureComponent(page, testCase, state);
        
        // Save current screenshot
        const currentFileName = `${testId}.png`;
        const currentFilePath = path.join(this.currentPath, currentFileName);
        await fs.writeFile(currentFilePath, currentBuffer);

        // Load baseline screenshot
        const baselineFilePath = path.join(this.baselinePath, currentFileName);
        let baselineBuffer: Buffer;
        
        try {
          baselineBuffer = await fs.readFile(baselineFilePath);
        } catch (error) {
          // No baseline exists, save current as baseline
          await fs.writeFile(baselineFilePath, currentBuffer);
          
          results.push({
            testId,
            state: state.name,
            passed: true,
            diffPixels: 0,
            totalPixels: 0,
            diffPercentage: 0,
            baselinePath: baselineFilePath,
            currentPath: currentFilePath,
            timestamp: new Date(),
            executionTime: Date.now() - startTime
          });
          
          continue;
        }

        // Compare images
        const comparison = await this.compareImages(
          baselineBuffer,
          currentBuffer,
          testCase.config
        );

        const passed = comparison.diffPercentage <= (testCase.config.threshold * 100);

        // Save diff image if there are differences
        let diffPath: string | undefined;
        if (!passed && comparison.diffBuffer) {
          const diffFileName = `${testId}-diff.png`;
          diffPath = path.join(this.diffPath, diffFileName);
          await fs.writeFile(diffPath, comparison.diffBuffer);
        }

        results.push({
          testId,
          state: state.name,
          passed,
          diffPixels: comparison.diffPixels,
          totalPixels: comparison.totalPixels,
          diffPercentage: comparison.diffPercentage,
          baselinePath: baselineFilePath,
          currentPath: currentFilePath,
          diffPath,
          timestamp: new Date(),
          executionTime: Date.now() - startTime
        });

      } catch (error) {
        results.push({
          testId,
          state: state.name,
          passed: false,
          diffPixels: 0,
          totalPixels: 0,
          diffPercentage: 0,
          baselinePath: '',
          currentPath: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          executionTime: Date.now() - startTime
        });
      }
    }

    // Update last run timestamp
    testCase.lastRun = new Date();

    return results;
  }

  /**
   * Run multiple visual test cases
   */
  async runVisualTests(
    page: Page,
    testCases: VisualTestCase[]
  ): Promise<VisualTestReport> {
    const startTime = Date.now();
    const allResults: VisualTestResult[] = [];

    for (const testCase of testCases) {
      const results = await this.runVisualTest(page, testCase);
      allResults.push(...results);
    }

    const summary = {
      total: allResults.length,
      passed: allResults.filter(r => r.passed).length,
      failed: allResults.filter(r => !r.passed && r.error).length,
      new: allResults.filter(r => r.passed && r.diffPixels === 0 && r.totalPixels === 0).length,
      executionTime: Date.now() - startTime
    };

    const browserInfo = await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    }));

    return {
      summary,
      results: allResults,
      timestamp: new Date(),
      environment: {
        browser: browserInfo.userAgent,
        viewport: browserInfo.viewport,
        os: process.platform
      }
    };
  }

  /**
   * Update baseline images with current images
   */
  async updateBaseline(testIds?: string[]): Promise<void> {
    const currentFiles = await fs.readdir(this.currentPath);
    
    for (const file of currentFiles) {
      if (!file.endsWith('.png')) continue;
      
      const testId = file.replace('.png', '');
      
      // If specific test IDs provided, only update those
      if (testIds && !testIds.includes(testId)) continue;
      
      const currentFilePath = path.join(this.currentPath, file);
      const baselineFilePath = path.join(this.baselinePath, file);
      
      try {
        const currentBuffer = await fs.readFile(currentFilePath);
        await fs.writeFile(baselineFilePath, currentBuffer);
        console.log(`Updated baseline for: ${testId}`);
      } catch (error) {
        console.error(`Failed to update baseline for ${testId}:`, error);
      }
    }
  }

  /**
   * Clean up old test artifacts
   */
  async cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const directories = [this.currentPath, this.diffPath];
    const cutoffTime = Date.now() - maxAge;

    for (const dir of directories) {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            console.log(`Cleaned up old file: ${filePath}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to cleanup directory ${dir}:`, error);
      }
    }
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport(report: VisualTestReport): Promise<string> {
    const reportHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Visual Regression Test Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 8px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .new { color: #17a2b8; }
        .results { background: white; border-radius: 8px; border: 1px solid #e9ecef; overflow: hidden; }
        .result { padding: 20px; border-bottom: 1px solid #e9ecef; display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center; }
        .result.failed { background: #fff5f5; }
        .result-info h3 { margin: 0 0 8px 0; }
        .result-meta { color: #6c757d; font-size: 0.9em; }
        .diff-images { display: flex; gap: 10px; }
        .diff-images img { max-width: 150px; max-height: 100px; border: 1px solid #ddd; border-radius: 4px; }
        .no-results { text-align: center; padding: 40px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Visual Regression Test Report</h1>
        <p>Generated: ${report.timestamp.toLocaleString()}</p>
        <p>Environment: ${report.environment.browser} | ${report.environment.viewport} | ${report.environment.os}</p>
      </div>

      <div class="summary">
        <div class="metric">
          <div class="metric-value">${report.summary.total}</div>
          <div>Total Tests</div>
        </div>
        <div class="metric">
          <div class="metric-value passed">${report.summary.passed}</div>
          <div>Passed</div>
        </div>
        <div class="metric">
          <div class="metric-value failed">${report.summary.failed}</div>
          <div>Failed</div>
        </div>
        <div class="metric">
          <div class="metric-value new">${report.summary.new}</div>
          <div>New</div>
        </div>
        <div class="metric">
          <div class="metric-value">${Math.round(report.summary.executionTime / 1000)}s</div>
          <div>Execution Time</div>
        </div>
      </div>

      <div class="results">
        ${report.results.length === 0 
          ? '<div class="no-results">No test results found</div>'
          : report.results.map(result => `
            <div class="result ${result.passed ? 'passed' : 'failed'}">
              <div class="result-info">
                <h3>${result.testId}</h3>
                <div class="result-meta">
                  State: ${result.state} | 
                  Diff: ${result.diffPercentage.toFixed(2)}% | 
                  Time: ${result.executionTime}ms
                  ${result.error ? ` | Error: ${result.error}` : ''}
                </div>
              </div>
              ${result.diffPath ? `
                <div class="diff-images">
                  <img src="file://${result.baselinePath}" title="Baseline" alt="Baseline">
                  <img src="file://${result.currentPath}" title="Current" alt="Current">
                  <img src="file://${result.diffPath}" title="Diff" alt="Diff">
                </div>
              ` : ''}
            </div>
          `).join('')
        }
      </div>
    </body>
    </html>
    `;

    const reportPath = path.join(process.cwd(), 'visual-test-report.html');
    await fs.writeFile(reportPath, reportHtml);
    
    return reportPath;
  }
}

// Export instance
export const visualRegressionTester = new VisualRegressionTester();
