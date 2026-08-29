const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf-8');

// 1.1 Add signOut import
if (!app.includes("import { signOut } from 'firebase/auth';")) {
  app = app.replace("import type { User } from 'firebase/auth';", "import type { User } from 'firebase/auth';\nimport { signOut } from 'firebase/auth';");
}

// 1.2 Add handleLogout handler
const logoutHandler = `  const handleLogout = async () => {
    try {
      // Cerrar sesión de Firebase
      if (auth?.currentUser) {
        await signOut(auth);
      }
      // Limpiar estado de sesión actual (NO datos de progreso)
      setCurrentView('LANDING');
      setActiveSubject(null);
      setMessages([]);
      setSimulationState({ isActive: false, currentQuestion: 0, totalQuestions: 5 });
      setInputText('');
      setIsSidebarOpen(false);
      setShowPaymentModal(false);
      setSubscriptionActive(null);
      setPrivilegedStatus({ isPrivileged: false });
      setUserRole('student');
      console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Fallback: regresar al landing sin cerrar Firebase
      setCurrentView('LANDING');
      setActiveSubject(null);
    }
  };

`;
app = app.replace("  const handleResetCampus = () => {", logoutHandler + "  const handleResetCampus = () => {");

// 2. Add logout button in header
const logoutBtnCode = `          {currentView !== 'LANDING' && auth?.currentUser && (
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="md:hidden p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors mr-2"
                title="Cerrar sesión y volver al inicio"
                aria-label="Cerrar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full border border-red-200 dark:border-red-800/50 transition-colors mr-3"
                title="Cerrar sesión y volver al inicio"
                aria-label="Cerrar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </button>
            </div>
          )}
`;

app = app.replace("          <button\n            onClick={() => setIsDarkMode(!isDarkMode)}", logoutBtnCode + "          <button\n            onClick={() => setIsDarkMode(!isDarkMode)}");

fs.writeFileSync('App.tsx', app, 'utf-8');
console.log("Done patching App.tsx");
