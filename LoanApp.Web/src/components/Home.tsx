const Home = () => {
  return (
    <div className="min-h-screen bg-blue-100 text-gray-900 font-sans">
      <main className="flex bg-blue-100 items-center justify-center py-24 px-4">
        <div className="text-center max-w-3xl">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your Loan, Streamlined.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Manage and apply for loans with speed, security, and simplicity.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <a
              href="/loan-applications"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Get Started
            </a>
            <a
              href="/users"
              className="px-6 py-3 border border-gray-300 rounded-lg text-indigo-600 hover:bg-gray-100 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;