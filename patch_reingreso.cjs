const fs = require('fs');
let content = fs.readFileSync('components/LandingPage.tsx', 'utf8');

const oldHandle = `      if (cred.user.displayName) setLocalName(cred.user.displayName.split(' ')[0]);
      setShowStudentOnboarding(true);`;

const newHandle = `      if (cred.user.displayName) setLocalName(cred.user.displayName.split(' ')[0]);
      if (localStorage.getItem('eduglobal_legal_accepted') === 'true') {
        onStart();
      } else {
        setShowStudentOnboarding(true);
      }`;

content = content.replace(oldHandle, newHandle);
fs.writeFileSync('components/LandingPage.tsx', content);
