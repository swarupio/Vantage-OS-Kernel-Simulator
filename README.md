# Vantage Kernel Sim - CPU Scheduling Simulator

A highly interactive and visually rich web-based simulator for exploring CPU scheduling algorithms, kernel dispatching, and the full lifecycle of operating system processes. Designed for educational purposes, it visualizes how an OS manages processes, memory, and the CPU.

## 🌟 Features

- **Kernel Dispatcher Trace (Gantt Chart):** Real-time, dynamic Gantt chart visualizing CPU execution, wait times, and process switching.
- **Process Control Block (PCB) Registry:** A live monitoring table displaying process IDs, priorities, burst times, arrival times, memory allocation, and current states.
- **Process Quick Profiles:** One-click process generation with predefined profiles:
  - **NORMAL:** Standard process with balanced priority and burst time.
  - **CRITICAL:** High priority, short burst for immediate execution.
  - **BACKGROUND:** Low priority, long burst simulating background tasks.
  - **STARVER:** High priority, long burst designed to demonstrate process starvation.
- **State Transition Visualizer:** Live flow diagrams showing processes moving through OS states (NEW → READY → RUNNING → WAIT → TERMINATED).
- **Ready Queue Flow:** Visual representation of the scheduler's ready queue and background dispatching.
- **Live Telemetry & Metrics:** Real-time calculation of CPU metrics:
  - Average Waiting Time
  - Average Turnaround Time
  - CPU Utilization (%)
  - Throughput (processes/sec)

## 🚀 Tech Stack

- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **UI Components:** Radix UI (Primitives), Lucide React (Icons)

## 🛠️ Getting Started

### Prerequisites
Make sure you have Node.js (v18 or higher) installed on your local machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Vantage-OS-Kernel-Simulator.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Vantage-OS-Kernel-Simulator
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

## 📂 Project Structure

```text
├── src/
│   ├── components/       # Reusable UI components (PCB Table, Gantt Chart, etc.)
│   ├── hooks/            # Custom React hooks containing scheduling logic
│   ├── types/            # TypeScript interfaces for processes, events, etc.
│   ├── lib/              # Utility functions and constants
│   ├── App.tsx           # Main application layout and state connection
│   └── main.tsx          # Application entry point
├── public/               # Static assets
└── package.json          # Project metadata and dependencies
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](../../issues).


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
