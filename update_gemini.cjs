const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

if (!code.includes('StorageService')) {
  code = code.replace(
    'import { FirestoreService } from "./firestoreService";',
    'import { FirestoreService } from "./firestoreService";\nimport { StorageService } from "./storageService";'
  );
}

// 1. Update the student profile loading and system instruction
const instructionInjectionStr = `    let dynamicSystemInstruction = SYSTEM_INSTRUCTIONS_V5_1;        dynamicSystemInstruction += \\\`\\n\\n<ROL_ACTUAL>\\nEl usuario actual es un: \${activeRole}\\n</ROL_ACTUAL>\\\`;`;

const newInstructionInjectionStr = `    let dynamicSystemInstruction = SYSTEM_INSTRUCTIONS_V5_1;
    
    let zpdLevel = 2;
    let userRegion = 'bogota';
    let userStreak = 0;
    
    try {
      const profile = await StorageService.getStudentProfile();
      if (profile) {
        zpdLevel = (profile as any).level || 2;
        userRegion = profile.location || 'bogota';
        userStreak = profile.streak || 0;
      }
    } catch (e) {
      console.warn("No se pudo cargar perfil para personalización:", e);
    }

    dynamicSystemInstruction += \\\`\\n\\n<PERFIL_ESTUDIANTE_ACTUAL>\\nROL: \${activeRole}\\nNIVEL ZPD: \${zpdLevel} (1=Básico/andamiaje alto, 2=Intermedio, 3=Avanzado/desafío)\\nREGIÓN: \${userRegion}\\nRACHA ACTUAL: \${userStreak} días\\n</PERFIL_ESTUDIANTE_ACTUAL>\\\`;`;

code = code.replace(instructionInjectionStr, newInstructionInjectionStr);

// 2. Add the sync queue and response checks
const returnStr = `const data = await response.json();    return data.text || await sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);`;

const newReturnStr = `const data = await response.json();
    const responseText = data.text || "";

    if (subjectContext && !responseText.includes('DBA-') && !responseText.includes('competencia')) {
      console.warn("⚠️ Respuesta sin cita DBA detectada.");
    }

    if (responseText.includes('[📥 MODO OFFLINE]') || responseText.toLowerCase().includes('¡correcto!') || responseText.toLowerCase().includes('¡excelente!')) {
      try {
        await StorageService.addToSyncQueue({
          type: 'progress',
          payload: { subject: subjectContext, role: activeRole, timestamp: Date.now() }
        });
      } catch (e) {
        console.warn("No se pudo agregar a cola de sync:", e);
      }
    }

    return responseText || await sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);`;

code = code.replace(returnStr, newReturnStr);

fs.writeFileSync('services/geminiService.ts', code);
