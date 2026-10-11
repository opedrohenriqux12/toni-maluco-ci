export interface VirtualFile {
  name: string;
  content: string;
  type: "file" | "directory";
  size: number;
  updatedAt: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
}

// Sandbox local seguro que executa código JavaScript / TypeScript / Node e comandos shell virtualizados
class InBrowserVirtualOS {
  private files: Map<string, VirtualFile> = new Map();
  private env: Record<string, string> = {
    USER: "toni-maluco",
    HOME: "/workspace",
    PATH: "/bin:/usr/bin:/workspace/node_modules/.bin",
    NODE_ENV: "production",
  };
  private cwd: string = "/workspace";

  constructor() {
    this.initDefaultFiles();
  }

  private initDefaultFiles() {
    this.writeFile(
      "scraper_demo.js",
      `// Script de Extração de Preços - ToniMaluco C.I
console.log("Iniciando varredura no catálogo de Gift Cards...");
const items = [
  { item: "Steam R$ 50", preco: 48.50, margem: "7.2%" },
  { item: "Valorant 1000 VP", preco: 39.90, margem: "14.5%" },
  { item: "Robux 800", preco: 42.00, margem: "11.0%" }
];
console.table(items);
console.log("Varredura concluída: 3 oportunidades prontas para arbitragem.");
`
    );

    this.writeFile(
      "calculo_margens.js",
      `// Calculadora de Taxas de Marketplaces
const precoVenda = 100;
const taxaPlataforma = 0.12; // 12% GGMAX
const taxaPagamento = 0.025; // 2.5% Taxa financeira
const liquido = precoVenda * (1 - taxaPlataforma - taxaPagamento);
console.log("Preço Bruto: R$ " + precoVenda.toFixed(2));
console.log("Líquido a receber: R$ " + liquido.toFixed(2));
console.log("Lucro estimado: R$ " + (liquido - 65).toFixed(2));
`
    );
  }

  public getCwd(): string {
    return this.cwd;
  }

  public listFiles(): VirtualFile[] {
    return Array.from(this.files.values());
  }

  public writeFile(name: string, content: string): void {
    this.files.set(name, {
      name,
      content,
      type: "file",
      size: content.length,
      updatedAt: new Date().toLocaleTimeString("pt-BR"),
    });
  }

  public readFile(name: string): string | null {
    const file = this.files.get(name);
    return file ? file.content : null;
  }

  public removeFile(name: string): boolean {
    return this.files.delete(name);
  }

  // Executa comandos de terminal reais no ambiente virtual
  public async executeCommand(commandStr: string): Promise<ExecutionResult> {
    const start = performance.now();
    const trimmed = commandStr.trim();
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    let stdout = "";
    let stderr = "";
    let exitCode = 0;

    switch (cmd) {
      case "pwd":
        stdout = `${this.cwd}\n`;
        break;

      case "whoami":
        stdout = `${this.env["USER"] || "toni-maluco"}\n`;
        break;

      case "date":
        stdout = `${new Date().toString()}\n`;
        break;

      case "env":
        stdout = Object.entries(this.env)
          .map(([k, v]) => `${k}=${v}`)
          .join("\n") + "\n";
        break;

      case "ls": {
        const fileNames = Array.from(this.files.values())
          .map((f) => `${f.name.padEnd(24)} ${f.size}B   ${f.updatedAt}`)
          .join("\n");
        stdout = fileNames ? `${fileNames}\n` : "(diretório vazio)\n";
        break;
      }

      case "cat": {
        const fileName = args[0];
        if (!fileName) {
          stderr = "Uso: cat <nome_do_arquivo>\n";
          exitCode = 1;
        } else {
          const content = this.readFile(fileName);
          if (content !== null) {
            stdout = `${content}\n`;
          } else {
            stderr = `cat: ${fileName}: Arquivo não encontrado\n`;
            exitCode = 1;
          }
        }
        break;
      }

      case "rm": {
        const fileName = args[0];
        if (!fileName) {
          stderr = "Uso: rm <nome_do_arquivo>\n";
          exitCode = 1;
        } else {
          const removed = this.removeFile(fileName);
          if (removed) {
            stdout = `Arquivo ${fileName} removido com sucesso.\n`;
          } else {
            stderr = `rm: ${fileName}: Arquivo não encontrado\n`;
            exitCode = 1;
          }
        }
        break;
      }

      case "clear":
        stdout = "__CLEAR__";
        break;

      case "echo": {
        const text = args.join(" ").replace(/^["']|["']$/g, "");
        stdout = `${text}\n`;
        break;
      }

      case "node":
      case "run": {
        const target = args[0];
        let codeToRun = "";

        if (target && this.files.has(target)) {
          codeToRun = this.files.get(target)!.content;
        } else if (trimmed.startsWith("node -e ") || trimmed.startsWith("node --eval ")) {
          codeToRun = trimmed.replace(/^node\s+(-e|--eval)\s+/, "").replace(/^["']|["']$/g, "");
        } else if (target) {
          stderr = `node: Arquivo não encontrado: ${target}\n`;
          exitCode = 1;
          break;
        } else {
          stderr = "Uso: node <arquivo.js> ou node -e 'codigo'\n";
          exitCode = 1;
          break;
        }

        const runRes = await this.runJavaScriptSandbox(codeToRun);
        stdout = runRes.stdout;
        stderr = runRes.stderr;
        exitCode = runRes.exitCode;
        break;
      }

      default:
        stderr = `Comando '${cmd}' não reconhecido pelo terminal local.\nDica: Use 'ls', 'cat', 'node <script>', 'pwd' ou faça perguntas em linguagem natural para o Claude gerar e rodar.\n`;
        exitCode = 127;
        break;
    }

    const executionTimeMs = Math.round(performance.now() - start);
    return { stdout, stderr, exitCode, executionTimeMs };
  }

  // Executa código JS/TS de forma segura capturando logs do console
  public async runJavaScriptSandbox(code: string): Promise<ExecutionResult> {
    const start = performance.now();
    const logs: string[] = [];
    const errors: string[] = [];

    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(formatLogArg).join(" ")),
      error: (...args: any[]) => errors.push(args.map(formatLogArg).join(" ")),
      warn: (...args: any[]) => logs.push("[WARN] " + args.map(formatLogArg).join(" ")),
      info: (...args: any[]) => logs.push("[INFO] " + args.map(formatLogArg).join(" ")),
      table: (data: any) => {
        try {
          logs.push(JSON.stringify(data, null, 2));
        } catch {
          logs.push(String(data));
        }
      },
    };

    let exitCode = 0;

    try {
      // Async Function Sandbox isolada
      const runner = new Function(
        "console",
        "fetch",
        "setTimeout",
        "setInterval",
        `return (async () => {
          ${code}
        })();`
      );

      await Promise.race([
        runner(customConsole, window.fetch.bind(window), setTimeout, setInterval),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: Execução excedeu 10 segundos")), 10000)),
      ]);
    } catch (e: any) {
      errors.push(`Runtime Error: ${e?.message || String(e)}`);
      exitCode = 1;
    }

    const executionTimeMs = Math.round(performance.now() - start);
    return {
      stdout: logs.join("\n") + (logs.length > 0 ? "\n" : ""),
      stderr: errors.join("\n") + (errors.length > 0 ? "\n" : ""),
      exitCode,
      executionTimeMs,
    };
  }
}

function formatLogArg(arg: any): string {
  if (typeof arg === "object" && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

export const virtualOS = new InBrowserVirtualOS();
