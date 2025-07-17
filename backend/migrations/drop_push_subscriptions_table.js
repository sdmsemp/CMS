const { sequelize } = require('../src/config/dbConfig');

async function dropPushSubscriptionsTable() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS push_subscriptions');
    console.log('Push subscriptions table dropped successfully');
  } catch (error) {
    console.error('Error dropping push subscriptions table:', error);
  } finally {
    await sequelize.close();
  }
}

dropPushSubscriptionsTable(); 