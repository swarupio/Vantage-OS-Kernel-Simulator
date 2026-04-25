import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINIAPIKEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINIAPIKEY or GEMINI_API_KEY is missing. Please set GEMINIAPIKEY in the Secrets tab.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
}

const stepFunction: FunctionDeclaration = {
  name: "step_simulation",
  description: "Execute one step of the OS simulation.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const resetFunction: FunctionDeclaration = {
  name: "reset_kernel",
  description: "Reset the entire OS simulation to its initial state.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const setAlgorithmFunction: FunctionDeclaration = {
  name: "set_scheduling_algorithm",
  description: "Change the CPU scheduling algorithm.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      algorithm: {
        type: Type.STRING,
        enum: ["RR", "PRIORITY", "SJF"],
        description: "The algorithm code: RR (Round Robin), PRIORITY, or SJF (Shortest Job First)."
      }
    },
    required: ["algorithm"]
  }
};

const addProcessFunction: FunctionDeclaration = {
  name: "add_process",
  description: "Add a new process to the system.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      pid: { type: Type.STRING, description: "Process ID (e.g., P001)" },
      name: { type: Type.STRING, description: "Process name" },
      priority: { type: Type.NUMBER, description: "Priority (1-10, 1=highest)" },
      burstTime: { type: Type.NUMBER, description: "Total burst time in ms" },
      memRequired: { type: Type.NUMBER, description: "Memory requirement in MB" }
    },
    required: ["pid", "name", "priority", "burstTime", "memRequired"]
  }
};

export const aiService = {
  async generateGuideResponse(prompt: string, history: AIChatMessage[] = []) {
    try {
      const systemInstruction = `You are the Vantage Kernel Copilot, an advanced AI assistant embedded in an Operating System Simulator. 
      Your goal is to help users navigate and understand core OS concepts.
      
      CRITICAL: Use Markdown properly. Render lists and bold text where appropriate, but don't overdo it with # symbols. 
      The UI now supports full Markdown rendering, so your responses will look clean and professional.
      
      OPERATIONAL CAPABILITY: You have tools to actually perform actions in this website. You can:
      - Step the simulation.
      - Reset the kernel.
      - Switch scheduling algorithms (RR, PRIORITY, SJF).
      - Add new processes.
      
      If a user asks you to "do" something (e.g., "Step the kernel", "Run one step", "Set algorithm to SJF", "Reset everything", "Add a process P1 with 50MB"), call the appropriate tool. 
      Always explain what action you performed in a friendly way.
      
      Simulated areas:
      1. CPU Scheduling (Round Robin, Priority, SJF).
      2. Memory Management (Partitioning, First Fit, Best Fit).
      3. Structured File Systems (Inodes, Block Allocation, Fragmentation).`;

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
          tools: [{
            functionDeclarations: [
              stepFunction,
              resetFunction,
              setAlgorithmFunction,
              addProcessFunction
            ]
          }]
        }
      });

      return {
        text: response.text,
        functionCalls: response.functionCalls
      };
    } catch (error) {
      console.error("AI Service Error:", error);
      return { text: "I encountered a kernel panic while processing your request. Please try again." };
    }
  }
};
