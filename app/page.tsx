import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-white mb-8">
          🏀 U20 Basketball Manager
        </h1>
        <p className="text-xl text-gray-200 mb-12">
          Build your team, train your players, and win the championship!
        </p>
        <Link
          href="/basketball"
          className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors inline-block mb-8"
        >
          Start Playing
        </Link>

        {/* GitHub Button */}
        <div className="mt-12 flex justify-center">
          <a
            href="https://github.com/guygir/u20-basketball-manager"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <span>⭐</span>
            <span>GitHub</span>
          </a>
        </div>

        {/* Contributors Welcome */}
        <p className="mt-6 text-gray-300 text-sm">
          🤝 Contributors are welcome! This is an open-source project.
        </p>

        {/* Patch Notes Box */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
          <h3 className="font-semibold mb-2">📋 Patch Notes</h3>
          <p className="text-sm text-gray-300">
            Feb 2nd: Version 1.0 is up!
          </p>
        </div>
      </div>
    </div>
  );
}

