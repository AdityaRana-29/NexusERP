import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Mini ERP + CRM Server running on http://localhost:${PORT}`);
});
