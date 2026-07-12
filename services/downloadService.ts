// src/services/downloadService.ts
import { Message, UserRole, BuilderProject } from "../config/types";
import { APP_NAME } from "../config/constants";

export const DownloadService = {
  /**
   * Generates a "Smart Package" (HTML file) of the current session
   * structured for offline study on mobile devices.
   * 
   * @param subject - Nombre de la materia o proyecto
   * @param messages - Historial de mensajes a exportar
   * @param track - Rol del usuario ('student' | 'builder') para aislamiento Dual-Track
   * @param project - (Opcional) Proyecto del Track Constructor para incluir metadatos
   */
  generateOfflinePackage: (
    subject: string, 
    messages: Message[], 
    track: UserRole = 'student',  // ✅ NUEVO: Default 'student' para backward compatibility
    project?: BuilderProject      // ✅ NUEVO: Para incluir metadatos del Track Constructor
  ) => {
    try {
      // ✅ Filtrar mensajes por track si se proporciona (Dual-Track Isolation)
      const relevantMessages = messages.filter(m => 
        m.text.length > 0 && 
        (!track || !m.track || m.track === track)
      );

      // ✅ Determinar tipo de exportación según track
      const isBuilder = track === 'builder';
      
      // 2. Build the Content (HTML)
      let content = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${APP_NAME} | Paquete Offline: ${subject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .header { background: #1e293b; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; }
        .header p { margin: 0; color: #cbd5e1; font-size: 14px; }
        .builder-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 8px; }
        .message { background: white; padding: 15px 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .message.user { border-left: 4px solid #3b82f6; }
        .message.bot { border-left: 4px solid #10b981; }
        .role { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; color: #64748b; }
        .user .role { color: #3b82f6; }
        .bot .role { color: #10b981; }
        .offline-block { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 10px; border-radius: 0 8px 8px 0; }
        .offline-title { font-weight: bold; color: #b45309; margin-bottom: 5px; font-size: 14px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
        strong { color: #0f172a; }
        .code-block { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; overflow-x: auto; margin: 10px 0; }
        .metadata { background: #f1f5f9; padding: 12px; border-radius: 8px; margin: 10px 0; font-size: 13px; }
        .metadata-row { display: flex; justify-content: space-between; margin: 4px 0; }
        .metadata-label { color: #64748b; }
        .metadata-value { font-weight: 600; color: #0f172a; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎓 ${APP_NAME}</h1>
        <p>Paquete de Estudio Offline: <strong>${subject}</strong></p>
        ${isBuilder ? '<span class="builder-badge">🛠️ Track Constructor</span>' : ''}
        <p>Generado el: ${new Date().toLocaleDateString('es-CO')}</p>
    </div>
`;

      // ✅ Incluir metadatos del proyecto si es Track Constructor
      if (isBuilder && project) {
        content += `
    <div class="metadata">
        <div class="metadata-row"><span class="metadata-label">Proyecto:</span><span class="metadata-value">${project.title}</span></div>
        <div class="metadata-row"><span class="metadata-label">Estado:</span><span class="metadata-value">${project.status.replace('_', ' ')}</span></div>
        <div class="metadata-row"><span class="metadata-label">Stack Técnico:</span><span class="metadata-value">${project.techStack.join(', ')}</span></div>
        <div class="metadata-row"><span class="metadata-label">Impacto:</span><span class="metadata-value">${project.impactMetric}</span></div>
        ${project.offlineCapable ? '<div class="metadata-row"><span class="metadata-label">Offline:</span><span class="metadata-value">✅ Compatible</span></div>' : ''}
    </div>
`;
      }

      relevantMessages.forEach((msg) => {
        const isUser = msg.role === 'user';
        const roleName = isUser ? (isBuilder ? '👨‍💻 Constructor' : '🧑‍🎓 Estudiante') : (isBuilder ? '🤖 Asistente Constructor' : '🤖 Tutor Edú');
        const msgClass = isUser ? 'user' : 'bot';
        
        // Basic formatting for HTML
        let formattedText = msg.text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Highlight offline blocks
        const offlineRegex = /\[📥 MODO OFFLINE:([\s\S]*?)\]/i;
        const offlineMatch = msg.text.match(offlineRegex);
        
        if (offlineMatch) {
            const offlineContent = offlineMatch[1].trim().replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedText = formattedText.replace(offlineRegex, `
                <div class="offline-block">
                    <div class="offline-title">📥 MODO OFFLINE (Resumen Clave)</div>
                    ${offlineContent}
                </div>
            `);
        }

        // ✅ Comandos específicos para Track Constructor
        if (isBuilder) {
          formattedText = formattedText.replace(/\[CODE_SNIPPET\]/gi, '<em>[Fragmento de Código]</em><br>');
          formattedText = formattedText.replace(/\[ARCHITECTURE_TIP\]/gi, '<em>[Consejo de Arquitectura]</em><br>');
        } else {
          // ✅ Comandos específicos para Track Estudiante
          formattedText = formattedText.replace(/\[PODCAST_TRIGGER:\s*"([^"]+)"\]/gi, '<em>[Audio Podcast Sugerido: $1]</em><br>');
          formattedText = formattedText.replace(/\[VIDEO_SUGGESTION:\s*"([^"]+)"\]/gi, '<em>[Video Sugerido: $1]</em><br>');
          formattedText = formattedText.replace(/\[QUIZ_FLASH\]/gi, '<em>[Quiz Rápido]</em><br>');
          formattedText = formattedText.replace(/\[RETO_VEREDA\]/gi, '<em>[Reto de tu Región]</em><br>');
        }

        // ✅ Remover etiquetas UI no relevantes para exportación
        formattedText = formattedText.replace(/\[PODCAST_TRIGGER:[^\]]*\]/gi, '');
        formattedText = formattedText.replace(/\[VIDEO_SUGGESTION:[^\]]*\]/gi, '');
        formattedText = formattedText.replace(/\[QUIZ_FLASH\]/gi, '');
        formattedText = formattedText.replace(/\[RETO_VEREDA\]/gi, '');
        formattedText = formattedText.replace(/\[CODE_SNIPPET\]/gi, '');
        formattedText = formattedText.replace(/\[ARCHITECTURE_TIP\]/gi, '');

        content += `
    <div class="message ${msgClass}">
        <div class="role">${roleName}</div>
        <div>${formattedText}</div>
    </div>
`;
      });

      // ✅ Footer diferenciado por track
      content += `
    <div class="footer">
        ${isBuilder 
          ? 'Generado por Eduglobal365 | Track Constructor - Metodología "Build with Purpose"<br>Este paquete incluye tu proyecto, documentación técnica y recursos para trabajar offline.'
          : 'Generado por tecnología SAS BIC - Educación para todos.<br>Puedes abrir este archivo en cualquier navegador sin conexión a internet.'
        }
    </div>
</body>
</html>`;

      // 3. Create Blob and Trigger Download
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      // ✅ Nombre de archivo diferenciado por track
      const safeSubject = subject.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
      link.download = isBuilder 
        ? `Eduglobal_Constructor_${safeSubject}.html` 
        : `Eduglobal_Estudiante_${safeSubject}_Offline.html`;
      
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
   * ✅ NUEVO: Generates a package specifically for Builder Track projects
   * Includes project metadata, code snippets, and architecture documentation
   * 
   * @param project - Proyecto del Track Constructor
   * @param codeSnippets - (Opcional) Fragmentos de código a incluir
   * @param docs - (Opcional) Documentación técnica adicional
   */
  generateBuilderPackage: (
    project: BuilderProject, 
    codeSnippets?: string[], 
    docs?: string[]
  ) => {
    try {
      let content = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${APP_NAME} | Proyecto: ${project.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .header { background: #0f172a; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0 0 8px 0; font-size: 28px; }
        .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .section { background: white; padding: 20px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .section h2 { margin: 0 0 12px 0; color: #0f172a; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        .metadata-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 12px 0; }
        .metadata-item { background: #f1f5f9; padding: 12px; border-radius: 8px; }
        .metadata-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .metadata-value { font-weight: 600; color: #0f172a; }
        .code-block { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto; margin: 12px 0; white-space: pre-wrap; }
        .tech-stack { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
        .tech-tag { background: #10b981/10; color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-IDEA { background: #f59e0b/20; color: #b45309; }
        .status-IN_PROGRESS { background: #3b82f6/20; color: #1d4ed8; }
        .status-COMPLETED { background: #10b981/20; color: #059669; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
        .offline-notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 13px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛠️ ${project.title}</h1>
        <span class="badge">Track Constructor</span>
        <p style="margin: 8px 0 0 0; color: #cbd5e1;">${project.description}</p>
    </div>

    <div class="section">
        <h2>📋 Metadatos del Proyecto</h2>
        <div class="metadata-grid">
            <div class="metadata-item">
                <div class="metadata-label">Estado</div>
                <div><span class="status status-${project.status}">${project.status.replace('_', ' ')}</span></div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Creado</div>
                <div class="metadata-value">${new Date(project.createdAt).toLocaleDateString('es-CO')}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Actualizado</div>
                <div class="metadata-value">${new Date(project.updatedAt).toLocaleDateString('es-CO')}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Offline-First</div>
                <div class="metadata-value">${project.offlineCapable ? '✅ Sí' : '❌ No'}</div>
            </div>
        </div>
        <div class="metadata-item" style="margin-top: 12px;">
            <div class="metadata-label">Métrica de Impacto</div>
            <div class="metadata-value">${project.impactMetric}</div>
        </div>
        ${project.linkedSubjectId ? `
        <div class="metadata-item" style="margin-top: 12px;">
            <div class="metadata-label">Vinculado a Módulo Educativo</div>
            <div class="metadata-value">ID: ${project.linkedSubjectId} 🎓</div>
        </div>` : ''}
    </div>

    <div class="section">
        <h2>🔧 Stack Técnico</h2>
        <div class="tech-stack">
            ${project.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
    </div>

    ${codeSnippets && codeSnippets.length > 0 ? `
    <div class="section">
        <h2>💻 Fragmentos de Código</h2>
        ${codeSnippets.map((snippet, idx) => `
        <div style="margin-bottom: 16px;">
            <strong style="color: #64748b; font-size: 13px;">Snippet #${idx + 1}</strong>
            <div class="code-block">${snippet}</div>
        </div>
        `).join('')}
    </div>` : ''}

    ${docs && docs.length > 0 ? `
    <div class="section">
        <h2>📚 Documentación Técnica</h2>
        ${docs.map(doc => `<div style="margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 8px;">${doc.replace(/\n/g, '<br>')}</div>`).join('')}
    </div>` : ''}

    <div class="section">
        <h2>🏗️ Arquitectura Offline-First</h2>
        <div class="offline-notice">
            <strong>💡 Checklist para despliegue en zonas rurales:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                <li>✅ Todos los assets críticos cacheados localmente</li>
                <li>✅ Sincronización en diferido cuando hay conexión</li>
                <li>✅ Fallbacks para funcionalidades sin internet</li>
                <li>✅ Compresión de recursos para bajo ancho de banda</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        Generado por Eduglobal365 | Track Constructor<br>
        Metodología "Build with Purpose" - Impacto Social Medible<br>
        Este paquete puede abrirse sin conexión a internet en cualquier navegador moderno.
    </div>
</body>
</html>`;

      // Create Blob and Trigger Download
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = project.title.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
      link.download = `Eduglobal_Proyecto_${safeTitle}.html`;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Error generating builder package:", error);
      return false;
    }
  }
};