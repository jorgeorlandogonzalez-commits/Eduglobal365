const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf-8');

// 1. Add imports
app = app.replace(
  "import { webLLMInstance } from './services/webLLMService';",
  "import { webLLMInstance } from './services/webLLMService';\nimport PaymentModal from './components/PaymentModal';\nimport { checkSubscriptionStatus } from './services/paymentService';\nimport { checkPrivilegedAccess, PrivilegedStatus } from './services/privilegedAccessService';"
);

// 2. Add states
const stateInsertionPoint = "const [messages, setMessages] = useState<Message[]>([]);";
app = app.replace(
  stateInsertionPoint,
  stateInsertionPoint + `\n  const [showPaymentModal, setShowPaymentModal] = useState(false);\n  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);\n  const [privilegedStatus, setPrivilegedStatus] = useState<PrivilegedStatus>({ isPrivileged: false });`
);

// 3. Add useEffect and handlePaymentSuccess
const effectInsertionPoint = "  useEffect(() => {\n    const initApp = async () => {";
const effectToAdd = `  useEffect(() => {
    const checkSub = async () => {
      if (currentView === 'LANDING' || currentView === 'TEACHER_PORTAL') {
        setSubscriptionActive(true);
        return;
      }
      if (!auth.currentUser) return;
      
      const privileged = checkPrivilegedAccess();
      setPrivilegedStatus(privileged);
      
      const status = await checkSubscriptionStatus();
      setSubscriptionActive(status.active);
      
      if (!status.active && !privileged.isPrivileged) {
        setShowPaymentModal(true);
      }
    };
    checkSub();
  }, [currentView, auth.currentUser]);

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    const status = await checkSubscriptionStatus();
    setSubscriptionActive(status.active);
    alert('🎉 ¡Bienvenid@ a EduGlobal365! Tu suscripción está activa.');
  };

`;
app = app.replace(effectInsertionPoint, effectToAdd + effectInsertionPoint);

// 4. Add Paywall render before MAIN APP LAYOUT
const mainAppLayoutRegex = /\/\/ ==========================================================================\s*\/\/ RENDER: MAIN APP LAYOUT\s*\/\/ ==========================================================================/;
const paywallRender = `if (subscriptionActive === false && 
      currentView !== 'LANDING' && 
      currentView !== 'TEACHER_PORTAL' && 
      auth.currentUser &&
      !privilegedStatus.isPrivileged) {
    return (
      <PaymentModal
        userEmail={auth.currentUser.email || ''}
        userName={student.name}
        onSuccess={handlePaymentSuccess}
        onClose={() => {
          setShowPaymentModal(false);
          setCurrentView('LANDING');
        }}
      />
    );
  }

  // ==========================================================================
  // RENDER: MAIN APP LAYOUT
  // ==========================================================================`;
app = app.replace(mainAppLayoutRegex, paywallRender);

// 5. Add Header Badge and restore APP_NAME
const headerRegex = /<img src="\/logo\.png" alt="EduGlobal365" className="h-12 md:h-14 w-auto object-cover scale-\[1\.35\]" \/>\s*<\/div>\s*<div>/;
const headerReplacement = `<img src="/logo.png" alt="EduGlobal365" className="h-12 md:h-14 w-auto object-cover scale-[1.35]" />
          </div>
          <div>
            <div className="flex items-center">
              <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-none">{APP_NAME}</h1>
              {privilegedStatus.isPrivileged && (
                <div className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-300 dark:border-amber-700 animate-pulse">
                  {privilegedStatus.label}
                </div>
              )}
            </div>`;
app = app.replace(headerRegex, headerReplacement);

// 6. Sidebar Sub Status & "Mi Suscripción" button
// Find "Módulos de Estudio" in sidebar
const sidebarRegex = /<h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Módulos de Estudio<\/h3>/;
const sidebarReplacement = `{auth.currentUser && (
            <div className={\`mt-3 mb-4 p-3 rounded-lg border text-xs \${
              privilegedStatus.isPrivileged 
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }\`}>
              <div className="flex items-center gap-2">
                <span>{privilegedStatus.isPrivileged ? '👑' : '✅'}</span>
                <span className="font-bold">
                  {privilegedStatus.isPrivileged 
                    ? 'Acceso Pruebas (Gratuito)' 
                    : 'Suscripción Activa'}
                </span>
              </div>
              {auth.currentUser.email && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {auth.currentUser.email}
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => setShowPaymentModal(true)}
            className="mb-4 w-full flex items-center justify-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/50"
          >
            <span>💳</span>
            Mi Suscripción
          </button>
          
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Módulos de Estudio</h3>`;
app = app.replace(sidebarRegex, sidebarReplacement);

fs.writeFileSync('App.tsx', app, 'utf-8');
console.log("App patched");
