import { GitHubFile } from './github';

export interface ParsedFile {
  path: string;
  language: string;
  content: string;
  lines: string[];
  functions: FunctionInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  classes: ClassInfo[];
  variables: VariableInfo[];
  comments: CommentInfo[];
  complexity: number;
  linesOfCode: number;
}

export interface FunctionInfo {
  name: string;
  type: 'function' | 'arrow' | 'method' | 'async';
  line: number;
  endLine?: number;
  parameters: ParameterInfo[];
  complexity: number;
  hasReturn: boolean;
  isExported: boolean;
}

export interface ParameterInfo {
  name: string;
  type?: string;
  defaultValue?: string;
  isOptional: boolean;
}

export interface ImportInfo {
  module: string;
  imports: string[];
  type: 'default' | 'named' | 'namespace';
  line: number;
  isExternal: boolean;
}

export interface ExportInfo {
  name: string;
  type: 'default' | 'named';
  line: number;
}

export interface ClassInfo {
  name: string;
  line: number;
  methods: FunctionInfo[];
  properties: VariableInfo[];
  extends?: string;
  isExported: boolean;
}

export interface VariableInfo {
  name: string;
  type: 'const' | 'let' | 'var';
  value?: string;
  line: number;
  isGlobal: boolean;
}

export interface CommentInfo {
  type: 'single' | 'multi' | 'jsdoc';
  content: string;
  line: number;
  hasCode: boolean;
}

export class FileProcessor {
  private languagePatterns = {
    typescript: { extensions: ['.ts', '.tsx'], parser: 'typescript' },
    javascript: { extensions: ['.js', '.jsx'], parser: 'javascript' },
    python: { extensions: ['.py'], parser: 'python' },
    java: { extensions: ['.java'], parser: 'java' },
    cpp: { extensions: ['.cpp', '.cc', '.cxx'], parser: 'cpp' },
    c: { extensions: ['.c', '.h'], parser: 'c' },
    go: { extensions: ['.go'], parser: 'go' },
    rust: { extensions: ['.rs'], parser: 'rust' },
  };

  detectLanguage(filePath: string): string {
    const parts = filePath.split('.');
    const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
    const extension = ext ? '.' + ext : '';
    
    for (const [language, config] of Object.entries(this.languagePatterns)) {
      if (config.extensions.includes(extension)) {
        return language;
      }
    }
    
    return 'unknown';
  }

  async parseFile(file: GitHubFile): Promise<ParsedFile> {
    if (!file.content) {
      throw new Error(`No content available for file: ${file.path}`);
    }

    const language = this.detectLanguage(file.path);
    const lines = file.content.split('\n');
    
    const parsed: ParsedFile = {
      path: file.path,
      language,
      content: file.content,
      lines,
      functions: [],
      imports: [],
      exports: [],
      classes: [],
      variables: [],
      comments: [],
      complexity: 0,
      linesOfCode: this.countLinesOfCode(lines),
    };

    // Language-specific parsing
    switch (language) {
      case 'typescript':
      case 'javascript':
        this.parseTypeScriptJavaScript(parsed);
        break;
      case 'python':
        this.parsePython(parsed);
        break;
      case 'java':
        this.parseJava(parsed);
        break;
      case 'cpp':
      case 'c':
        this.parseCpp(parsed);
        break;
      case 'go':
        this.parseGo(parsed);
        break;
      case 'rust':
        this.parseRust(parsed);
        break;
      default:
        this.parseGeneric(parsed);
    }

    // Calculate overall complexity
    parsed.complexity = this.calculateComplexity(parsed);

    return parsed;
  }

