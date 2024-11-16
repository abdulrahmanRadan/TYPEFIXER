import { CodeAnalyzer } from "../analyzer/codeAnalyzer";

export class SuggestionManager {
  private analyzer: CodeAnalyzer;

  constructor() {
    this.analyzer = new CodeAnalyzer();
  }

  getSuggestions(code: string): string[] {
    return this.analyzer.analyze(code);
  }
}
