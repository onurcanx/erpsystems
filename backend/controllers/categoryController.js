exports.getCategories = (req, res) => {
  const categories = [
    'Elektronik',
    'Gıda',
    'Temizlik',
    'Kırtasiye',
    'Tekstil',
    'Yapı Malzemeleri',
    'Diğer'
  ];
  res.json(categories);
}; 