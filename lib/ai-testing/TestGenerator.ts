import OpenAI from 'openai';

// Configuration for AI testing
const AI_CONFIG = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.3,
  maxTokens: 2000,
};

export interface TestCase {
  id: string;
  title: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  steps: TestStep[];
  expectedResult: string;
  code: string;
  framework: 'jest' | 'cypress' | 'playwright' | 'vitest';
  estimatedDuration: number; // in minutes
  riskLevel: 'low' | 'medium' | 'high';
  businessValue: string;
  technicalComplexity: number; // 1-10 scale
}

export interface TestStep {
  step: number;
  action: string;
  data?: any;
  expectedOutcome: string;
}

export interface ComponentAnalysis {
  componentName: string;
  componentType: 'page' | 'component' | 'api' | 'utility';
  dependencies: string[];
  props?: any;
  methods?: string[];
  complexity: number;
  riskFactors: string[];
  businessCriticality: 'low' | 'medium' | 'high';
}

export interface TestingStrategy {
  coverage: {
    unit: number;
    integration: number;
    e2e: number;
  };
  prioritizedComponents: string[];
  testingApproach: string;
  estimatedEffort: number; // in hours
  riskMitigation: string[];
}

export class AITestGenerator {
  private openai: OpenAI;
  private testHistory: TestCase[] = [];
  private analysisCache: Map<string, ComponentAnalysis> = new Map();

  constructor() {
    if (!AI_CONFIG.openaiApiKey) {
      throw new Error('OpenAI API key is required for AI test generation');
    }
    
    this.openai = new OpenAI({
      apiKey: AI_CONFIG.openaiApiKey,
    });
  }

