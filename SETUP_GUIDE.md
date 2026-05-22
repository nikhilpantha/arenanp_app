# PlayArena - Gaming Dashboard App

## Project Setup

This is an Expo project with **Tailwind CSS** integration using **NativeWind**. It features a gaming dashboard UI design.

### What's Included

✅ **Expo Setup** - React Native development framework
✅ **Tailwind CSS** - Utility-first styling with NativeWind
✅ **Gaming Dashboard UI** - Professional play/gaming dashboard design
✅ **Responsive Layout** - Works on all screen sizes

### Project Structure

```
app/
├── App.js                 # Main app component with gaming dashboard UI
├── global.css             # Tailwind CSS imports
├── tailwind.config.js     # Tailwind configuration
├── babel.config.js        # Babel config with NativeWind support
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── assets/               # Images and static assets
```

### Installation

All dependencies are already installed! Just run:

```bash
cd app
```

### Running the App

#### For Web (Fastest way to test):

```bash
npm run web
```

#### For iOS (requires Mac):

```bash
npm run ios
```

#### For Android:

```bash
npm run android
```

#### Using Expo Go App:

1. Install Expo Go from App Store / Play Store
2. Run: `npm start`
3. Scan QR code with your phone

### Dashboard Features

- **Header Section** - Welcome message with user level, points & streak
- **Featured Game** - Highlighted game with call-to-action
- **Popular Games** - Grid of sports/games (Football, Basketball, Archery, etc.)
- **Leaderboard** - Top players ranking with your position
- **Daily Challenges** - Gamified tasks with XP rewards
- **Upcoming Events** - Tournaments and competitions
- **Bottom Navigation** - Home, Games, Rewards, Settings tabs

### Customization

#### Colors

Edit `tailwind.config.js` to customize:

```js
colors: {
  primary: "#FF6B35",      // Orange accent
  secondary: "#004E89",    // Blue dark
  dark: "#1A1A2E",         // Background
  light: "#F5F5F5",        // Light text
}
```

#### Adding Components

Create new component files and import them in `App.js`:

```js
import GameCard from "./components/GameCard";
```

#### Styling

Use Tailwind classes directly:

```jsx
<View className="bg-primary rounded-lg p-4">
  <Text className="text-white font-bold">Text</Text>
</View>
```

### Dependencies

- `expo` - Framework
- `react-native` - Mobile framework
- `react-native-safe-area-context` - Safe area handling
- `nativewind` - Tailwind CSS for React Native
- `tailwindcss` - Styling framework

### Tips

1. **Hot Reload** - Save files and the app updates automatically
2. **Debugging** - Use React DevTools or Expo DevTools
3. **Assets** - Add images to `assets/` folder and import them
4. **Navigation** - Currently using tab-based navigation (can integrate React Navigation)

### Next Steps

- Add React Navigation for page routing
- Connect to backend API
- Add more game categories
- Implement user authentication
- Add push notifications

### Support

For Expo docs: https://docs.expo.dev
For Tailwind: https://tailwindcss.com
For NativeWind: https://www.nativewind.dev
