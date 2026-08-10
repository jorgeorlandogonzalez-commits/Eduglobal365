const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `  // --- STATE: App Core ---
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = StorageService.loadAppState();
    return saved?.currentView || 'LANDING';
  });
  const [activeSubject, setActiveSubject] = useState<string | null>(() => {
    const saved = StorageService.loadAppState();
    return saved?.activeSubject || null;
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = StorageService.loadAppState();
    return saved?.userRole || 'student';
  });
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = StorageService.loadAppState();
    const subject = saved?.activeSubject;
    const track = saved?.userRole || 'student';
    return StorageService.loadSubjectChat(subject, track);
  });`;

const replacement = `  // --- STATE: App Core ---
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const initApp = async () => {
      const saved = await StorageService.loadAppState();
      if (saved) {
        setCurrentView(saved.currentView);
        setActiveSubject(saved.activeSubject);
        setUserRole(saved.userRole);
        if (saved.activeSubject) {
          const msgs = await StorageService.loadSubjectChat(saved.activeSubject, saved.userRole);
          setMessages(msgs);
        }
      }
    };
    initApp();
  }, []);`;

code = code.replace(target, replacement);
fs.writeFileSync('App.tsx', code);
console.log("Done");
