const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const search = `  const handleSendMessage = async (text: string, isSystemTrigger = false) => {
    if ((!text.trim() && !isSystemTrigger) || isLoading || text.length > 500) return;

    const isGemmaMode = !isOnline || forceGemmaLocal;

    if (isGemmaMode) {
      if (!isSystemTrigger) {
        const userMsg: Message = {
          id: generateUUID(),
          role: Role.USER,
          text: text,
          timestamp: Date.now(),
          track: userRole
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
      }
      setIsLoading(true);

      try {
        const aiResponseText = await sendMessageToGemini(messages, text, activeSubject, userRole, userRole);
        const aiMsg: Message = {
          id: generateUUID(),
          role: Role.MODEL,
          text: aiResponseText,
          timestamp: Date.now(),
          track: userRole
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
        console.error("Error en modo offline:", error);
        const errorMsg: Message = {
          id: generateUUID(),
          role: Role.MODEL,
          text: "⚠️ Error en el motor local. Intenta recargar o conecta internet.",
          timestamp: Date.now(),
          track: userRole
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // MODO ONLINE
    const userMsg: Message = {
      id: generateUUID(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
      track: userRole
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToGemini(messages, text, activeSubject, userRole, userRole);
      const aiMsg: Message = {
        id: generateUUID(),
        role: Role.MODEL,
        text: aiResponseText,
        timestamp: Date.now(),
        track: userRole
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      const errorMsg: Message = {
        id: generateUUID(),
        role: Role.MODEL,
        text: "⚠️ Error de conexión. Intenta activar el modo local (🤖) o revisa tu internet.",
        timestamp: Date.now(),
        track: userRole
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };`;

const replace = `  const handleSendMessage = async (text: string, isSystemTrigger = false) => {
    if ((!text.trim() && !isSystemTrigger) || isLoading || text.length > 500) return;

    const hasNet = await checkRealConnection();
    const isGemmaMode = forceGemmaLocal || !hasNet;

    if (!isSystemTrigger) {
      const userMsg: Message = {
        id: generateUUID(),
        role: Role.USER,
        text: text,
        timestamp: Date.now(),
        track: userRole
      };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
    }
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToGemini(messages, text, activeSubject, userRole, userRole, forceGemmaLocal);
      const aiMsg: Message = {
        id: generateUUID(),
        role: Role.MODEL,
        text: aiResponseText,
        timestamp: Date.now(),
        track: userRole
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error en AI:", error);
      const errorMsg: Message = {
        id: generateUUID(),
        role: Role.MODEL,
        text: "⚠️ Error en el asistente. Intenta recargar.",
        timestamp: Date.now(),
        track: userRole
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };`;

code = code.replace(search, replace);
fs.writeFileSync('App.tsx', code);
