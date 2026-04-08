const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/frontend')
  .filter(f => f.endsWith('.html'))
  .map(f => path.join('src/frontend', f));
files.push(path.join('src/frontend', 'css', 'styles.css'));

files.forEach(file => {
  let text = fs.readFileSync(file, 'utf8');
  
  // Replace Google Fonts URL
  text = text.replace(
    /family=Inter:wght@400;500;600;700;800&family=Syne:wght@600;700;800/g,
    'family=Outfit:wght@500;600;700;800&family=Plus\\+Jakarta\\+Sans:wght@400;500;600;700'
  );
  
  // Replace font families
  text = text.replace(/'Syne'/g, "'Outfit'");
  text = text.replace(/'Inter'/g, "'Plus Jakarta Sans'");
  
  fs.writeFileSync(file, text);
  console.log('Updated ' + file);
});
