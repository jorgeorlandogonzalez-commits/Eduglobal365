const fs = require('fs');

const content = `// src/services/downloadService.ts
import { Message, UserRole, BuilderProject } from "../config/types";
import { APP_NAME } from "../config/constants";
import { StorageService } from "./storageService";

export const DownloadService = {
  /**
   * Generates a "Smart Package" (HTML file) of the current session
   * structured for offline study on mobile devices.
   * 
   * @param subject - Nombre de la materia o proyecto
   * @param track - Rol del usuario ('student' | 'builder')
   * @param project - (Opcional) Proyecto del Track Constructor
   */
  generateOfflinePackage: async (
    subject: string,
    track: UserRole = 'student',
    project?: BuilderProject
  ): Promise<boolean> => {
    try {
      // 1. Obtener datos de IndexedDB usando StorageService (ASYNC)
      const messages = await StorageService.loadSubjectChat(subject, track);
      
      const relevantMessages = messages.filter(m => 
        m.text.length > 0 && 
        (!track || !m.track || m.track === track)
      );

      const isBuilder = track === 'builder';
      
      // 2. Build the Content (HTML con Service Worker inyectado para caché local)
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
      // Inyectar un mini Service Worker para que el HTML se comporte como app offline
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

      // 3. Create Blob and Trigger Download
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
      
      // Cleanup
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
   * Exports chat history and state to a JSON backup.
   */
  generateJSONBackup: async (subject: string, track: UserRole = 'student') => {
    try {
      const messages = await StorageService.loadSubjectChat(subject, track);
      const appState = await StorageService.loadAppState();
      const profile = await StorageService.getStudentProfile();

      const backupData = {
        subject,
        track,
        timestamp: Date.now(),
        appState,
        profile,
        messages
      };

      const content = JSON.stringify(backupData, null, 2);
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      const safeSubject = subject.replace(/\\s+/g, '_').replace(/[^\\w\\-]/g, '');
      link.download = \`Eduglobal_Backup_\${safeSubject}.json\`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error("Error generating JSON backup:", error);
      return false;
    }
  }
};
`;

fs.writeFileSync('services/downloadService.ts', content);
console.log('Updated services/downloadService.ts');
