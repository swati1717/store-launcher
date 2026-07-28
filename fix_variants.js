const fs = require('fs');

const path = '/Users/swatipandey/Documents/HotWax Commerce AI/new_products_bulk.jsonl';
const lines = fs.readFileSync(path, 'utf-8').trim().split('\n');

const newLines = lines.map(line => {
  if (!line) return '';
  const obj = JSON.parse(line);
  
  if (obj.input && obj.input.variants && obj.input.files) {
    obj.input.variants = obj.input.variants.map(variant => {
      // Find the color option value
      const colorOption = variant.optionValues.find(opt => opt.optionName === 'Color');
      if (colorOption && colorOption.name) {
        const colorLower = colorOption.name.toLowerCase();
        
        // Find a matching file
        const matchingFile = obj.input.files.find(f => 
          f.originalSource && f.originalSource.toLowerCase().includes(colorLower)
        );
        
        if (matchingFile) {
          // Add the file mapping to the variant
          variant.file = {
            originalSource: matchingFile.originalSource,
            contentType: matchingFile.contentType || "IMAGE"
          };
        }
      }
      return variant;
    });
  }
  
  return JSON.stringify(obj);
});

fs.writeFileSync(path, newLines.join('\n'));
console.log('Fixed variants!');
