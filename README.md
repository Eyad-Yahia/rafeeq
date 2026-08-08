# rafeeq-a11y

![npm version](https://img.shields.io/npm/v/rafeeq-a11y) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg) ![Bundle Size](https://img.shields.io/bundlephobia/minzip/rafeeq-a11y) ![Downloads](https://img.shields.io/npm/dm/rafeeq-a11y)

A React library that adds a smart accessibility widget to your web applications, making them inclusive for all users without requiring you to alter your core design.

## Overview

An extensible accessibility widget featuring a plugin system for custom actions and provider injection for AI-driven voice commands. Includes full RTL and i18n support natively.

## Features

- **Visual Adjustments:** Text resize, dyslexia-friendly fonts, legible fonts, contrast toggles (invert, monochrome, high contrast), and a cursor magnifier.
- **Reading Assists:** Reading mask to reduce distractions, and a reading ruler to help track lines.
- **Navigation & Media:** Focus ring for keyboard users, plus toggles to pause animations and hide images.
- **Smart Control:** Built-in Text-to-Speech (TTS) screen reader and voice command support that can map user intents to actions via AI.

## Installation

Install using your preferred package manager:

```bash
npm install rafeeq-a11y
# or
yarn add rafeeq-a11y
# or
pnpm add rafeeq-a11y
```

## Quick Start

The quickest way to get started is by simply rendering the `AccessibilityWidget` component anywhere in your app. It works entirely out-of-the-box.

```tsx
import React from 'react';
import { AccessibilityWidget } from 'rafeeq-a11y';
import 'rafeeq-a11y/styles.css';

function App() {
  return (
    <div className="my-app-content">
      {/* Your app content goes here */}
      <h1>Welcome to our inclusive website</h1>
      
      {/* Simply drop the widget anywhere */}
      <AccessibilityWidget />
    </div>
  );
}

export default App;
```

## Advanced Usage

> **Two integration options**
> - **Recommended:** Use `<AccessibilityWidget />` directly for a plug-and-play experience.
> - **Advanced:** Use `AccessibilityProvider` and `useAccessibility` to build a fully custom accessibility interface.

To get the most out of the library, you can pass your own providers for AI logic or inject custom plugins directly to the widget.

### AI Provider (Voice Commands)

You can enable natural language processing for voice commands by passing an AI Provider. You are responsible for the privacy policy of the third-party LLM you choose.

```tsx
import { AccessibilityWidget, AIProvider, AIParsedResponse } from 'rafeeq-a11y';

const myAIProvider: AIProvider = {
  parseCommand: async (command, context, lang) => {
    // Forward the sanitized command to your backend which talks to OpenAI or another LLM
    const response = await fetch('/api/my-ai-parser', {
      method: 'POST',
      body: JSON.stringify({ command, context, lang })
    });
    return response.json() as Promise<AIParsedResponse>;
  }
};

function App() {
  return (
    <div className="my-app-content">
      <AccessibilityWidget aiProvider={myAIProvider} />
    </div>
  );
}
```

### Custom Plugins

You can add buttons that execute your own application-specific logic.

```tsx
import { AccessibilityPlugin } from 'rafeeq-a11y';
import { Shield } from 'lucide-react';

const myCustomPlugin: AccessibilityPlugin = {
  id: 'hide_ads',
  icon: <Shield />,
  title: (t) => "Hide Ads",
  action: (state) => {
    // Your custom logic
    document.querySelectorAll('.ad-banner').forEach(ad => ad.remove());
  },
  isActive: (state) => false
};

function App() {
  return (
    <div className="my-app-content">
      <AccessibilityWidget plugins={(state) => [myCustomPlugin]} />
    </div>
  );
}
```

## API Reference

Here are the primary props accepted by `AccessibilityWidget`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `triggerPosition` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left' \| 'middle-right' \| 'middle-left'` | `'bottom-right'` | Placement of the floating trigger button. |
| `triggerColor` | `string` | `'#059669'` | Background color of the trigger button. |
| `triggerSize` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the trigger button. |
| `direction` | `'ltr' \| 'rtl' \| 'auto'` | `'auto'` | Text direction for the widget UI. |
| `translations` | `Partial<Translations>` | - | Override default text strings for localization. |
| `aiProvider` | `AIProvider` | - | Custom AI provider for parsing voice commands. |
| `ttsProvider` | `TTSProvider` | - | Custom Text-to-Speech provider for the screen reader. |

> **Architecture Note:** `AccessibilityWidget` is designed as a standalone "plug-and-play" component. It internally sets up its own `AccessibilityProvider` and injects necessary CSS variables to the document root, meaning you don't need to wrap your entire application in a provider manually.

## Customization

It's easy to adjust the widget's appearance:

```tsx
<AccessibilityWidget 
  triggerPosition="middle-left" 
  triggerColor="#ff5722" 
  triggerSize="large" 
/>
```

> **Note on CSS Isolation:** The widget uses a targeted CSS reset to prevent host styles (like fonts and colors) from bleeding into the widget interface. However, **CSS Custom Properties (Variables)** inherited from the `:root` or parent elements are not reset by default. If your host application heavily uses CSS variables that clash with Tailwind's internal variables, they may occasionally leak into the widget. This is a known technical limitation accepted to avoid the heavy complexities of Shadow DOM in React portals.

## Browser Support

| Browser | Voice Commands (SpeechRecognition) | Screen Reader (SpeechSynthesis) |
|---|---|---|
| Chrome/Edge | ✅ Supported (requires Webkit prefix) | ✅ Supported |
| Safari | ✅ Supported | ✅ Supported |
| Firefox | ❌ Requires enabling internal flags | ✅ Supported |

*Visual and structural features work across all modern browsers.*

## Local Development

The repository includes a live demo application located in the `demo/` folder.

To run the local development environment:

1. Install dependencies in the root directory:
   ```bash
   npm install
   ```
2. Start the development environment:
   ```bash
   npm run dev
   ```

This command concurrently watches the library source and runs the demo development server.

## SSR Compatibility

Rafeeq is SSR-compatible and has been tested with a server-side rendering smoke test.

## Contributing

Contributions are always welcome. Feel free to open issues or pull requests directly on the repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built using these excellent open-source tools:
- React and Tailwind CSS
- Framer Motion
- Lucide React
