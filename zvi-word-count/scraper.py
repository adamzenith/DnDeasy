#!/usr/bin/env python3
"""
Zvi Mowshowitz AI Posts Word Counter

Scrapes all AI posts from thezvi.substack.com and counts total words.
The AI series runs from AI #1 (February 2023) to AI #151+ (ongoing).

Usage:
    python scraper.py
"""

import requests
import re
import json
import time
import sys
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

SUBSTACK_BASE = "https://thezvi.substack.com"
API_ARCHIVE = f"{SUBSTACK_BASE}/api/v1/archive"

# Browser-like headers to avoid blocking
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

# Known AI post slugs discovered via web search (backup if API fails)
KNOWN_SLUGS = {
    1: "ai-1-sydney-and-bing",
    4: "ai-4-introducing-gpt-4",
    10: "ai-10-code-interpreter-and-george",
    11: "ai-11-in-search-of-a-moat",
    13: "ai-13-potential-algorithmic-improvements",
    14: "ai-14-a-very-good-sentence",
    21: "ai-21",
    22: "ai-22-into-the-weeds",
    24: "ai-24-week-of-the-podcast",
    25: "ai-25-inflection-point",
    31: "ai-31-it-can-do-what-now",
    40: "ai-40-a-vision-from-vitalik",
    50: "ai-50-the-most-dangerous-thing",
    58: "ai-58-stargate-agi",
    60: "ai-60-oh-the-humanity",
    61: "ai-61-meta-trouble",
    64: "ai-64-feel-the-mundane-utility",
    68: "ai-68-remarkably-reasonable-reactions",
    70: "ai-70-a-beautiful-sonnet",
    80: "ai-80-never-will-it-ever",
    84: "ai-84-better-than-a-podcast",
    86: "ai-86-just-think-of-the-potential",
    87: "ai-87-staying-in-character",
    89: "ai-89-trump-card",
    90: "ai-90-the-wall",
    97: "ai-97-4",
    98: "ai-98-world-ends-with-six-word-story",
    100: "ai-100-meet-the-new-boss",
    101: "ai-101-the-shallow-end",
    102: "ai-102-made-in-america",
    103: "ai-103-show-me-the-money",
    104: "ai-104-american-state-capacity-on",
    105: "ai-105-hey-there-alexa",
    106: "ai-106-not-so-fast",
    107: "ai-107-the-misplaced-hype-machine",
    109: "ai-109-google-fails-marketing-forever",
    110: "ai-110-of-course-you-know",
    111: "ai-111-giving-us-pause",
    112: "ai-112-release-the-everything",
    115: "ai-115-the-evil-applications-division",
    116: "ai-116-if-anyone-builds-it-everyone",
    117: "ai-117-openai-buys-device-maker-io",
    118: "ai-118-claude-ascendant",
    119: "ai-119-goodbye-aisi",
    120: "ai-120-while-o3-turned-pro",
    123: "ai-123-moratorium-moratorium",
    125: "ai-125-smooth-criminal",
    128: "ai-128-four-hours-until-probably",
    130: "ai-130-talking-past-the-sale",
    132: "ai-132-part-1-improved-ai-detection",
    133: "ai-133-america-could-use-more-energy",
    134: "ai-134-if-anyone-reads-it",
    135: "ai-135-openai-shows-us-the-money",
    136: "ai-136-a-song-and-dance",
    137: "ai-137-an-openai-app-for-that",
    138: "ai-138-part-2-watch-out-for-documents",
    139: "ai-139-the-overreach-machines",
    141: "ai-141-give-us-the-money",
    142: "ai-142-common-ground",
    143: "ai-143-everything-everywhere-all",
    144: "ai-144-thanks-for-the-models",
    145: "ai-145-youve-got-soul",
    146: "ai-146-chipping-in",
    147: "ai-147-flash-forward",
    149: "ai-149-3",
    150: "ai-150-while-claude-codes",
    151: "ai-151-while-claude-coworks",
}


def create_session() -> requests.Session:
    """Create a session with retry logic."""
    session = requests.Session()
    session.headers.update(HEADERS)
    return session


def fetch_archive_page(session: requests.Session, offset: int = 0, limit: int = 50) -> List[Dict]:
    """Fetch a page of posts from the archive API."""
    url = f"{API_ARCHIVE}?sort=new&search=&offset={offset}&limit={limit}"

    for attempt in range(3):
        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            if attempt < 2:
                time.sleep(2 ** attempt)
            else:
                print(f"Failed to fetch archive page at offset {offset}: {e}")
                return []
    return []


def fetch_all_posts_from_api(session: requests.Session) -> List[Dict]:
    """Fetch all posts from the Substack archive API."""
    all_posts = []
    offset = 0
    limit = 50

    print("Fetching posts from Substack API...")

    while True:
        posts = fetch_archive_page(session, offset, limit)
        if not posts:
            break

        all_posts.extend(posts)
        print(f"  Fetched {len(all_posts)} posts so far...")
        offset += limit
        time.sleep(0.5)  # Be polite

    return all_posts


def filter_ai_posts(posts: List[Dict]) -> List[Dict]:
    """Filter posts to only AI # series."""
    ai_pattern = re.compile(r'^AI\s*#\d+', re.IGNORECASE)
    return [p for p in posts if ai_pattern.match(p.get("title", ""))]


