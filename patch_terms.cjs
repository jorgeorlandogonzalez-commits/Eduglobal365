const fs = require('fs');
let html = fs.readFileSync('public/legal/terms.html', 'utf8');

// Eliminar alert
html = html.replace(/<div class="alert">[\s\S]*?<\/div>/, '');

// Eliminar fila Solidaridad
html = html.replace(/<tr><td>Solidaridad<\/td><td>\$0<\/td><td>Jóvenes afectados por la emergencia, vía subsidio cruzado<\/td><\/tr>/, '');

// Eliminar Sección 13
html = html.replace(/<h2>13\. Plan Solidaridad y Subsidio Cruzado<\/h2>\s*<p>.*?<\/p>/, '');

// Cambiar Versión 2.0 -> Versión 2.1
html = html.replace(/Versión:<\/strong> 2\.0/g, 'Versión:</strong> 2.1');
html = html.replace(/Versión 2\.0/g, 'Versión 2.1');

fs.writeFileSync('public/legal/terms.html', html);
