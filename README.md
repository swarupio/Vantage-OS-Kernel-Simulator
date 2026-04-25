Vantage OS is a browser-native, high-fidelity simulator designed to demystify the inner workings of an Operating System kernel. Built for computer science students and system enthusiasts, it provides a visual, interactive window into the complex dance between processes, memory, and storage.
🚀 Key Features
Advanced CPU Scheduling:
Simulates industry-standard algorithms: Round Robin, Priority, and Shortest Job First (SJF).
Features a real-time CPU Gantt Chart visualization to track context switching and process execution.
Physical Memory Management (MMU):
Interactive Physical Page Map showing frame allocation.
Real-time visualization of memory isolation and allocation patterns across logical addresses.
Structured File System Simulation:
Simulates block-level allocation and Inode management.
Tracks disk fragmentation and data distribution across the simulated storage layer.
AI-Powered Kernel Insights:
Integrated AICopilot (powered by Google Gemini) that analyzes simulation telemetry and explains system behaviors (e.g., "Why did this process trigger a page fault?").
Process Lifecycle Control:
Interactive PCB (Process Control Block) Registry to manage process states (Ready, Running, Terminated).
Configurable burst times, priorities, and quantum settings.
Real-time Telemetry Pipeline:
A persistent Kernel Event Log that tracks every syscall, scheduling decision, and memory access in real-time.
🛠️ Tech Stack
Frontend: React 18, TypeScript, Tailwind CSS
Animations: Framer Motion (motion/react)
State Management: Zustand (for the simulation engine)
AI Engine: Google Gemini API
Icons: Lucide React
UI Primitives: Radix UI
📖 Educational Value
This simulator is designed to move beyond static diagrams. By allowing users to manipulate variables and see the immediate impact on system throughput, wait times, and memory fragmentation, it serves as a powerful bridge between OS theory and practical execution.

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5a3fed64-7359-4637-bbab-72c5eedbbb3f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
