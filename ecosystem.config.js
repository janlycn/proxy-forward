module.exports = {
  apps: [
    {
      name: 'proxy-forward',
      script: 'dist/index.js',
      args: '',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
    },
  ],
};
