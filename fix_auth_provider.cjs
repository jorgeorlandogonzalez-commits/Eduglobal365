const fs = require('fs');
let code = fs.readFileSync('components/AuthProvider.tsx', 'utf8');

const regex = /            const userDoc = await getDoc\(doc\(db, 'users', currentUser\.uid\)\);\n            if \(!userDoc\.exists\(\)\) \{ \n                await setDoc\(doc\(db, 'users', currentUser\.uid\), \{/g;

const replacement = `            let userDoc;
            try {
              userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            } catch (err: any) {
              console.warn("⚠️ No se pudo obtener el perfil de usuario (posiblemente offline). Omitiendo creación de perfil por defecto.");
            }
            
            if (userDoc && !userDoc.exists()) { 
                await setDoc(doc(db, 'users', currentUser.uid), {`;

if (code.includes('const userDoc = await getDoc(doc(db, \'users\', currentUser.uid));')) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('components/AuthProvider.tsx', code);
  console.log("Done");
} else {
  console.log("Not found");
}