def extract_ai_number(title: str) -> int:
    """Extract AI post number from title."""
    match = re.search(r'AI\s*#(\d+)', title, re.IGNORECASE)
    return int(match.group(1)) if match else 0


def fetch_post_html(session: requests.Session, slug: str) -> Optional[str]:
    """Fetch HTML content of a post."""
    # Try API endpoint first
    api_url = f"{SUBSTACK_BASE}/api/v1/posts/{slug}"
    try:
        response = session.get(api_url, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("body_html", "")
    except:
        pass

    # Fallback to page scraping
    page_url = f"{SUBSTACK_BASE}/p/{slug}"
    try:
        response = session.get(page_url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Find the main article content
        article = soup.find("div", class_="body")
        if article:
            return str(article)

        # Alternative selector
        article = soup.find("article")
        if article:
            return str(article)

    except requests.RequestException:
        pass

    return None


def html_to_text(html: str) -> str:
    """Convert HTML to plain text."""
    soup = BeautifulSoup(html, "html.parser")

    # Remove script and style elements
    for element in soup(["script", "style", "nav", "footer", "header"]):
        element.decompose()

    # Get text
    text = soup.get_text(separator=" ", strip=True)

    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text)

    return text


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def process_post(session: requests.Session, post_info: Dict) -> Dict:
    """Process a single post and return word count data."""
    slug = post_info.get("slug", "")
    title = post_info.get("title", "Unknown")
    ai_num = extract_ai_number(title)

    html = fetch_post_html(session, slug)

    if html:
        text = html_to_text(html)
        word_count = count_words(text)
    else:
        word_count = 0

    return {
        "ai_number": ai_num,
        "title": title,
        "slug": slug,
        "word_count": word_count,
        "url": f"{SUBSTACK_BASE}/p/{slug}"
    }


def main():
    print("=" * 70)
    print("  Zvi Mowshowitz AI Posts Word Counter")
    print("  Counting words across all AI # posts on thezvi.substack.com")
    print("=" * 70)
    print()

    session = create_session()

    # Step 1: Try to fetch posts from API
    print("Step 1: Discovering AI posts...")
    all_posts = fetch_all_posts_from_api(session)

    if all_posts:
        ai_posts = filter_ai_posts(all_posts)
        print(f"  Found {len(ai_posts)} AI posts via API")
    else:
        # Fallback to known slugs
        print("  API unavailable, using known post list...")
        ai_posts = [{"slug": slug, "title": f"AI #{num}"}
                   for num, slug in KNOWN_SLUGS.items()]
        print(f"  Using {len(ai_posts)} known posts")

    print()

    # Sort by AI number
    ai_posts.sort(key=lambda p: extract_ai_number(p.get("title", "")))

    # Step 2: Fetch content and count words
    print("Step 2: Fetching posts and counting words...")
    print("-" * 70)

    results = []
    total_words = 0
    failed = 0

    for i, post in enumerate(ai_posts, 1):
        title = post.get("title", "Unknown")[:50]
        ai_num = extract_ai_number(post.get("title", ""))

        sys.stdout.write(f"\r[{i:3}/{len(ai_posts)}] Processing AI #{ai_num}: {title}...")
        sys.stdout.flush()

        result = process_post(session, post)

        if result["word_count"] > 0:
            results.append(result)
            total_words += result["word_count"]
            sys.stdout.write(f" {result['word_count']:,} words\n")
        else:
            failed += 1
            sys.stdout.write(f" FAILED\n")

        time.sleep(0.3)  # Rate limiting

    print("-" * 70)
    print()

    # Summary
    successful = len(results)
    avg_words = total_words // successful if successful else 0

    print("=" * 70)
    print("  RESULTS SUMMARY")
    print("=" * 70)
    print()
    print(f"  Posts processed successfully: {successful}")
    print(f"  Posts failed:                 {failed}")
    print()
    print(f"  ┌─────────────────────────────────────────────────┐")
    print(f"  │  TOTAL WORDS: {total_words:,}".ljust(51) + "│")
    print(f"  └─────────────────────────────────────────────────┘")
    print()
    print(f"  Average words per post: {avg_words:,}")
    print()

    if results:
        longest = max(results, key=lambda x: x["word_count"])
        shortest = min(results, key=lambda x: x["word_count"])

        print(f"  Longest post:  AI #{longest['ai_number']} - {longest['word_count']:,} words")
        print(f"                 {longest['title'][:60]}")
        print()
        print(f"  Shortest post: AI #{shortest['ai_number']} - {shortest['word_count']:,} words")
        print(f"                 {shortest['title'][:60]}")

    # Save detailed results
    output = {
        "summary": {
            "total_posts": successful,
            "total_words": total_words,
            "average_words_per_post": avg_words,
            "failed_posts": failed,
        },
        "posts": sorted(results, key=lambda x: x["ai_number"])
    }

    with open("results.json", "w") as f:
        json.dump(output, f, indent=2)

    print()
    print("  Detailed results saved to: results.json")
    print()

    return total_words


if __name__ == "__main__":
    main()