  private parseTypeScriptJavaScript(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Parse imports
    const importRegex = /import\s+(?:(?:\*\s+as\s+(\w+))|(?:({[^}]+})\s+from\s+|(\w+)\s+from\s+)?['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\s*\))/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const module = match[4] || match[5];
      const imports = match[2] ? match[2].replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      
      parsed.imports.push({
        module,
        imports: imports.length > 0 ? imports : [match[1] || match[3] || 'default'],
        type: match[2] ? 'named' : match[1] ? 'namespace' : 'default',
        line,
        isExternal: this.isExternalModule(module),
      });
    }

    // Parse functions
    const functionRegex = /(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|(\w+)\s*:\s*\([^)]*\)\s*=>|(\w+)\s*\([^)]*\)\s*{)/g;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1] || match[2] || match[3];
      const line = this.getLineNumber(content, match.index);
      const isAsync = content.substring(Math.max(0, match.index - 50), match.index).includes('async');
      const isExported = content.substring(Math.max(0, match.index - 100), match.index).includes('export');
      
      parsed.functions.push({
        name,
        type: match[1] ? 'function' : match[2] ? 'arrow' : 'method',
        line,
        parameters: this.extractParameters(match[0]),
        complexity: this.calculateFunctionComplexity(match[0]),
        hasReturn: this.hasReturnStatement(content, match.index),
        isExported,
      });
    }

    // Parse classes
    const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/g;
    while ((match = classRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      const isExported = content.substring(Math.max(0, match.index - 100), match.index).includes('export');
      
      parsed.classes.push({
        name,
        line,
        methods: [],
        properties: [],
        extends: match[2],
        isExported,
      });
    }

    // Parse variables
    const variableRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?:=\s*([^;]+))?/g;
    while ((match = variableRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      const type = match[0].includes('const') ? 'const' : match[0].includes('let') ? 'let' : 'var';
      const isExported = content.substring(Math.max(0, match.index - 100), match.index).includes('export');
      
      parsed.variables.push({
        name,
        type,
        value: match[2]?.trim(),
        line,
        isGlobal: line < 20, // Simple heuristic for global variables
      });
    }

    // Parse comments
    this.parseComments(parsed);
  }

  private parsePython(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Parse imports
    const importRegex = /(?:from\s+(\S+)\s+import\s+([^\\n]+)|import\s+(\S+))/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const module = match[1] || match[3];
      const imports = match[2] ? match[2].split(',').map(s => s.trim()) : [];
      
      parsed.imports.push({
        module,
        imports: imports.length > 0 ? imports : [module],
        type: match[1] ? 'named' : 'default',
        line,
        isExternal: this.isExternalModule(module),
      });
    }

    // Parse functions
    const functionRegex = /(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\):/g;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      const isAsync = match[0].includes('async');
      
      parsed.functions.push({
        name,
        type: 'function',
        line,
        parameters: this.extractPythonParameters(match[2]),
        complexity: this.calculateFunctionComplexity(match[0]),
        hasReturn: this.hasPythonReturn(content, match.index),
        isExported: false, // Python doesn't have explicit exports
      });
    }

    // Parse classes
    const classRegex = /class\s+(\w+)(?:\s*\(\s*(\w+)\s*\))?:/g;
    while ((match = classRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      
      parsed.classes.push({
        name,
        line,
        methods: [],
        properties: [],
        extends: match[2],
        isExported: false,
      });
    }

    // Parse comments
    this.parsePythonComments(parsed);
  }

  private parseJava(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Parse imports
    const importRegex = /import\s+(?:static\s+)?([^;]+);/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const module = match[1].trim();
      
      parsed.imports.push({
        module,
        imports: [module],
        type: 'named',
        line,
        isExternal: this.isExternalModule(module),
      });
    }

    // Parse classes
    const classRegex = /(?:public\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{\s]+))?\s*{/g;
    while ((match = classRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      const isPublic = match[0].includes('public');
      
      parsed.classes.push({
        name,
        line,
        methods: [],
        properties: [],
        extends: match[2],
        isExported: isPublic,
      });
    }

    // Parse methods
    const methodRegex = /(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:final\s+)?(?:abstract\s+)?(?:synchronized\s+)?(?:native\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)(?:\s*throws\s+([^;{]+))?/g;
    while ((match = methodRegex.exec(content)) !== null) {
      const name = match[2];
      const line = this.getLineNumber(content, match.index);
      
      parsed.functions.push({
        name,
        type: 'method',
        line,
        parameters: this.extractJavaParameters(match[3]),
        complexity: this.calculateFunctionComplexity(match[0]),
        hasReturn: !match[1].includes('void'),
        isExported: match[0].includes('public'),
      });
    }

    // Parse comments
    this.parseComments(parsed);
  }

  private parseCpp(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Parse includes
    const includeRegex = /#include\s*[<"]([^>"]+)[>"]/g;
    let match;
    while ((match = includeRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const module = match[1];
      
      parsed.imports.push({
        module,
        imports: [module],
        type: 'default',
        line,
        isExternal: module.startsWith('<'),
      });
    }

    // Parse functions
    const functionRegex = /(?:\w+\s+)?(\w+)\s*\(([^)]*)\)\s*(?:const\s+)?{/g;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      
      parsed.functions.push({
        name,
        type: 'function',
        line,
        parameters: this.extractCppParameters(match[2]),
        complexity: this.calculateFunctionComplexity(match[0]),
        hasReturn: true, // C++ functions typically have return types
        isExported: false,
      });
    }

    // Parse classes
    const classRegex = /class\s+(\w+)(?:\s*:\s*(?:public\s+)?(\w+))?/g;
    while ((match = classRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      
      parsed.classes.push({
        name,
        line,
        methods: [],
        properties: [],
        extends: match[2],
        isExported: false,
      });
    }

    // Parse comments
    this.parseComments(parsed);
  }

  private parseGo(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Parse imports
    const importRegex = /import\s*\(\s*((?:[^)]|\n)*)\s*\)|import\s+["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      if (match[1]) {
        // Multi-import
        const imports = match[1].split('\n')
          .map(line => line.trim().replace(/["']/g, ''))
          .filter(line => line.length > 0);
        
        imports.forEach(imp => {
          parsed.imports.push({
            module: imp,
            imports: [imp],
            type: 'default',
            line,
            isExternal: this.isExternalModule(imp),
          });
        });
      } else {
        // Single import
        parsed.imports.push({
          module: match[2],
          imports: [match[2]],
          type: 'default',
          line,
          isExternal: this.isExternalModule(match[2]),
        });
      }
    }

    // Parse functions
    const functionRegex = /func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(([^)]*)\)(?:\s*[^{]*)?\s*{/g;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      
      parsed.functions.push({
        name,
        type: 'function',
        line,
        parameters: this.extractGoParameters(match[2]),
        complexity: this.calculateFunctionComplexity(match[0]),
        hasReturn: match[0].includes('return'),
        isExported: this.isGoExported(name),
      });
    }

    // Parse comments
    this.parseGoComments(parsed);
  }

  private parseRust(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Parse use statements
    const useRegex = /use\s+([^;]+);/g;
    let match;
    while ((match = useRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const module = match[1].trim();
      
      parsed.imports.push({
        module,
        imports: [module],
        type: 'named',
        line,
        isExternal: this.isExternalModule(module),
      });
    }

    // Parse functions
    const functionRegex = /(?:pub\s+)?(?:async\s+)?fn\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^{]+))?/g;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      const isPublic = match[0].includes('pub');
      
      parsed.functions.push({
        name,
        type: 'function',
        line,
        parameters: this.extractRustParameters(match[2]),
        complexity: this.calculateFunctionComplexity(match[0]),
        hasReturn: !!match[3],
        isExported: isPublic,
      });
    }

    // Parse structs
    const structRegex = /(?:pub\s+)?struct\s+(\w+)(?:\s*<[^>]*>)?\s*{/g;
    while ((match = structRegex.exec(content)) !== null) {
      const name = match[1];
      const line = this.getLineNumber(content, match.index);
      const isPublic = match[0].includes('pub');
      
      parsed.classes.push({
        name,
        line,
        methods: [],
        properties: [],
        isExported: isPublic,
      });
    }

    // Parse comments
    this.parseRustComments(parsed);
  }

  private parseGeneric(parsed: ParsedFile) {
    // Basic parsing for unknown languages
    this.parseComments(parsed);
  }

  private parseComments(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Single line comments
    const singleLineRegex = /\/\/(.*)$/gm;
    let match;
    while ((match = singleLineRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      const hasCode = /code|function|class|var|let|const/.test(commentContent);
      
      parsed.comments.push({
        type: 'single',
        content: commentContent,
        line,
        hasCode,
      });
    }

    // Multi-line comments
    const multiLineRegex = /\/\*([\s\S]*?)\*\//g;
    while ((match = multiLineRegex.exec(content)) !== null) {
      const startLine = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      const hasCode = /code|function|class|var|let|const/.test(commentContent);
      
      parsed.comments.push({
        type: 'multi',
        content: commentContent,
        line: startLine,
        hasCode,
      });
    }

    // JSDoc comments
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\//g;
    while ((match = jsDocRegex.exec(content)) !== null) {
      const startLine = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      
      parsed.comments.push({
        type: 'jsdoc',
        content: commentContent,
        line: startLine,
        hasCode: false,
      });
    }
  }

  private parsePythonComments(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Single line comments
    const singleLineRegex = /#(.*)$/gm;
    let match;
    while ((match = singleLineRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      const hasCode = /def|class|var|let|const/.test(commentContent);
      
      parsed.comments.push({
        type: 'single',
        content: commentContent,
        line,
        hasCode,
      });
    }

    // Multi-line comments (docstrings)
    const docstringRegex = /"""([\s\S]*?)"""/g;
    while ((match = docstringRegex.exec(content)) !== null) {
      const startLine = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      
      parsed.comments.push({
        type: 'multi',
        content: commentContent,
        line: startLine,
        hasCode: false,
      });
    }
  }

  private parseGoComments(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Single line comments
    const singleLineRegex = /\/\/(.*)$/gm;
    let match;
    while ((match = singleLineRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      const hasCode = /func|var|const/.test(commentContent);
      
      parsed.comments.push({
        type: 'single',
        content: commentContent,
        line,
        hasCode,
      });
    }

    // Multi-line comments
    const multiLineRegex = /\/\*([\s\S]*?)\*\//g;
    while ((match = multiLineRegex.exec(content)) !== null) {
      const startLine = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      const hasCode = /func|var|const/.test(commentContent);
      
      parsed.comments.push({
        type: 'multi',
        content: commentContent,
        line: startLine,
        hasCode,
      });
    }
  }

  private parseRustComments(parsed: ParsedFile) {
    const content = parsed.content;
    
    // Single line comments
    const singleLineRegex = /\/\/(.*)$/gm;
    let match;
    while ((match = singleLineRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      const hasCode = /fn|struct|let|const/.test(commentContent);
      
      parsed.comments.push({
        type: 'single',
        content: commentContent,
        line,
        hasCode,
      });
    }

    // Multi-line comments
    const multiLineRegex = /\/\*([\s\S]*?)\*\//g;
    while ((match = multiLineRegex.exec(content)) !== null) {
      const startLine = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      const hasCode = /fn|struct|let|const/.test(commentContent);
      
      parsed.comments.push({
        type: 'multi',
        content: commentContent,
        line: startLine,
        hasCode,
      });
    }

    // Doc comments
    const docCommentRegex = /\/\/\/([\s\S]*?)$/gm;
    while ((match = docCommentRegex.exec(content)) !== null) {
      const line = this.getLineNumber(content, match.index);
      const commentContent = match[1].trim();
      
      parsed.comments.push({
        type: 'jsdoc',
        content: commentContent,
        line,
        hasCode: false,
      });
    }
  }

  private extractParameters(paramString: string): ParameterInfo[] {
    if (!paramString) return [];
    
    const params = paramString.split(',').map(p => p.trim());
    return params.map(param => {
      const parts = param.split(':');
      const name = parts[0].replace(/[{}]/g, '').trim();
      const type = parts[1]?.trim();
      const isOptional = param.includes('?') || param.includes('undefined');
      
      return {
        name,
        type,
        isOptional,
      };
    });
  }

  private extractPythonParameters(paramString: string): ParameterInfo[] {
    if (!paramString) return [];
    
    const params = paramString.split(',').map(p => p.trim());
    return params.map(param => {
      const parts = param.split(':');
      const name = parts[0].trim();
      const type = parts[1]?.trim();
      const defaultValue = param.includes('=') ? param.split('=')[1].trim() : undefined;
      
      return {
        name,
        type,
        defaultValue,
        isOptional: !!defaultValue,
      };
    });
  }

  private extractJavaParameters(paramString: string): ParameterInfo[] {
    return this.extractParameters(paramString);
  }

  private extractCppParameters(paramString: string): ParameterInfo[] {
    if (!paramString) return [];
    
    const params = paramString.split(',').map(p => p.trim());
    return params.map(param => {
      const parts = param.split(/\s+/);
      const name = parts[parts.length - 1];
      const type = parts.slice(0, -1).join(' ');
      
      return {
        name,
        type,
        isOptional: false,
      };
    });
  }

  private extractGoParameters(paramString: string): ParameterInfo[] {
    if (!paramString) return [];
    
    const params = paramString.split(',').map(p => p.trim());
    return params.map(param => {
      const parts = param.split(/\s+/);
      const name = parts[parts.length - 1];
      const type = parts.slice(0, -1).join(' ');
      
      return {
        name,
        type,
        isOptional: false,
      };
    });
  }

  private extractRustParameters(paramString: string): ParameterInfo[] {
    if (!paramString) return [];
    
    const params = paramString.split(',').map(p => p.trim());
    return params.map(param => {
      const parts = param.split(':');
      const name = parts[0].trim();
      const type = parts[1]?.trim();
      
      return {
        name,
        type,
        isOptional: false,
      };
    });
  }

  private calculateFunctionComplexity(functionString: string): number {
    let complexity = 1; // Base complexity
    
    // Add complexity for control structures
    const controlStructures = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try'];
    controlStructures.forEach(struct => {
      const regex = new RegExp(`\\b${struct}\\b`, 'g');
      const matches = functionString.match(regex);
      if (matches) complexity += matches.length;
    });
    
    // Add complexity for logical operators
    const logicalOperators = (functionString.match(/&&|\|\||\band\b|\bor\b/gi) || []).length;
    complexity += logicalOperators;
    
    return complexity;
  }

  private calculateComplexity(parsed: ParsedFile): number {
    let complexity = 0;
    
    // Function complexity
    parsed.functions.forEach(func => {
      complexity += func.complexity;
    });
    
    // Class complexity
    parsed.classes.forEach(cls => {
      complexity += cls.methods.length * 2; // Methods add complexity
      complexity += cls.properties.length;
    });
    
    // Add complexity for large number of imports
    if (parsed.imports.length > 10) {
      complexity += parsed.imports.length - 10;
    }
    
    return complexity;
  }

  private hasReturnStatement(content: string, functionIndex: number): boolean {
    // Find the end of the function (simplified)
    const afterFunction = content.substring(functionIndex);
    const functionMatch = afterFunction.match(/{([\s\S]*?)}/);
    
    if (functionMatch) {
      const functionBody = functionMatch[1];
      return /return\s+/.test(functionBody);
    }
    
    return false;
  }

  private hasPythonReturn(content: string, functionIndex: number): boolean {
    // Find the end of the function (simplified)
    const afterFunction = content.substring(functionIndex);
    const lines = afterFunction.split('\n');
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('def ') || line.startsWith('class ')) {
        break; // End of function
      }
      if (line.startsWith('return ')) {
        return true;
      }
    }
    
    return false;
  }

  private isExternalModule(module: string): boolean {
    const externalPatterns = [
      /^react/,
      /^@/,
      /^lodash/,
      /^axios/,
      /^express/,
      /^moment/,
      /^date-fns/,
      /^uuid/,
      /^chalk/,
      /^fs$/,
      /^path$/,
      /^os$/,
      /^http$/,
      /^https$/,
    ];
    
    return externalPatterns.some(pattern => pattern.test(module)) || !module.startsWith('.');
  }

  private isGoExported(name: string): boolean {
    return name.length > 0 && name[0] === name[0].toUpperCase();
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private countLinesOfCode(lines: string[]): number {
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('/*');
    }).length;
  }
}

export const fileProcessor = new FileProcessor();