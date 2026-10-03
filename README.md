# GPT Helper

Chrome extension that customizes and enhances the ChatGPT experience with quick prompts and additional features.

## Features

### Slash Commands (//)
- Type `//` followed by a prompt name to quickly access your saved texts
- Keyboard navigation (↑↓ to navigate, Enter/Tab to select, Esc to close)
- Incremental search by name as you type (e.g., `//res` filters prompts containing "res" in the name)

### Delete Mode
- Quick delete button to remove the current chat
- Activated/deactivated from the extension popup
- Floating trash icon that appears near the options button

### Prompt Management
- Save your favorite prompts with custom names
- Edit and delete prompts from the popup
- Prompts sync across devices with your Chrome account

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right corner)
4. Click "Load unpacked"
5. Select the project folder

## Usage

### Adding a Prompt
1. Click the extension icon
2. Type a short name for your prompt (e.g., "Summary")
3. Type the full prompt text
4. Click "Save Prompt"

### Using a Prompt
1. Go to [ChatGPT](https://chatgpt.com)
2. In the text field, type `//` followed by the prompt name
3. A menu with suggestions will appear
4. Use arrows or mouse to select and press Enter

### Activating Delete Mode
1. Click the extension icon
2. Enable the "Delete Mode" toggle
3. You'll see a trash button appear in chats
4. Click to quickly delete the current chat

## Project Structure

```
GPT-Helper/
├── manifest.json         # Extension configuration
├── content.js           # Main script injected into ChatGPT
├── popup.html           # Popup interface
├── popup.js            # Popup logic
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── templates/          # Reference HTML templates
│   ├── chatgpt.html
│   └── 3dotsupperright.html
└── README.md
```

## Technologies

- Manifest V3 (Chrome Extensions)
- Vanilla JavaScript (no dependencies)
- Chrome Storage API for synchronization

## Development

The project uses Chrome Extensions API with Manifest V3. To make changes:

1. Modify the necessary files
2. Go to `chrome://extensions/`
3. Click the extension reload icon
4. Test the changes in ChatGPT

## License

MIT
