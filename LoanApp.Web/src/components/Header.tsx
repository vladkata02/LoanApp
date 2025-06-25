export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">LoanApp</h1>
        <nav>
          <a href="/" className="px-3 hover:text-indigo-400">Home</a>
          <a href="/users" className="px-3 hover:text-indigo-400">Users</a>
          <a href="/loan-applications" className="px-3 hover:text-indigo-400">Loans</a>
        </nav>
      </div>
    </header>
  );
}