import { useEffect, useState } from 'react';

interface TypewriterLine {
  text: string;
  color: string;
}

interface DisplayedLine extends TypewriterLine {
  complete: boolean;
}

export function useTypewriter(lines: TypewriterLine[], isActive: boolean) {
  const [displayedLines, setDisplayedLines] = useState<DisplayedLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayedLines([]);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setIsDone(false);
      return;
    }

    if (currentLineIndex >= lines.length) {
      setIsDone(true);
      return;
    }

    const currentLine = lines[currentLineIndex];
    
    // If the text is empty, just move to next line after a small pause
    if (currentLine.text.length === 0) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, { ...currentLine, complete: true }]);
        setCurrentLineIndex(prev => prev + 1);
      }, 250);
      return () => clearTimeout(timer);
    }

    const charTimer = setTimeout(() => {
      if (currentCharIndex < currentLine.text.length) {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (currentCharIndex === 0) {
            newLines.push({ text: currentLine.text[0], color: currentLine.color, complete: false });
          } else {
            newLines[currentLineIndex].text = currentLine.text.slice(0, currentCharIndex + 1);
          }
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // Line finished
        setDisplayedLines(prev => {
          const newLines = [...prev];
          newLines[currentLineIndex].complete = true;
          return newLines;
        });
        
        // Pause between lines
        setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 250);
      }
    }, 35);

    return () => clearTimeout(charTimer);
  }, [isActive, currentLineIndex, currentCharIndex, lines]);

  return { displayedLines, isDone, currentLineIndex };
}
