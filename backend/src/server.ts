import { httpServer } from './app';

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🍽️ Restaurant Ordering System Backend`);
});