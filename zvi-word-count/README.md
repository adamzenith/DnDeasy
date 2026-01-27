# Zvi Mowshowitz AI Posts Word Counter

A Python tool to count the total words across all of Zvi Mowshowitz's AI newsletter posts on his Substack "Don't Worry About the Vase" (thezvi.substack.com).

## Background

Zvi Mowshowitz writes what is considered one of the most comprehensive weekly AI newsletters. The series started with "AI #1: Sydney and Bing" in February 2023, covering the Bing/Sydney incident, and has continued weekly since then. As of January 2026, there are 151+ posts in the series.

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Run the scraper
python scraper.py
```

## How It Works

1. **Discovery**: Attempts to fetch all posts from Substack's undocumented archive API
2. **Fallback**: If the API is unavailable, uses a pre-compiled list of known post URLs
3. **Extraction**: Fetches each post's HTML content and extracts the article text
4. **Counting**: Counts words in the extracted text
5. **Output**: Displays a summary and saves detailed results to `results.json`

## Output

The script outputs:
- Total number of posts processed
- Total word count across all posts
- Average words per post
- Longest and shortest posts

Results are saved to `results.json` with per-post word counts.

## Notes

- The script uses rate limiting to be respectful to Substack's servers
- Some posts may be split into multiple parts (e.g., "AI #132 Part 1" and "AI #132 Part 2")
- Network restrictions may affect API access in some environments

## Sources

- [Don't Worry About the Vase - Substack](https://thezvi.substack.com/)
- [Archive](https://thezvi.substack.com/archive)
