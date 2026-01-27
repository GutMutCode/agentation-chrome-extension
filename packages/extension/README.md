# Agentation

Annotate webpage elements and generate structured feedback for AI coding agents.

Agentation is a developer tool designed to visually annotate webpage elements and generate structured feedback that AI coding agents can use to identify and modify code precisely.

## Features

- Element Highlighting: Displays CSS selectors when hovering over webpage elements.
- Click Annotations: Add feedback to specific elements via a popover UI.
- CSS Selector Extraction: Automatically extracts precise selectors to help AI agents locate code.
- Markdown Output: Formats all annotations into a structured Markdown report for the clipboard.
- Animation Control: Pause CSS animations to capture specific frames.
- Marker Visibility: Toggle the display of annotation markers on the page.
- Customization: Adjust marker colors and output detail levels in the settings.

## Installation

To install Agentation as a Chrome extension:

1. Clone this repository to your local machine.
2. Open the Google Chrome browser.
3. Navigate to `chrome://extensions`.
4. Enable Developer mode by toggling the switch in the top right corner.
5. Click the Load unpacked button.
6. Select the directory containing the cloned repository.

## Usage Guide

1. Click the Agentation icon in the bottom right corner of any webpage to expand the toolbar.
2. Click the Activation button to enable annotation mode.
3. Click on any element on the webpage to open the annotation popover and enter your feedback.
4. Click the Copy button in the toolbar to generate and copy the Markdown report to your clipboard.
5. Paste the report into your AI coding agent's interface.

## Use Case with AI Agents

Agentation is optimized for use with AI coding tools such as Claude Code, Cursor, and Windsurf. Instead of providing vague descriptions like "the blue button in the sidebar," you can provide exact CSS selectors like `.sidebar > .nav-actions > button.primary`. This precision allows AI agents to search your codebase and implement changes more accurately.

## Project Structure

- `background/`: Contains the background service worker for state management and tab-specific data storage.
- `content/`: Contains the core logic and styles injected into webpages for highlighting and UI.
- `popup/`: Contains the HTML, JS, and CSS for the extension's browser action popup.
- `icons/`: Contains the extension icons in various sizes.

## Privacy Note

Agentation respects your privacy. All data is stored locally within your browser using `chrome.storage.local`. No data is transmitted to external servers. Annotations are maintained during your browser session and are cleared when the tab is closed.

## License

MIT
