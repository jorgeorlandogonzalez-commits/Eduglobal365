const fs = require('fs');

let code = fs.readFileSync('services/geminiService.ts', 'utf8');

code = code.replace(
  'import { FirestoreService } from "./firestoreService";',
  `import { FirestoreService } from "./firestoreService";\nimport { webLLMInstance } from "./webLLMService";`
);

const findText = `export const sendMessageToGemmaOffline = async (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student'
): Promise<string> => {
  const normSubject = subjectContext || "General";
  const materials = await FirestoreService.getCourseMaterials(normSubject);
  const matchedMaterial = materials[0];
  const prefix = \`[💡 GEMMA 4 LOCAL ENGINE - INFERENCIA CLIENT-SIDE WebGPU]\`;`;

const replaceText = `export const sendMessageToGemmaOffline = async (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student'
): Promise<string> => {
  const normSubject = subjectContext || "General";
  
  if (webLLMInstance.isReady()) {
    try {
      return await webLLMInstance.generate(chatHistory, newMessage, normSubject, userRole);
    } catch (e) {
      console.error("WebLLM offline error, falling back to static offline:", e);
    }
  }

  const materials = await FirestoreService.getCourseMaterials(normSubject);
  const matchedMaterial = materials[0];
  const prefix = \`[💡 GEMMA 4 LOCAL ENGINE - INFERENCIA CLIENT-SIDE WebGPU]\`;`;

if (code.includes(findText)) {
  code = code.replace(findText, replaceText);
  fs.writeFileSync('services/geminiService.ts', code);
  console.log("Patched successfully");
} else {
  // Let's print out what we see
  console.log("Could not find the target text. Current content looks like this:");
  console.log(code.substring(0, 1000));
}
