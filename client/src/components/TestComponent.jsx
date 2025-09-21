export const TestComponent = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          If you can see this styled properly, Tailwind CSS is working!
        </p>
        <button className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Test Button
        </button>
      </div>
    </div>
  );
};