# Quán 340 - Coffee Shop Management System

A web-based management system for "Quán 340" coffee shop, allowing menu display and order management.

## Features

- **Menu display** with categorized products
- **Order management** with:
  - Customer orders with product selection
  - Customer name tracking
  - Payment status (paid or debt)
  - Order history and management
- **Promotion system** with code "NguoiQuen" for 50% discount
- **Data persistence** with:
  - GitHub Gist storage integration
  - Local backup with localStorage
- **Reporting** with Excel export capability

## GitHub Storage Integration

This application can store data directly to GitHub Gists, allowing you to:
- Save orders and menu data to your GitHub account
- Access your data from any device
- Keep a history of all changes
- Easily restore data when needed

### Setting Up GitHub Storage

1. **Create a GitHub Personal Access Token**:
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give your token a descriptive name (e.g., "Quan340 App")
   - Select the "gist" scope only
   - Click "Generate token"
   - **Copy the token** immediately (you won't be able to see it again!)

2. **Configure the App**:
   - In the admin panel, click the "GitHub" button in the top-right corner
   - Enter your GitHub username
   - Paste your personal access token
   - Click "Save configuration"
   - Test the connection by clicking "Test Connection"

3. **Using GitHub Storage**:
   - After configuration, data will be automatically saved to GitHub Gists when:
     - Orders are submitted
     - You export data
     - You manually sync data
   - You can view, load, and delete stored files from the "Manage Files" section

### Troubleshooting

- If you see "Connection failed" errors, check that your token has the "gist" scope
- If data isn't syncing, check your internet connection
- You can always use the local storage fallback by clicking "GitHub" and checking "Use Local Storage Only"

## Deployment

This application is designed to work with GitHub Pages hosting. It uses client-side storage (localStorage and GitHub Gists) to store data, so no server-side code is required.

## Development

To modify this application:

1. Clone the repository
2. Make your changes
3. Push to GitHub
4. Deploy to GitHub Pages

## License

MIT License 