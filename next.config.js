module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Proxy to backend
      },
      {
        source: '/users/:path*',
        destination: 'http://localhost:3001/users/:path*', // Proxy to backend
      },
      {
        source: '/users',
        destination: 'http://localhost:3001/users', // Proxy to backend
      },
    ];
  },
};
