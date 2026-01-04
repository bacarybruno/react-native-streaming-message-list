import { mockResponses } from './mockResponses';

let responseIndex = 0;

export async function simulateAIResponse(
  onChunk: (chunk: string) => void,
  options?: {
    initialDelay?: number;
    chunkDelay?: number;
  }
): Promise<void> {
  const initialDelay = options?.initialDelay ?? 800;
  const chunkDelay = options?.chunkDelay ?? 60;

  await new Promise((resolve) => setTimeout(resolve, initialDelay));

  return new Promise((resolve) => {
    const response = mockResponses[responseIndex];
    responseIndex = (responseIndex + 1) % mockResponses.length;

    const words = response?.split(' ') || [];
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        onChunk(words[index] + ' ');
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, chunkDelay);
  });
}
