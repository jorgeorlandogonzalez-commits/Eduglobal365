const fs = require('fs');
const content = `// src/services/downloadService.ts
import { Message, UserRole, BuilderProject, CourseMaterial, StudentProfile } from "../config/types";
import { APP_NAME } from "../config/constants";
import { StorageService } from "./storageService";
import { COLOMBIA_REGIONS } from "../config/regions";

export interface OfflinePackage {
  metadata: {
    version: string;
    createdAt: string;
    subject: string;
    userRole: UserRole;
    studentName: string;
    region: string;
    grade: string;
    estimatedSizeMB: number;
    expiresAt?: string;
  };
  content: {
    messages: Message[];
    materials: CourseMaterial[];
    studentProfile: Partial<StudentProfile>;
    systemInstructions: string;
    regionalExamples: string[];
    dbaCodesCovered: string[];
  };
  manifest: {
    totalMessages: number;
    totalMaterials: number;
    totalAudioFiles: number;
    hasSimulation: boolean;
    lastSyncTimestamp: number;
  };
}

export const DownloadService = {
  /**
   * Generates a "Smart Package" (HTML file) of the current session
   * structured for offline study on mobile devices.
   */
  generateOfflinePackage: async (
    subject: string,
    track: UserRole = 'student',
    project?: BuilderProject
  ): Promise<boolean> => {
    try {
      const messages = await StorageService.loadSubjectChat(subject, track);
      
      const relevantMessages = messages.filter(m => 
        m.text.length > 0 && 
        (!track || !m.track || m.track === track)
      );

      const isBuilder = track === 'builder';
      
      let content = \`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${APP_NAME} | Paquete Offline: \${subject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .header { background: #1e293b; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; }
        .header p { margin: 0; color: #cbd5e1; font-size: 14px; }
        .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 8px; }
        .message { background: white; padding: 15px 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .message.user { border-left: 4px solid #3b82f6; }
        .message.bot { border-left: 4px solid #10b981; }
        .role { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; color: #64748b; }
        .user .role { color: #3b82f6; }
        .bot .role { color: #10b981; }
        .content { font-size: 15px; white-space: pre-wrap; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
        .metadata { background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
        .metadata h2 { font-size: 18px; margin-top: 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 \${subject}</h1>
        <p>Preparado para la Vereda (100% Offline)</p>
        \${isBuilder ? '<span class="badge">Track Constructor</span>' : '<span class="badge">Track Estudiante</span>'}
    </div>

    \${isBuilder && project ? \`
    <div class="metadata">
        <h2>🏗️ Detalles del Proyecto</h2>
        <p><strong>Descripción:</strong> \${project.description}</p>
        <p><strong>Impacto:</strong> \${project.impactMetric}</p>
        <p><strong>Stack:</strong> \${project.techStack.join(', ')}</p>
    </div>
    \` : ''}

    <div class="messages-container">
        \${relevantMessages.length > 0 
            ? relevantMessages.map(m => \`
                <div class="message \${m.role === 'user' ? 'user' : 'bot'}">
                    <div class="role">\${m.role === 'user' ? 'Tú' : 'Tutor Edú'}</div>
                    <div class="content">\${m.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                </div>
            \`).join('')
            : '<div class="message"><div class="content">No hay mensajes en este módulo todavía.</div></div>'
        }
    </div>
    
    <div class="footer">
        \${isBuilder 
          ? 'Generado por Eduglobal365 | Track Constructor - Metodología "Build with Purpose"<br>Este paquete incluye tu proyecto, documentación técnica y recursos para trabajar offline.'
          : 'Generado por tecnología SAS BIC - Educación para todos.<br>Puedes abrir este archivo en cualquier navegador sin conexión a internet.'
        }
    </div>

    <script>
      if ('serviceWorker' in navigator) {
        const swCode = \`
          const CACHE_NAME = 'eduglobal-offline-pkg-v1';
          self.addEventListener('install', (e) => {
            self.skipWaiting();
          });
          self.addEventListener('fetch', (e) => {
            e.respondWith(
              caches.match(e.request).then(response => {
                return response || fetch(e.request);
              })
            );
          });
        \`;
        const blob = new Blob([swCode], {type: 'application/javascript'});
        const swUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(swUrl).then(() => {
          console.log('Offline mode ready for this package.');
        }).catch(err => {
          console.warn('Service worker not registered in file:// protocol, but HTML still works offline.');
        });
      }
    </script>
</body>
</html>\`;

      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      const safeSubject = subject.replace(/\\s+/g, '_').replace(/[^\\w\\-]/g, '');
      link.download = isBuilder 
        ? \`Eduglobal_Constructor_\${safeSubject}.html\` 
        : \`Eduglobal_Estudiante_\${safeSubject}_Offline.html\`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error("Error generating offline package:", error);
      return false;
    }
  },

  /**
   * Generates a PDF fallback package.
   */
  generatePDFPackage: async (subject: string, track: UserRole = 'student') => {
    const messages = await StorageService.loadSubjectChat(subject, track);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return false;
    
    printWindow.document.write(\`
      <html>
        <head>
          <title>Guía de Estudio - Eduglobal365</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
            .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
            .user { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; }
            .model { background-color: #f8fafc; border-left: 4px solid #8b5cf6; }
            .role { font-weight: bold; margin-bottom: 5px; color: #1e40af; }
          </style>
        </head>
        <body>
          <h1>Guía de Estudio Offline - \${subject}</h1>
          <p><em>Generado por Eduglobal365 - Formato PDF</em></p>
          <br/>
          \${messages.length > 0 ? messages.map(m => \`
            <div class="message \${m.role}">
              <div class="role">\${m.role === 'user' ? 'Estudiante' : 'Tutor Edú'}</div>
              <div>\${m.text.replace(/\\n/g, '<br/>')}</div>
            </div>
          \`).join('') : '<p>No hay historial de conversación en este módulo aún.</p>'}
        </body>
      </html>
    \`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);

    return true;
  },

  /**
   * Exports chat history and state to a JSON backup (OfflinePackage format).
   */
  generateJSONBackup: async (subject: string, track: UserRole = 'student') => {
    try {
      console.log(\`✅ Generando paquete offline JSON para: \${subject}...\`);

      const studentProfile = await StorageService.getStudentProfile();
      const allMaterials = await StorageService.getCourseMaterials(subject);
      const recentMaterials = allMaterials.slice(-20);
      
      const storedMessages = await StorageService.loadSubjectChat(subject, track);
      
      const educationalMessages = storedMessages.filter(m => 
        m.role === 'model' && (
          m.text.includes('[📥 MODO OFFLINE]') ||
          m.text.includes('[RETO_VEREDA]') ||
          m.text.includes('[QUIZ_FLASH]') ||
          m.text.includes('DBA-') ||
          m.text.length > 50
        )
      );

      const dbaCodesSet = new Set<string>();
      recentMaterials.forEach(m => { if (m.dbaCode) dbaCodesSet.add(m.dbaCode); });
      educationalMessages.forEach(m => { 
        const match = m.text.match(/DBA-[A-Z0-9-]+/);
        if (match) dbaCodesSet.add(match[0]); 
      });
      
      const regionId = studentProfile?.region || 'bogota';
      const regionConfig = COLOMBIA_REGIONS[regionId] || COLOMBIA_REGIONS['bogota'];
      const regionalExamples = regionConfig?.examples ? regionConfig.examples.slice(0, 5) : [];

      const jsonString = JSON.stringify({
        messages: educationalMessages,
        materials: recentMaterials,
        profile: studentProfile
      });
      const estimatedSizeMB = (jsonString.length * 2) / (1024 * 1024);

      const packageData: OfflinePackage = {
        metadata: {
          version: "1.0.0",
          createdAt: new Date().toISOString(),
          subject: subject,
          userRole: track,
          studentName: studentProfile?.name || "Estudiante",
          region: regionConfig?.name || "Colombia",
          grade: studentProfile?.grade || "11°",
          estimatedSizeMB: Math.round(estimatedSizeMB * 100) / 100,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        content: {
          messages: educationalMessages,
          materials: recentMaterials,
          studentProfile: studentProfile || {},
          systemInstructions: "SYSTEM_INSTRUCTIONS_V5_1",
          regionalExamples: regionalExamples,
          dbaCodesCovered: Array.from(dbaCodesSet)
        },
        manifest: {
          totalMessages: educationalMessages.length,
          totalMaterials: recentMaterials.length,
          totalAudioFiles: recentMaterials.filter(m => m.hasAudio).length,
          hasSimulation: educationalMessages.some(m => 
            m.text.includes("SIMULACRO") || (m.text.includes("Pregunta") && m.text.includes("de 5"))
          ),
          lastSyncTimestamp: Date.now()
        }
      };

      const packageJSON = JSON.stringify(packageData, null, 2);
      const blob = new Blob([packageJSON], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const sanitizedSubject = subject.replace(/\\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const sanitizedName = (studentProfile?.name || "estudiante").replace(/\\s+/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = \`eduglobal365_\${sanitizedSubject}_\${dateStr}_\${sanitizedName}.json\`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      await StorageService.addToSyncQueue({
        type: 'progress',
        payload: {
          action: 'offline_package_generated',
          subject: subject,
          filename: filename,
          sizeMB: estimatedSizeMB,
          timestamp: Date.now()
        }
      });

      return true;
    } catch (error) {
      console.error("❌ Error generating JSON backup:", error);
      return false;
    }
  },

  /**
   * Importa un paquete offline generado por otro estudiante o dispositivo.
   */
  importOfflinePackage: async (file: File): Promise<boolean> => {
    try {
      console.log(\`✅ Importando paquete offline: \${file.name}...\`);

      const text = await file.text();
      const packageData: OfflinePackage = JSON.parse(text);

      if (!packageData.metadata || !packageData.content || !packageData.manifest) {
        throw new Error("Formato de paquete inválido");
      }

      if (!packageData.metadata.version.startsWith("1.")) {
        console.warn("⚠️ Versión de paquete diferente. Podría haber incompatibilidades.");
      }

      const { subject, userRole, studentName } = packageData.metadata;
      const { messages, materials, studentProfile } = packageData.content;

      if (messages.length > 0) {
        const existingMessages = await StorageService.loadSubjectChat(subject, userRole);
        const mergedMessages = [...existingMessages, ...messages];
        
        const uniqueMessages = mergedMessages.filter((msg, index, self) => 
          index === self.findIndex(m => m.id === msg.id)
        );
        
        await StorageService.saveSubjectChat(subject, uniqueMessages, userRole);
      }

      if (materials.length > 0) {
        for (const material of materials) {
          await StorageService.saveCourseMaterial(material);
        }
      }

      if (studentProfile && Object.keys(studentProfile).length > 0) {
        const currentProfile = await StorageService.getStudentProfile();
        if (currentProfile) {
          const mergedProfile: StudentProfile = {
            ...currentProfile,
            ...studentProfile,
            points: Math.max(currentProfile.points || 0, studentProfile.points || 0),
            streak: Math.max(currentProfile.streak || 0, studentProfile.streak || 0),
            progress: {
              completedModules: [
                ...new Set([
                  ...(currentProfile.progress?.completedModules || []),
                  ...(studentProfile.progress?.completedModules || [])
                ])
              ],
              quizScores: {
                ...currentProfile.progress?.quizScores,
                ...studentProfile.progress?.quizScores
              }
            }
          };
          await StorageService.saveStudentProfile(mergedProfile);
        } else {
          await StorageService.saveStudentProfile(studentProfile as StudentProfile);
        }
      }

      await StorageService.addToSyncQueue({
        type: 'progress',
        payload: {
          action: 'offline_package_imported',
          sourceSubject: subject,
          sourceStudent: studentName,
          filename: file.name,
          timestamp: Date.now()
        }
      });

      return true;
    } catch (error) {
      console.error("❌ Error importando paquete offline:", error);
      alert("Error al importar el paquete. Asegúrate de que sea un archivo .json válido de EduGlobal365.");
      return false;
    }
  },

  /**
   * Genera un resumen de texto plano (markdown) para imprimir o guardar como .txt.
   */
  generatePlainTextGuide: async (subject: string, userRole: UserRole): Promise<string> => {
    const messages = await StorageService.loadSubjectChat(subject, userRole);
    const materials = await StorageService.getCourseMaterials(subject);
    const profile = await StorageService.getStudentProfile();
    
    const region = profile?.region ? COLOMBIA_REGIONS[profile.region]?.name : 'Colombia';
    
    let guide = \`========================================\\n\`;
    guide += \`  EDUGLOBAL365 - GUÍA DE ESTUDIO OFFLINE\\n\`;
    guide += \`  Asignatura: \${subject}\\n\`;
    guide += \`  Región: \${region}\\n\`;
    guide += \`  Fecha: \${new Date().toLocaleDateString('es-CO')}\\n\`;
    guide += \`========================================\\n\\n\`;
    
    guide += \`--- CONTENIDO CURADO ---\\n\\n\`;
    
    materials.forEach((m, i) => {
      guide += \`[\${i + 1}] \${m.topic}\\n\`;
      guide += \`DBA: \${m.dbaCode}\\n\`;
      guide += \`\${m.textContent.substring(0, 500)}...\\n\\n\`;
    });
    
    guide += \`--- RETOS Y PREGUNTAS ---\\n\\n\`;
    
    const challenges = messages.filter(m => 
      m.role === 'model' && (
        m.text.includes('[RETO_VEREDA]') || 
        m.text.includes('[QUIZ_FLASH]')
      )
    );
    
    challenges.forEach((c, i) => {
      guide += \`Reto \${i + 1}:\\n\${c.text.replace(/\\[RETO_VEREDA\\]|\\[QUIZ_FLASH\\]/g, '').trim()}\\n\\n\`;
    });
    
    guide += \`--- CIERRE OFFLINE ---\\n\`;
    guide += \`Recuerda: El proceso es más importante que la respuesta final.\\n\`;
    guide += \`¡Vamos con toda!\\n\`;
    
    const blob = new Blob([guide], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = \`guia_\${subject.replace(/\\s+/g, '_')}.txt\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return guide;
  },

  /**
   * Verifica si hay paquetes offline expirados y los limpia.
   */
  cleanupExpiredPackages: async (): Promise<number> => {
    try {
      const allSubjects = ["Matemáticas", "Inglés", "Sociales y Ciudadanas", "Ciencias Naturales", "Humanidades"];
      let cleaned = 0;
      
      for (const subject of allSubjects) {
        const messages = await StorageService.loadSubjectChat(subject, 'student');
        const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 días
        const recentMessages = messages.filter(m => m.timestamp > cutoff);
        
        if (recentMessages.length < messages.length) {
          await StorageService.saveSubjectChat(subject, recentMessages, 'student');
          cleaned += (messages.length - recentMessages.length);
        }
      }
      
      console.log(\`✅ Limpieza completada: \${cleaned} mensajes antiguos eliminados\`);
      return cleaned;
    } catch (error) {
      console.error("Error en limpieza:", error);
      return 0;
    }
  }
};
`
fs.writeFileSync('services/downloadService.ts', content);
