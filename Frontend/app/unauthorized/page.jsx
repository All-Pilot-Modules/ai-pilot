// app/unauthorized/page.jsx or pages/unauthorized.jsx

export default function UnauthorizedPage() {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 px-6 transition-colors duration-300">
      <div className="max-w-md text-center rounded-2xl bg-white/60 dark:bg-white/10 p-10 backdrop-blur-md shadow-2xl border border-white/30 dark:border-white/20 transition-all duration-300">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
          You don't have permission to view this page. This section is restricted to authorized users only.
        </p>
        <a
          href="/"
          className="inline-block rounded-lg bg-black dark:bg-white text-white dark:text-gray-900 font-semibold px-6 py-3 hover:opacity-90 transition-all"
        >
          Go Back Home
        </a>
      </div>
    </div>
    );
  }