# 🏀 U20 Basketball Manager

A roguelike basketball management game where you build and train a U20 team to win the championship. Built with Next.js 15 and TypeScript.

## 🎮 Play Now

**[Play the game here!](https://u20-basketball-manager.vercel.app)** *(Deploy to Vercel first)*

## ✨ Features

### Core Gameplay
- **14-Week Season**: 11 regular season weeks + 3 playoff rounds (Quarterfinals, Semifinals, Finals)
- **Team Management**: Build and manage a roster of 5 players (PG, SG, SF, PF, C)
- **Player Development**: Train players aged 18-21, watch them improve and eventually retire
- **Weekly Actions**: 3 actions per week - train, scout, rest, buy/sell players, upgrade facilities, learn tactics
- **Game Simulation**: Play against AI opponents with realistic basketball mechanics

### Advanced Systems
- **Unique Player Avatars**: 2.2+ billion possible combinations with procedurally generated faces
- **Chemistry System**: 7 personality traits with LIKE/DISLIKE relationships affecting team performance
- **Progression System**: Unlock new skills, tactics, and bonuses that persist across seasons
- **Facilities**: Upgrade Training Center, Medical Facility, and Stadium for permanent bonuses
- **Achievements**: 30+ achievements to unlock
- **Hall of Fame**: Track your championship teams across multiple seasons
- **Difficulty Modes**: Easy, Normal, and Hard with different opponent scaling

### Player Stats
Each player has 6 core attributes (1-20 scale):
- **Outside Offense** - Three-point shooting and perimeter scoring
- **Inside Offense** - Post moves, layups, and paint scoring
- **Outside Defense** - Perimeter defense and steals
- **Inside Defense** - Rim protection and rebounding
- **Passing** - Assists and ball movement
- **Athleticism** - Speed, jumping, and overall physical ability

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/guygir/u20-basketball-manager.git
cd u20-basketball-manager

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

### Building for Production

```bash
npm run build
npm start
```

## 🎯 How to Play

1. **Create Your Team**: Choose a team name and difficulty level
2. **Manage Your Roster**: You start with 5 randomly generated 18-year-old players
3. **Weekly Actions**: Each week, choose 3 actions:
   - **Train General**: Improve 4 random attributes for a player
   - **Train Focused**: Improve 1 specific attribute significantly
   - **Rest**: Reduce team fatigue
   - **Scout Opponent**: Reveal next opponent's stats and tactics
   - **Public Relations**: Earn extra coins
   - **Buy Player**: Purchase players from the marketplace
   - **Sell Player**: Sell a player for coins
   - **Purchase Tactic**: Learn new tactical plays
   - **Upgrade Facility**: Improve Training Center, Medical Facility, or Stadium
4. **Play Games**: Simulate games against AI opponents each week
5. **Reach Playoffs**: Win 7+ games in the regular season to qualify
6. **Win Championship**: Beat 3 playoff opponents to win the title

## 🏆 Winning Strategy

- **Balance Your Roster**: Each position has different strengths (guards = outside, centers = inside)
- **Manage Fatigue**: Rested players perform better in games
- **Scout Opponents**: Knowing their tactics helps you prepare
- **Upgrade Facilities Early**: Permanent bonuses compound over time
- **Chemistry Matters**: Compatible personalities boost team performance
- **Age Management**: Draft new 18-year-olds before your veterans retire at 21

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: localStorage (no backend required!)
- **Deployment**: Vercel

## 📊 Game Balance

### Difficulty Scaling
- **Easy**: Opponents start at avg 8.0, end at avg 14.0
- **Normal**: Opponents start at avg 8.0, end at avg 14.0 (faster progression)
- **Hard**: Opponents start at avg 9.0, end at avg 14.0 (fastest progression)

### Player Generation
- Starting players: 4-10 per stat (avg 7)
- Draft prospects: 3-9 base + potential bonus (0-3)
- Marketplace: 3-9 base + quality bonus (0-4)

## 🤝 Contributing

Contributions are welcome! This is an open-source project.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain existing code style
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is open source and available under the MIT License.

## 🎨 Credits

- Game Design & Development: Guy Girmonsky
- Built with Next.js, TypeScript, and Tailwind CSS
- Avatar system inspired by procedural generation techniques
- Chemistry system inspired by roguelike personality mechanics

## 📮 Contact

- GitHub: [@guygir](https://github.com/guygir)
- Repository: [u20-basketball-manager](https://github.com/guygir/u20-basketball-manager)

## 🔄 Version History

### v1.2.0 (February 5, 2024)
- Added team chemistry display in player modal
- Added progress indicator to main tutorial (Step X of Y)
- Changed "Play Game" to "Play Next Game" for clarity
- Removed Quick Actions section from team page
- Fixed duplicate "0" display bug in player modal
- Added patch notes section to main hub page

### v1.1.0 (February 4, 2024)
- Fixed double-aging bug in season transitions
- Added fatigue reset between seasons
- Improved tutorial flow and shortened main tutorial
- Enhanced achievements page color scheme
- Renamed "Delete Game" to "New Campaign"
- Moved "Play Game" button to top of hub page

### v1.0.0 (February 2026)
- Initial release
- Complete game loop with 14-week seasons
- Player avatars with 2.2B+ combinations
- Chemistry system with 7 personality traits
- 30+ achievements
- Hall of Fame tracking
- 3 difficulty modes
- Tutorial system

---

**Enjoy the game! 🏀**