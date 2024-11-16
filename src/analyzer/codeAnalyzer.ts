export class CodeAnalyzer {
  analyze(code: string): string[] {
    const errors = this.findTypeErrors(code);
    return this.suggestFixes(errors);
  }

  findTypeErrors(code: string): { line: number; error: string }[] {
    const errors: { line: number; error: string }[] = [];
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // تحليل الأخطاء في الأنواع بناءً على أنماط عامة لجميع الدوال
      const functionPattern = /\w+\(([^)]+)\);/;
      const match = line.match(functionPattern);
      if (match) {
        const params = match[1].trim();
        if (!isNaN(Number(params)) && params.includes(".")) {
          errors.push({ line: i, error: "Expected string but got float" });
        } else if (!isNaN(Number(params))) {
          errors.push({ line: i, error: "Expected string but got number" });
        } else if (
          params.toLowerCase() === "true" ||
          params.toLowerCase() === "false"
        ) {
          errors.push({ line: i, error: "Expected string but got boolean" });
        } else if (!params.startsWith('"') && !params.endsWith('"')) {
          errors.push({
            line: i,
            error: "Expected string but got unquoted text",
          });
        }
      }
    }
    return errors;
  }

  suggestFixes(errors: { line: number; error: string }[]): string[] {
    const suggestions: string[] = [];
    for (const error of errors) {
      if (error.error === "Expected string but got float") {
        suggestions.push(
          `Line ${error.line + 1}: Convert float to string by adding quotes`
        );
      } else if (error.error === "Expected string but got number") {
        suggestions.push(
          `Line ${error.line + 1}: Convert number to string by adding quotes`
        );
      } else if (error.error === "Expected string but got boolean") {
        suggestions.push(
          `Line ${error.line + 1}: Convert boolean to string by adding quotes`
        );
      } else if (error.error === "Expected string but got unquoted text") {
        suggestions.push(
          `Line ${
            error.line + 1
          }: Convert unquoted text to string by adding quotes`
        );
      }
    }
    return suggestions;
  }
}
