# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese-language Jekyll blog focused on iOS development topics. The blog is titled "iOS 开发栈" (iOS Development Stack) and covers ObjC, Swift, Xcode, SwiftUI, CoreData, Runtime, Runloop, memory management, and multithreading.

## Development Commands

```bash
# Install dependencies
bundle install

# Start development server (serves at http://localhost:4000)
bundle exec jekyll serve

# Build for production
bundle exec jekyll build
```

**Important**: Changes to `_config.yml` require restarting the Jekyll server.

## Architecture

### Jekyll Structure

- **`_posts/`** - Blog posts in Markdown with Jekyll naming convention: `YYYY-MM-DD-title.md`
- **`_data/`** - Jekyll data files (contains `author.yml`)
- **`images/`**, **`assets/`** - Static assets for posts
- **`_site/`** - Generated site output (temporary, gitignored)
- **`.jekyll-cache/`** - Jekyll build cache (temporary, gitignored)

### Post Front Matter

Posts use this front matter structure:
```yaml
---
layout: post
title: Article title
categories: category-name
date: YYYY-MM-DD HH:mm:ss +0800
permalink: /custom-path/
---
```

### Content Categories

Common categories used: 源码分析, Swift, SwiftUI, UI, XCTest, Xcode, iOS, 其他, 广告集成, 性能优化, 本地化, 系统设计, 计算机基础, 读书

## Configuration

- **Theme**: Minima (native Jekyll theme)
- **Plugins**: jekyll-feed (RSS), jemoji (emoji support)
- **Search**: Enabled with custom heading_level: 2
- **Google Analytics**: G-FCRKWMERDZ with IP anonymization

Author info in `_data/author.yml`:
- Name: 施治昂
- Email: shizhiang@126.com
- GitHub: jacob-sheldon
- Twitter: @shizhiang1
