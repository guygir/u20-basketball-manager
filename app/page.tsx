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
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mt-8 text-left">
          <h3 className="font-semibold mb-4 text-center text-lg">📋 Latest Updates</h3>
          
          {/* v1.2.0 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-blue-300">v1.2.0</span>
              <span className="text-xs text-gray-400">February 5, 2024</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1 ml-4">
              <li>• Added team chemistry display in player modal</li>
              <li>• Added progress indicator to main tutorial (Step X of Y)</li>
              <li>• Changed "Play Game" to "Play Next Game" for clarity</li>
              <li>• Removed Quick Actions section from team page</li>
              <li>• Fixed duplicate "0" display bug in player modal</li>
            </ul>
          </div>

          {/* v1.1.0 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-blue-300">v1.1.0</span>
              <span className="text-xs text-gray-400">February 4, 2024</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1 ml-4">
              <li>• Fixed double-aging bug in season transitions</li>
              <li>• Added fatigue reset between seasons</li>
              <li>• Improved tutorial flow and shortened main tutorial</li>
              <li>• Enhanced achievements page color scheme</li>
              <li>• Renamed "Delete Game" to "New Campaign"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

