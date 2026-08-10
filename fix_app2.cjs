const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const regex = /  \/\/ --- STATE: App Core ---[\s\S]*?const \[inputText, setInputText\] = useState\(''\);/;

const replacement = `  // --- STATE: App Core ---
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const saved = await StorageService.loadAppState();
        if (saved) {
          setCurrentView(saved.currentView);
          setActiveSubject(saved.activeSubject);
          setUserRole(saved.userRole);
          if (saved.activeSubject) {
            const msgs = await StorageService.loadSubjectChat(saved.activeSubject, saved.userRole);
            setMessages(msgs || []);
          }
        }
      } catch (e) {
        console.error('Error loading app state', e);
      }
    };
    initApp();
  }, []);

  const [inputText, setInputText] = useState('');`;

code = code.replace(regex, replacement);

// Also fix loadSubjectChat usages (adding await)
code = code.replace(/const history = StorageService\.loadSubjectChat/g, 'const history = await StorageService.loadSubjectChat');
code = code.replace(/let history = StorageService\.loadSubjectChat/g, 'let history = await StorageService.loadSubjectChat');
code = code.replace(/const subjectHistory = StorageService\.loadSubjectChat/g, 'const subjectHistory = await StorageService.loadSubjectChat');

fs.writeFileSync('App.tsx', code);
console.log("Done");
