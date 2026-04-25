module.exports = {
  apps: [
    {
      name: "vertex-web",
      cwd: "/opt/vertex-markets",
      script: "pnpm",
      args: "--filter @vertex/web start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "vertex-main-api",
      cwd: "/opt/vertex-markets",
      script: "pnpm",
      args: "--filter @vertex/main-api start",
      env: {
        NODE_ENV: "production",
        MAIN_API_PORT: 4000
      }
    },
    {
      name: "vertex-chart-api",
      cwd: "/opt/vertex-markets",
      script: "pnpm",
      args: "--filter @vertex/chart-api start",
      env: {
        NODE_ENV: "production",
        CHART_API_PORT: 4100
      }
    }
  ]
};

