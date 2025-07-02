import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import dotenv from "dotenv";
import readline from "readline/promises";

dotenv.config({path: "./.env"});

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set");
}

class MCPClient {
    private mcp: Client;
    private openai: OpenAI;
    private transport: StreamableHTTPClientTransport | null = null;
    private tools: OpenAI.ChatCompletionTool[] = [];
    private messages: OpenAI.ChatCompletionMessageParam[] = [];

    constructor() {
        this.openai = new OpenAI({
            apiKey: DEEPSEEK_API_KEY,
            baseURL: "https://api.deepseek.com/v1",
        });
        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
    }

    async connectToServer() {
        try {
            this.transport = new StreamableHTTPClientTransport(
                new URL("http://localhost:3000/mcp")
            );
            await this.mcp.connect(this.transport);

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.inputSchema as Record<string, unknown>,
                },
            }));

            console.log(
                "Connected to server with tools:",
                this.tools.map((t) => t.function.name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }

    async processQuery(query: string) {
        this.messages.push({
            role: "user",
            content: query
        });
        let finalResponse = "";
        let maxIterations = 5; // Prevenir loops infinitos
        let iteration = 0;

        while (iteration < maxIterations) {
            iteration++;

            const response = await this.openai.chat.completions.create({
                model: "deepseek-chat",
                messages: this.messages,
                tools: this.tools.length > 0 ? this.tools : undefined,
                tool_choice: this.tools.length > 0 ? "auto" : "none",
            });

            const message = response.choices[0].message;
            this.messages.push(message);

            // Si no hay llamadas a herramientas, retornamos la respuesta final
            if (!message.tool_calls || message.tool_calls.length === 0) {
                finalResponse = message.content || "";
                break;
            }

            // Procesar cada llamada a herramienta
            for (const toolCall of message.tool_calls) {
                const toolName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                // Registrar la llamada a la herramienta
                console.log(`Calling tool: ${toolName} with args:`, args);

                try {
                    const result = await this.mcp.callTool({
                        name: toolName,
                        arguments: args,
                    });

                    // Extraer el contenido de texto de la respuesta
                    let toolResponse = "";
                    if (Array.isArray(result.content)) {
                        for (const block of result.content) {
                            if (block.type === "text") {
                                toolResponse += block.text;
                            }
                        }
                    } else if (typeof result.content === "string") {
                        toolResponse = result.content;
                    } else {
                        toolResponse = JSON.stringify(result.content);
                    }
                    console.log(toolResponse);

                    // Agregar la respuesta de la herramienta al historial
                    this.messages.push({
                        role: "tool",
                        content: toolResponse,
                        tool_call_id: toolCall.id,
                    });
                } catch (error) {
                    console.error(`Error calling tool ${toolName}:`, error);
                    this.messages.push({
                        role: "tool",
                        content: `Error executing tool ${toolName}: ${error}`,
                        tool_call_id: toolCall.id,
                    });
                }
            }
        }

        return finalResponse;
    }

    async startCLI() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        while (true) {
            const query = await rl.question("You: ");
            if (query.toLowerCase() === "exit") break;

            const response = await this.processQuery(query);
            console.log("\nAssistant:", response, "\n");
        }

        rl.close();
    }
}

// Uso del cliente
async function main() {
    const client = new MCPClient();
    await client.connectToServer(); 
    await client.startCLI();
}

main().catch(console.error);
