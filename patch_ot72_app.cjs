const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf-8');

const targetStr = `              Reiniciar Campus (Demo)
            </button>`;

const replacement = `              Reiniciar Campus (Demo)
            </button>

            {auth?.currentUser && (
              <div className={\`mt-3 p-3 rounded-lg border text-xs \${
                privilegedStatus.isPrivileged
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }\`}>
                <div className="flex items-center gap-2">
                  <span>{privilegedStatus.isPrivileged ? '👑' : '✅'}</span>
                  <span className="font-bold">
                    {privilegedStatus.isPrivileged ? 'Acceso Pruebas (Gratuito)' : 'Suscripción Activa'}
                  </span>
                </div>
                {auth?.currentUser.email && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {auth?.currentUser.email}
                  </p>
                )}
              </div>
            )}
            {auth?.currentUser && !privilegedStatus.isPrivileged && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/50"
              >
                <span>💳</span>
                Mi Suscripción
              </button>
            )}`;

app = app.replace(targetStr, replacement);
fs.writeFileSync('App.tsx', app, 'utf-8');
console.log("App.tsx patched.");