  /**
   * Analyze a component or code file to understand its testing requirements
   */
  async analyzeComponent(
    code: string, 
    componentName: string, 
    componentType: ComponentAnalysis['componentType']
  ): Promise<ComponentAnalysis> {
    // Check cache first
    const cacheKey = `${componentName}-${this.hashCode(code)}`;
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const prompt = `
    Analyze the following ${componentType} code for testing requirements:

    Component Name: ${componentName}
    Component Type: ${componentType}

    Code:
    \`\`\`
    ${code}
    \`\`\`

    Please provide a JSON analysis with the following structure:
    {
      "componentName": "${componentName}",
      "componentType": "${componentType}",
      "dependencies": ["array of dependencies"],
      "props": { /* props interface if React component */ },
      "methods": ["array of methods/functions"],
      "complexity": 1-10, /* complexity score */
      "riskFactors": ["array of potential risk areas"],
      "businessCriticality": "low|medium|high"
    }

    Focus on:
    1. External dependencies and integrations
    2. User interactions and state changes
    3. Data transformations and calculations
    4. Error handling requirements
    5. Performance considerations
    6. Security implications
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const analysis: ComponentAnalysis = JSON.parse(jsonMatch[0]);
      
      // Cache the analysis
      this.analysisCache.set(cacheKey, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing component:', error);
      
      // Fallback analysis
      return {
        componentName,
        componentType,
        dependencies: [],
        complexity: 5,
        riskFactors: ['Unknown - AI analysis failed'],
        businessCriticality: 'medium'
      };
    }
  }

  /**
   * Generate test cases based on component analysis
   */
  async generateTestCases(
    analysis: ComponentAnalysis,
    code: string,
    options: {
      testTypes?: TestCase['type'][];
      maxTests?: number;
      framework?: TestCase['framework'];
      includeEdgeCases?: boolean;
      includePerformanceTests?: boolean;
    } = {}
  ): Promise<TestCase[]> {
    const {
      testTypes = ['unit', 'integration'],
      maxTests = 10,
      framework = 'jest',
      includeEdgeCases = true,
      includePerformanceTests = false
    } = options;

    const prompt = `
    Generate comprehensive test cases for the following component:

    Component Analysis:
    ${JSON.stringify(analysis, null, 2)}

    Original Code:
    \`\`\`
    ${code.substring(0, 2000)} ${code.length > 2000 ? '...' : ''}
    \`\`\`

    Requirements:
    - Test Types: ${testTypes.join(', ')}
    - Framework: ${framework}
    - Maximum Tests: ${maxTests}
    - Include Edge Cases: ${includeEdgeCases}
    - Include Performance Tests: ${includePerformanceTests}

    Generate an array of test cases with the following JSON structure:
    [
      {
        "id": "unique-test-id",
        "title": "Test case title",
        "description": "Detailed description",
        "type": "unit|integration|e2e|performance|security",
        "priority": "low|medium|high|critical",
        "tags": ["array", "of", "tags"],
        "steps": [
          {
            "step": 1,
            "action": "Action to perform",
            "data": { /* test data if needed */ },
            "expectedOutcome": "Expected result"
          }
        ],
        "expectedResult": "Overall expected result",
        "code": "Generated test code",
        "framework": "${framework}",
        "estimatedDuration": 5, // minutes
        "riskLevel": "low|medium|high",
        "businessValue": "Why this test is important",
        "technicalComplexity": 5 // 1-10 scale
      }
    ]

    Focus on:
    1. Happy path scenarios
    2. Error handling and edge cases
    3. User interaction flows
    4. Data validation and transformation
    5. Integration points with external systems
    6. Performance and security considerations

    Generate actual working test code for ${framework}.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens * 2, // More tokens for test code generation
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON array response from AI');
      }

      const testCases: TestCase[] = JSON.parse(jsonMatch[0]);
      
      // Add generated tests to history
      this.testHistory.push(...testCases);
      
      return testCases;
    } catch (error) {
      console.error('Error generating test cases:', error);
      
      // Fallback test cases
      return this.generateFallbackTests(analysis, framework);
    }
  }

  /**
   * Generate testing strategy for an entire application or module
   */
  async generateTestingStrategy(
    components: ComponentAnalysis[],
    requirements: {
      targetCoverage?: number;
      timeConstraints?: number; // hours
      teamSize?: number;
      riskTolerance?: 'low' | 'medium' | 'high';
      businessPriority?: string[];
    } = {}
  ): Promise<TestingStrategy> {
    const {
      targetCoverage = 80,
      timeConstraints = 40,
      teamSize = 2,
      riskTolerance = 'medium',
      businessPriority = []
    } = requirements;

    const prompt = `
    Create a comprehensive testing strategy for the following components:

    Components:
    ${JSON.stringify(components, null, 2)}

    Requirements:
    - Target Coverage: ${targetCoverage}%
    - Time Constraints: ${timeConstraints} hours
    - Team Size: ${teamSize} developers
    - Risk Tolerance: ${riskTolerance}
    - Business Priority: ${businessPriority.join(', ')}

    Generate a JSON testing strategy:
    {
      "coverage": {
        "unit": 70, // percentage
        "integration": 20, // percentage
        "e2e": 10 // percentage
      },
      "prioritizedComponents": ["ordered array of component names by testing priority"],
      "testingApproach": "Detailed approach description",
      "estimatedEffort": 32, // total hours
      "riskMitigation": ["array of risk mitigation strategies"]
    }

    Consider:
    1. Component complexity and risk factors
    2. Business criticality
    3. Dependencies and integration points
    4. Time and resource constraints
    5. Testing pyramid best practices
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating testing strategy:', error);
      
      // Fallback strategy
      return {
        coverage: { unit: 70, integration: 20, e2e: 10 },
        prioritizedComponents: components
          .sort((a, b) => b.complexity - a.complexity)
          .map(c => c.componentName),
        testingApproach: 'Start with high-complexity, high-risk components. Focus on unit tests first, then integration tests.',
        estimatedEffort: Math.min(timeConstraints, components.length * 2),
        riskMitigation: [
          'Prioritize critical business logic',
          'Focus on error handling',
          'Test integration points thoroughly'
        ]
      };
    }
  }

  /**
   * Optimize existing test suite
   */
  async optimizeTestSuite(
    existingTests: TestCase[],
    coverage: { lines: number; branches: number; functions: number },
    performance: { averageTime: number; slowestTests: string[] }
  ): Promise<{
    recommendations: string[];
    redundantTests: string[];
    missingTestAreas: string[];
    performanceImprovements: string[];
  }> {
    const prompt = `
    Analyze and optimize the following test suite:

    Existing Tests:
    ${JSON.stringify(existingTests.map(t => ({ 
      id: t.id, 
      title: t.title, 
      type: t.type, 
      priority: t.priority,
      estimatedDuration: t.estimatedDuration 
    })), null, 2)}

    Coverage Metrics:
    ${JSON.stringify(coverage, null, 2)}

    Performance Metrics:
    ${JSON.stringify(performance, null, 2)}

    Provide optimization recommendations in JSON format:
    {
      "recommendations": ["array of general improvement suggestions"],
      "redundantTests": ["array of test IDs that might be redundant"],
      "missingTestAreas": ["array of areas that need more test coverage"],
      "performanceImprovements": ["array of performance optimization suggestions"]
    }

    Focus on:
    1. Test coverage gaps
    2. Redundant or overlapping tests
    3. Performance bottlenecks
    4. Test organization and structure
    5. Maintenance overhead
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error optimizing test suite:', error);
      
      // Fallback recommendations
      return {
        recommendations: ['Consider organizing tests by feature area', 'Add more integration tests'],
        redundantTests: [],
        missingTestAreas: ['Error handling', 'Edge cases'],
        performanceImprovements: ['Use test.concurrent for independent tests', 'Mock heavy dependencies']
      };
    }
  }

  /**
   * Generate fallback test cases when AI fails
   */
  private generateFallbackTests(
    analysis: ComponentAnalysis, 
    framework: TestCase['framework']
  ): TestCase[] {
    const baseTest: TestCase = {
      id: `${analysis.componentName}-fallback-1`,
      title: `Basic ${analysis.componentName} functionality test`,
      description: `Test basic functionality of ${analysis.componentName}`,
      type: 'unit',
      priority: 'medium',
      tags: [analysis.componentType, 'fallback'],
      steps: [
        {
          step: 1,
          action: `Initialize ${analysis.componentName}`,
          expectedOutcome: 'Component initializes successfully'
        }
      ],
      expectedResult: 'All basic functionality works as expected',
      code: this.generateBasicTestCode(analysis, framework),
      framework,
      estimatedDuration: 5,
      riskLevel: 'low',
      businessValue: 'Ensures basic component functionality',
      technicalComplexity: 3
    };

    return [baseTest];
  }

  /**
   * Generate basic test code template
   */
  private generateBasicTestCode(
    analysis: ComponentAnalysis, 
    framework: TestCase['framework']
  ): string {
    const componentName = analysis.componentName;
    
    switch (framework) {
      case 'jest':
        return `
describe('${componentName}', () => {
  test('should initialize correctly', () => {
    // Arrange
    const component = new ${componentName}();
    
    // Act & Assert
    expect(component).toBeDefined();
  });

  test('should handle basic functionality', () => {
    // TODO: Implement specific test logic
    expect(true).toBe(true);
  });
});`;

      case 'cypress':
        return `
describe('${componentName}', () => {
  beforeEach(() => {
    cy.visit('/'); // Update with correct URL
  });

  it('should display correctly', () => {
    cy.get('[data-testid="${componentName.toLowerCase()}"]').should('be.visible');
  });
});`;

      case 'playwright':
        return `
import { test, expect } from '@playwright/test';

test.describe('${componentName}', () => {
  test('should display correctly', async ({ page }) => {
    await page.goto('/'); // Update with correct URL
    await expect(page.locator('[data-testid="${componentName.toLowerCase()}"]')).toBeVisible();
  });
});`;

      default:
        return `// Test code for ${componentName}\n// Framework: ${framework}`;
    }
  }

  /**
   * Utility function to hash code for caching
   */
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Get test generation history
   */
  getTestHistory(): TestCase[] {
    return this.testHistory;
  }

  /**
   * Clear analysis cache
   */
  clearCache(): void {
    this.analysisCache.clear();
  }
}

// Export singleton instance
export const aiTestGenerator = new AITestGenerator();
