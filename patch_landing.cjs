const fs = require('fs');
let code = fs.readFileSync('components/LandingPage.tsx', 'utf8');
const search = `  const { user, signIn } = useAuth();`;
const replace = `  const { user, signIn } = useAuth();
  
  const [showLegalConsent, setShowLegalConsent] = useState(() => {
    try { return localStorage.getItem('eduglobal_legal_accepted') !== 'true'; } catch { return true; }
  });

  const handleLegalAccept = () => {
    try {
      localStorage.setItem('eduglobal_legal_accepted', 'true');
      localStorage.setItem('eduglobal_legal_date', new Date().toISOString());
    } catch (e) { console.warn('No se pudo guardar consentimiento'); }
    setShowLegalConsent(false);
  };

  const handleLegalDecline = () => {
    alert('Sin aceptar los términos no es posible usar la plataforma. Si cambias de opinión, recarga la página.');
  };`;
code = code.replace(search, replace);

const search2 = `  return (`;
const replace2 = `  if (showLegalConsent) {
    return <LegalConsent onAccept={handleLegalAccept} onDecline={handleLegalDecline} />;
  }

  return (`;
code = code.replace(search2, replace2);

fs.writeFileSync('components/LandingPage.tsx', code);
