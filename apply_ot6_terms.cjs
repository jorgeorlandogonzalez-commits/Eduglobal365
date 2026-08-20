const fs = require('fs');
let terms = fs.readFileSync('public/legal/terms.html', 'utf-8');

terms = terms.replace(/Versión:<\/strong> 2\.1/g, 'Versión:</strong> 2.2');
terms = terms.replace(/Versión 2\.1 - 2026/g, 'Versión 2.2 - 2026');

const newTerms = `  <h2>13. Habilidades para la Vida y Certificados</h2>
  <p>La categoría "Habilidades para la Vida" es formación <strong>NO formal</strong>. Al completar un curso, EduGlobal365 emite un <strong>certificado de finalización</strong> que acredita el esfuerzo y la aprobación del curso, pero que <strong>NO otorga títulos oficiales de bachillerato ni educación formal</strong> reconocidos por el MEN. Los certificados son de carácter privado y de utilidad laboral/comercial.</p>
  
  <h2>14. Suscripción Única</h2>
  <p>Una única suscripción ($49.900/mes o $499.000/año) da acceso a ambas categorías: Formación Académica y Habilidades para la Vida. No existen cobros separados por categoría.</p>
  
  <div class="footer">`;

terms = terms.replace(/<div class="footer">/, newTerms);
fs.writeFileSync('public/legal/terms.html', terms, 'utf-8');
console.log("Done");
