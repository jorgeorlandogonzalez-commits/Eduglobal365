const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf8');

// Use effect for loading state
app = app.replace(
  /const \[currentView, setCurrentView\] = useState<AppView>\(\(\) => StorageService\.loadAppState\(\)\?\.currentView \|\| 'LANDING'\);/g,
  `const [currentView, setCurrentView] = useState<AppView>('LANDING');\n  const [isReady, setIsReady] = useState(false);`
);

app = app.replace(
  /const \[activeSubject, setActiveSubject\] = useState<string \| null>\(\(\) => StorageService\.loadAppState\(\)\?\.activeSubject \|\| null\);/g,
  `const [activeSubject, setActiveSubject] = useState<string | null>(null);`
);

app = app.replace(
  /const \[userRole, setUserRole\] = useState<UserRole>\(\(\) => StorageService\.loadAppState\(\)\?\.userRole \|\| 'student'\);/g,
  `const [userRole, setUserRole] = useState<UserRole>('student');`
);

app = app.replace(
  /const \[messages, setMessages\] = useState<Message\[\]>\(\(\) => \{[\s\S]*?\}\);/g,
  `const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    async function loadState() {
      const state = await StorageService.loadAppState();
      if (state) {
        setCurrentView(state.currentView);
        setActiveSubject(state.activeSubject);
        setUserRole(state.userRole);
        const msgs = await StorageService.loadSubjectChat(state.activeSubject, state.userRole);
        setMessages(msgs);
      }
      setIsReady(true);
    }
    loadState();
  }, []);`
);

app = app.replace(
  /StorageService\.saveAppState\(currentView, activeSubject, userRole\);/g,
  `StorageService.saveAppState(currentView, activeSubject, userRole);` // Already ok since return value isn't used
);

app = app.replace(
  /StorageService\.saveSubjectChat\(activeSubject, messages, userRole\);/g,
  `StorageService.saveSubjectChat(activeSubject, messages, userRole);` // Already ok
);

app = app.replace(
  /return \(\n    <div className="min-h-screen/g,
  `if (!isReady) return null;
  return (
    <div className="min-h-screen`
);

fs.writeFileSync('App.tsx', app);
