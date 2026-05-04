import fs from 'fs';
fetch('https://myself-chi-ochre.vercel.app/')
  .then(res => res.text())
  .then(text => fs.writeFileSync('original.html', text))
  .catch(console.error);
