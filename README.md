# Friendship Bracelet String Length Calculator

A web-based calculator that estimates string lengths needed for friendship bracelets based on BraceletBook.com normal patterns.

## About

This tool analyzes SVG pattern files from BraceletBook.com and calculates the estimated string lengths needed for each color, accounting for:
- Start length (loop/buckle)
- End length (ties)
- Safety buffer
- Number of knots made in the pattern

## Architecture

This project is built as a Cloudflare Worker that:
1. **Serves the static UI** (index.html) from the worker
2. **Proxies BraceletBook requests** through `/api/proxy` to avoid CORS issues
   - Only allows requests to `braceletbook.com`
   - Only proxies pattern SVG files from `/media/patterns/` paths
   - Adds appropriate CORS headers for the frontend to consume the SVG data

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your Cloudflare account:
   ```bash
   npx wrangler login
   ```

### Development

Run the local development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8787`. The proxy will work locally as well, routing requests through the local development server.

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

To preview without deploying:
```bash
npm run preview
```

## Features

- 📊 Calculates string length for each color in the pattern
- 🎨 Visual color swatches matching the pattern
- 📐 Pattern visualization embedded from BraceletBook
- 🔄 Toggle between inches and centimeters
- 👁️ View strings in pattern order or grouped by color
- ✅ Checkbox selection for easy reference

## How to Use

1. Paste a BraceletBook.com normal pattern URL (e.g., `https://www.braceletbook.com/patterns/normal/199552/`)
2. Adjust the parameters (start, end, buffer lengths) as needed
3. Click "Calculate Lengths"
4. View the results in your preferred units
5. The pattern will display below the results

## Formula

The calculator uses the following formula:
```
String Length = Base Length + (Number of Knots / Total Rows) × Bracelet Length
```

Where:
- **Base Length** = Start Length + End Length + Safety Buffer
- **Number of Knots** = Total knots made with that color string
- **Total Rows** = Number of rows in the pattern
- **Bracelet Length** = Desired total circumference of the finished bracelet

## Project Structure

```
friendship-bracelet-string-lengths/
├── index.html           # Main HTML file with UI and calculation logic
├── package.json         # Node.js dependencies and scripts
├── wrangler.jsonc       # Cloudflare Workers configuration
├── src/
│   └── index.js         # Worker script (handles routing and proxy)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## API Routes

### GET `/api/proxy`

Proxies requests to BraceletBook.com pattern SVG files.

**Query Parameters:**
- `url` (required): The full URL to the BraceletBook pattern SVG file

**Security:**
- Only allows requests to `braceletbook.com`
- Only proxies URLs containing `/media/patterns/` and ending with `pattern.svg`
- Returns 403 Forbidden for any other requests

**Response:**
- Returns the SVG content with CORS headers set to `*` and caching for 24 hours
- Returns JSON error responses for validation failures

**Example:**
```
GET /api/proxy?url=https://www.braceletbook.com/media/patterns/000/000/199/552/000000199552/pattern.svg
```

## References

- [BraceletBook.com](https://www.braceletbook.com/)
- [String Length Calculation Tutorial](https://www.braceletbook.com/tutorials/173_how-to-calculate-string-length-in-a-normal-pattern/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## Credits

Formula and calculation method based on [halokiwi's tutorial](https://www.braceletbook.com/tutorials/173_how-to-calculate-string-length-in-a-normal-pattern/) on calculating string lengths on BraceletBook.com.
