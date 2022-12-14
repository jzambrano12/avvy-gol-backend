export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  DB_PORT: parseInt(process.env.DB_PORT, 5432),
  DB_HOST: process.env.DB_HOST,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
});
