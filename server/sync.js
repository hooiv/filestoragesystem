const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced');
  } catch (err) {
    console.error('Database sync failed:', err);
  }
})();
